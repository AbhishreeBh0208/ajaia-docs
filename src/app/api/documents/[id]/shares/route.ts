
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentAccess, canShare } from "@/lib/permissions";
import { ShareRole } from "@prisma/client";

type Context = {
  params: Promise<{ id: string }>;
};

// GET: List document collaborators.
export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);

    if (!access) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const collaborators = await prisma.documentShare.findMany({
      where: { documentId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      owner: await prisma.user.findUnique({
        where: { id: access.document.ownerId },
        select: { id: true, name: true, email: true },
      }),
      collaborators,
    });
  } catch (error) {
    console.error("GET shares error:", error);
    return NextResponse.json(
      { error: "Unable to load collaborators" },
      { status: 500 }
    );
  }
}

// POST: Invite or update a collaborator.
export async function POST(
  request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);

    if (!access || !canShare(access.role)) {
      return NextResponse.json(
        { error: "Only the document owner can manage sharing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = body.role;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (role !== "VIEWER" && role !== "EDITOR") {
      return NextResponse.json(
        { error: "Role must be VIEWER or EDITOR" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "No Ajaia account exists with this email" },
        { status: 404 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "You already own this document" },
        { status: 400 }
      );
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: targetUser.id,
        },
      },
      update: {
        role: role as ShareRole,
      },
      create: {
        documentId: id,
        userId: targetUser.id,
        role: role as ShareRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Access granted successfully", share },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST shares error:", error);
    return NextResponse.json(
      { error: "Unable to share document" },
      { status: 500 }
    );
  }
}

// DELETE: Revoke collaborator access.
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);

    if (!access || !canShare(access.role)) {
      return NextResponse.json(
        { error: "Only the document owner can revoke access" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const userId =
      typeof body.userId === "string" ? body.userId : "";

    if (!userId || userId === user.id) {
      return NextResponse.json(
        { error: "Invalid collaborator" },
        { status: 400 }
      );
    }

    const result = await prisma.documentShare.deleteMany({
      where: {
        documentId: id,
        userId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Access revoked successfully",
    });
  } catch (error) {
    console.error("DELETE shares error:", error);
    return NextResponse.json(
      { error: "Unable to revoke access" },
      { status: 500 }
    );
  }
}
