
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
};

function paragraph(text: string): TipTapNode {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : [],
  };
}

function parseMarkdown(markdown: string): TipTapNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: TipTapNode[] = [];
  let listItems: TipTapNode[] = [];
  let listType: "bulletList" | "orderedList" | null = null;

  function flushList() {
    if (listType && listItems.length) {
      nodes.push({
        type: listType,
        content: listItems,
      });
    }

    listItems = [];
    listType = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,2})\s+(.+)$/);

    if (heading) {
      flushList();
      nodes.push({
        type: "heading",
        attrs: { level: heading[1].length },
        content: [{ type: "text", text: heading[2] }],
      });
      continue;
    }

    const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (bullet || ordered) {
      const nextType = bullet ? "bulletList" : "orderedList";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;

      listItems.push({
        type: "listItem",
        content: [paragraph((bullet || ordered)![1])],
      });
      continue;
    }

    flushList();
    nodes.push(paragraph(trimmed));
  }

  flushList();

  return nodes.length ? nodes : [paragraph("")];
}

function parsePlainText(text: string): TipTapNode[] {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.length
    ? blocks.map((block) => paragraph(block.replace(/\n/g, " ")))
    : [paragraph("")];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a file to import." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must not exceed 5 MB." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension || !["txt", "md", "docx"].includes(extension)) {
      return NextResponse.json(
        { error: "Only TXT, Markdown (.md), and DOCX files are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable text was found in this file." },
        { status: 400 }
      );
    }

    const content: TipTapNode[] =
      extension === "md"
        ? parseMarkdown(extractedText)
        : parsePlainText(extractedText);

    const title =
      fileName.replace(/\.(txt|md|docx)$/i, "").trim() ||
      "Imported document";

    const document = await prisma.document.create({
      data: {
        title: title.slice(0, 120),
        content: {
          type: "doc",
          content,
        } as Prisma.InputJsonValue,
        ownerId: user.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    return NextResponse.json(
      {
        message: "Document imported successfully.",
        document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document import error:", error);

    return NextResponse.json(
      { error: "Unable to import this document." },
      { status: 500 }
    );
  }
}
