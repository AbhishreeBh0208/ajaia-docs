
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDocumentAccess,
  canEdit,
} from "@/lib/permissions";

const updateSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),

    content: z
      .object({
        type: z.literal("doc"),
        content: z.array(z.unknown()),
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined,
    {
      message: "Nothing to update.",
    }
  );

type Context = {
  params: Promise<{ id: string }>;
};

// GET: Retrieve a document.
export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const access = await getDocumentAccess(id, user.id);

    if (!access) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document: access.document,
      role: access.role,
    });
  } catch (error) {
    console.error("GET document error:", error);

    return NextResponse.json(
      { error: "Unable to fetch document." },
      { status: 500 }
    );
  }
}

// PATCH: Update document title or content.
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify document access.
    const access = await getDocumentAccess(id, user.id);

    if (!access) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Owners and editors can modify documents.
    if (!canEdit(access.role)) {
      return NextResponse.json(
        {
          error: "You only have permission to view this document.",
        },
        { status: 403 }
      );
    }

    // Validate incoming JSON.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid document update.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Construct Prisma update data.
    const updateData: Prisma.DocumentUpdateInput = {};

    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }

    if (parsed.data.content !== undefined) {
      updateData.content =
        parsed.data.content as Prisma.InputJsonValue;
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      document,
      message: "Document updated successfully.",
    });
  } catch (error) {
    console.error("PATCH document error:", error);

    return NextResponse.json(
      { error: "Unable to update document." },
      { status: 500 }
    );
  }
}

// DELETE: Only the document owner can delete.
export async function DELETE(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const access = await getDocumentAccess(id, user.id);

    if (!access) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (access.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Only the document owner can delete this document.",
        },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE document error:", error);

    return NextResponse.json(
      { error: "Unable to delete document." },
      { status: 500 }
    );
  }
}
