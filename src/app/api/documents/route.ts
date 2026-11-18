
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
});

const emptyContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { shares: { some: { userId: user.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        shares: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      documents: documents.map((doc) => ({
        ...doc,
        access: doc.ownerId === user.id
          ? "OWNER"
          : doc.shares[0]?.role ?? "VIEWER",
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch documents." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid document title." },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title: parsed.data.title || "Untitled document",
        content: emptyContent,
        ownerId: user.id,
      },
    });

    return NextResponse.json(
      { document },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to create document." },
      { status: 500 }
    );
  }
}
