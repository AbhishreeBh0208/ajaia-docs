
import { Suspense } from "react";
import type { JSONContent } from "@tiptap/core";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getDocumentAccess } from "@/lib/permissions";
import DocumentEditor from "@/components/editor/document-editor";

type Props = {
  params: Promise<{ id: string }>;
};

async function DocumentContent({ params }: Props) {
  await connection();

  const { id } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getDocumentAccess(id, user.id);

  if (!access) {
    notFound();
  }

  return (
    <DocumentEditor
      document={{
        id: access.document.id,
        title: access.document.title,
        content: (access.document.content ?? {
          type: "doc",
          content: [{ type: "paragraph" }],
        }) as JSONContent,
      }}
      role={access.role}
      userName={user.name}
    />
  );
}

export default function DocumentPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
          <p className="text-sm text-gray-500">
            Loading your document...
          </p>
        </div>
      }
    >
      <DocumentContent params={params} />
    </Suspense>
  );
}
