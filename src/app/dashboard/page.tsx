
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/dashboard-client";

async function DashboardContent() {
  await connection();

  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { shares: { some: { userId: user.id } } },
      ],
    },
    include: {
      owner: {
        select: { name: true },
      },
      shares: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const safeDocuments = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt.toISOString(),
    access:
      doc.ownerId === user.id
        ? "OWNER"
        : doc.shares[0]?.role ?? "VIEWER",
    ownerName: doc.owner.name,
  }));

  return (
    <DashboardClient
      user={user}
      documents={safeDocuments}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
          <div className="text-sm text-gray-500">
            Loading your workspace...
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
