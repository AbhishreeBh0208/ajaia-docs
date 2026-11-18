
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  FolderOpen,
  Users,
  Clock,
  LogOut,
  ChevronDown,
  FilePlus2,
  Upload,
  Loader2,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
};

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
  access: string;
  ownerName: string;
};

type Props = {
  user: User;
  documents: DocumentItem[];
};

const demoAccounts = [
  { name: "Alex Morgan", email: "alex@ajaia.demo" },
  { name: "Jordan Lee", email: "jordan@ajaia.demo" },
  { name: "Taylor Smith", email: "taylor@ajaia.demo" },
];

export default function DashboardClient({
  user,
  documents,
}: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "owned") {
        return doc.access === "OWNER";
      }

      if (activeTab === "shared") {
        return doc.access !== "OWNER";
      }

      if (activeTab === "recent") {
        return true;
      }

      return true;
    });
  }, [documents, search, activeTab]);

  async function createDocument() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled document",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create document");
      }

      router.push(`/document/${data.document.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function switchAccount(email: string) {
    setSwitching(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Could not switch account");
      }

      router.refresh();
    } catch {
      setError("Unable to switch account.");
    } finally {
      setSwitching(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
const [importing, setImporting] = useState(false);

async function importDocument(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  // Allow selecting the same file again later.
  event.target.value = "";

  if (!file) return;

  setImporting(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/documents/import", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not import document.");
    }

    router.push(`/document/${data.document.id}`);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while importing."
    );
  } finally {
    setImporting(false);
  }
}

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-gray-900">

      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-xl bg-[#172b4d] p-2.5 text-white">
            <FileText size={22} />
          </div>
          <span className="text-xl font-bold">Ajaia Docs</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
  <input
    ref={fileInputRef}
    type="file"
    accept=".txt,.md,.docx"
    className="hidden"
    onChange={importDocument}
  />

  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    disabled={importing}
    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
  >
    {importing ? (
      <Loader2 size={17} className="animate-spin" />
    ) : (
      <Upload size={17} />
    )}
    {importing ? "Importing..." : "Import document"}
  </button>

  <button
    onClick={createDocument}
    disabled={loading || importing}
    className="flex items-center gap-2 rounded-xl bg-[#172b4d] px-5 py-3 text-sm font-medium text-white hover:bg-[#263f69] disabled:opacity-60"
  >
    <Plus size={17} />
    {loading ? "Creating..." : "Create document"}
  </button>
</div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {[
            { id: "all", label: "All documents", icon: FolderOpen },
            { id: "owned", label: "My documents", icon: FileText },
            { id: "shared", label: "Shared with me", icon: Users },
            { id: "recent", label: "Recent", icon: Clock },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  activeTab === item.id
                    ? "bg-blue-50 font-semibold text-[#284d8d]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Signed in as
          </p>
          <p className="mt-2 font-medium">{user.name}</p>
          <p className="truncate text-xs text-gray-500">{user.email}</p>

          <button
            onClick={logout}
            className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 md:px-10">
          <div>
            <h1 className="text-lg font-semibold">My workspace</h1>
            <p className="text-sm text-gray-500">
              Create, organize and share your work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={user.email}
                disabled={switching}
                onChange={(e) => switchAccount(e.target.value)}
                className="max-w-48 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm"
              >
                {demoAccounts.map((account) => (
                  <option key={account.email} value={account.email}>
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-2.5 text-gray-400"
                size={15}
              />
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8edf7] text-sm font-semibold text-[#284d8d]">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl p-5 md:p-10">
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Documents
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your team&apos; documents, all in one place.
              </p>
            </div>

            <button
              onClick={createDocument}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#172b4d] px-5 py-3 text-sm font-medium text-white hover:bg-[#263f69] disabled:opacity-60"
            >
              <Plus size={17} />
              {loading ? "Creating..." : "Create document"}
            </button>
          </div>

          {error && (
            <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mb-7 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Search size={19} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your documents..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              {activeTab === "shared"
                ? "Shared with me"
                : activeTab === "owned"
                ? "My documents"
                : activeTab === "recent"
                ? "Recent documents"
                : "All documents"}
            </h3>
            <span className="text-sm text-gray-400">
              {filteredDocuments.length} documents
            </span>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="mb-4 rounded-2xl bg-gray-100 p-4">
                <FilePlus2 size={30} className="text-gray-500" />
              </div>

              <h3 className="font-semibold text-gray-800">
                {search
                  ? "No matching documents"
                  : "Your workspace is ready"}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {search
                  ? "Try another search term."
                  : "Create your first document and start bringing your ideas together."}
              </p>

              {!search && (
                <button
                  onClick={createDocument}
                  className="mt-5 rounded-lg bg-[#172b4d] px-5 py-2.5 text-sm font-medium text-white"
                >
                  Create your first document
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="group rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-xl bg-blue-50 p-3 text-[#3459a5]">
                      <FileText size={22} />
                    </div>

                    <span className={`rounded-full px-2.5 py-1 text-xs ${
                      doc.access === "OWNER"
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {doc.access === "OWNER"
                        ? "Owned"
                        : doc.access === "EDITOR"
                        ? "Editor"
                        : "Viewer"}
                    </span>
                  </div>

                  <h4 className="truncate font-semibold text-gray-900 group-hover:text-[#3459a5]">
                    {doc.title}
                  </h4>

                  <p className="mt-2 text-xs text-gray-500">
                    {doc.access === "OWNER"
                      ? "Owned by you"
                      : `Shared by ${doc.ownerName}`}
                  </p>

                  <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-400">
                    Edited {formatDate(doc.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
