
import { prisma } from "@/lib/prisma";
import { ShareRole } from "@prisma/client";

export type AccessRole = "OWNER" | ShareRole;

export async function getDocumentAccess(
  documentId: string,
  userId: string
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!document) return null;

  if (document.ownerId === userId) {
    return {
      document,
      role: "OWNER" as const,
    };
  }

  const share = document.shares[0];

  if (!share) return null;

  return {
    document,
    role: share.role,
  };
}

export function canEdit(role: AccessRole): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canShare(role: AccessRole): boolean {
  return role === "OWNER";
}
