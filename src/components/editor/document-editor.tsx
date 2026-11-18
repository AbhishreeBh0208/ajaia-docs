
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Loader2,
  Check,
  AlertCircle,
  FileText,
  Share2,
  X,
  Mail,
  Users,
  Copy,
  Trash2,
  ChevronDown,
} from "lucide-react";

type DocumentData = {
  id: string;
  title: string;
  content: JSONContent;
};

type Props = {
  document: DocumentData;
  role: "OWNER" | "EDITOR" | "VIEWER";
  userName: string;
};

type Collaborator = {
  id?: string;
  userId: string;
  name: string;
  email: string;
  role: "EDITOR" | "VIEWER";
};

type RawCollaborator = {
  id?: string;
  userId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  name?: string;
  email?: string;
  role?: string;
};

type OwnerInfo = {
  name: string;
  email?: string;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  editable: boolean;
};

function toolClass(active: boolean) {
  return `rounded-lg p-2 transition ${
    active
      ? "bg-blue-100 text-blue-700"
      : "text-gray-600 hover:bg-gray-100"
  }`;
}

// Declared outside DocumentEditor to prevent component recreation during render.
function ToolbarButton({
  label,
  active,
  onClick,
  children,
  editable,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      disabled={!editable}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`${toolClass(!!active)} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function DocumentEditor({
  document,
  role,
  userName,
}: Props) {
  const router = useRouter();

  const editable = role !== "VIEWER";
  const isOwner = role === "OWNER";

  const [title, setTitle] = useState(document.title);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const [content, setContent] = useState<JSONContent>(document.content);

  // Sharing dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({
    name: userName,
  });
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharingAction, setSharingAction] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const firstContentUpdate = useRef(true);
  const firstTitleUpdate = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
    ],
    content: document.content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
  });

  // Automatically save editor content.
  useEffect(() => {
    if (!editable) return;

    if (firstContentUpdate.current) {
      firstContentUpdate.current = false;
      return;
    }

    setStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Save failed");
        }

        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, document.id, editable]);

  // Automatically save document title.
  useEffect(() => {
    if (!editable) return;

    if (firstTitleUpdate.current) {
      firstTitleUpdate.current = false;
      return;
    }

    setStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });

        if (!response.ok) {
          throw new Error("Rename failed");
        }

        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title, document.id, editable]);

  // Load collaborators when the sharing dialog is opened.
  async function loadCollaborators() {
    setLoadingShares(true);
    setShareError("");
    setShareMessage("");

    try {
      const response = await fetch(
        `/api/documents/${document.id}/shares`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Unable to load sharing details.";

        throw new Error(message);
      }

      const responseData = data as {
        collaborators?: RawCollaborator[];
        shares?: RawCollaborator[];
        document?: {
          shares?: RawCollaborator[];
          owner?: OwnerInfo;
        };
        owner?: OwnerInfo;
      };

      const rawCollaborators =
        responseData.collaborators ??
        responseData.shares ??
        responseData.document?.shares ??
        [];

      const normalized: Collaborator[] = rawCollaborators
  .map(
    (item): Collaborator => ({
      id: item.id,
      userId: item.userId ?? item.user?.id ?? "",
      name:
        item.user?.name ??
        item.name ??
        item.email ??
        "Unknown user",
      email: item.user?.email ?? item.email ?? "",
      role: item.role === "VIEWER" ? "VIEWER" : "EDITOR",
    })
  )
  .filter((item) => item.userId.length > 0);

      setCollaborators(normalized);

      const rawOwner =
        responseData.owner ?? responseData.document?.owner;

      if (rawOwner) {
        setOwnerInfo({
          name: rawOwner.name ?? userName,
          email: rawOwner.email,
        });
      } else {
        setOwnerInfo({ name: userName });
      }
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Unable to load sharing details."
      );
    } finally {
      setLoadingShares(false);
    }
  }

  function openShareDialog() {
    setShareOpen(true);
    setInviteEmail("");
    setInviteRole("EDITOR");
    setShareError("");
    setShareMessage("");
    void loadCollaborators();
  }

  function closeShareDialog() {
    if (sharingAction) return;

    setShareOpen(false);
    setShareError("");
    setShareMessage("");
  }

  // Invite a collaborator or update their role.
  async function handleInvite(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setShareError("Please enter an email address.");
      return;
    }

    setSharingAction(true);
    setShareError("");
    setShareMessage("");

    try {
      const response = await fetch(
        `/api/documents/${document.id}/shares`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role: inviteRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to share this document."
        );
      }

      setInviteEmail("");
      setShareMessage(
        data.message || "Document access updated successfully."
      );

      await loadCollaborators();
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Unable to share this document."
      );
    } finally {
      setSharingAction(false);
    }
  }

  // Change an existing collaborator's role.
  async function handleRoleChange(
    collaborator: Collaborator,
    newRole: "EDITOR" | "VIEWER"
  ) {
    setSharingAction(true);
    setShareError("");
    setShareMessage("");

    try {
      const response = await fetch(
        `/api/documents/${document.id}/shares`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: collaborator.email,
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update permissions."
        );
      }

      setShareMessage("Permissions updated successfully.");
      await loadCollaborators();
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Unable to update permissions."
      );
    } finally {
      setSharingAction(false);
    }
  }

  // Revoke a collaborator's access.
  async function handleRemoveCollaborator(
    collaborator: Collaborator
  ) {
    const confirmed = window.confirm(
      `Remove ${collaborator.name}'s access to this document?`
    );

    if (!confirmed) return;

    setSharingAction(true);
    setShareError("");
    setShareMessage("");

    try {
      const response = await fetch(
        `/api/documents/${document.id}/shares`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: collaborator.userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to remove access."
        );
      }

      setShareMessage("Access revoked successfully.");
      await loadCollaborators();
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Unable to remove access."
      );
    } finally {
      setSharingAction(false);
    }
  }

  async function copyDocumentLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Document link copied to clipboard.");
      setShareError("");
    } catch {
      setShareError("Unable to copy the document link.");
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="rounded-lg bg-[#172b4d] p-2 text-white">
              <FileText size={19} />
            </div>

            <div className="min-w-0">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={!editable}
                maxLength={120}
                aria-label="Document title"
                className="w-full max-w-[260px] truncate border-b border-transparent bg-transparent text-sm font-semibold outline-none hover:border-gray-300 focus:border-blue-500 disabled:cursor-default"
              />

              <div className="flex items-center gap-2 text-xs text-gray-400">
                {status === "saving" && (
                  <>
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                )}

                {status === "saved" && (
                  <>
                    <Check
                      size={12}
                      className="text-green-600"
                    />
                    Saved
                  </>
                )}

                {status === "error" && (
                  <>
                    <AlertCircle
                      size={12}
                      className="text-red-500"
                    />
                    Save failed
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:block">
              {role === "OWNER"
                ? "Owner"
                : role === "EDITOR"
                  ? "Editor access"
                  : "Viewer access"}
            </span>

            {isOwner && (
              <button
                type="button"
                onClick={openShareDialog}
                className="flex items-center gap-2 rounded-lg bg-[#172b4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#223c66]"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            )}

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
              {userName
                .split(" ")
                .map((namePart) => namePart[0])
                .join("")}
            </div>
          </div>
        </div>
      </header>

      {/* Formatting toolbar */}
      <div className="sticky top-[65px] z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-5 py-2">
          <ToolbarButton
            label="Paragraph"
            active={editor.isActive("paragraph")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().setParagraph().run()
            }
          >
            <span className="px-1 text-sm font-medium">
              Normal
            </span>
          </ToolbarButton>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <ToolbarButton
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            editable={editable}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 1 })
                .run()
            }
          >
            <Heading1 size={19} />
          </ToolbarButton>

          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            editable={editable}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: 2 })
                .run()
            }
          >
            <Heading2 size={19} />
          </ToolbarButton>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().toggleUnderline().run()
            }
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <ToolbarButton
            label="Bulleted list"
            active={editor.isActive("bulletList")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List size={19} />
          </ToolbarButton>

          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            editable={editable}
            onClick={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered size={19} />
          </ToolbarButton>
        </div>
      </div>

      {/* Document canvas */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {!editable && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            You have view-only access to this document.
          </div>
        )}

        <div className="min-h-[850px] rounded-xl border border-gray-200 bg-white px-8 py-12 shadow-sm sm:px-14 md:px-20">
          <EditorContent editor={editor} />
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Ajaia Docs · Editing as {userName}
        </p>
      </section>

      {/* Sharing dialog */}
      {shareOpen && isOwner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeShareDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Dialog header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Users size={20} />
                </div>

                <h2
                  id="share-dialog-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Share document
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Invite people to collaborate on this document.
                </p>
              </div>

              <button
                type="button"
                onClick={closeShareDialog}
                disabled={sharingAction}
                aria-label="Close sharing dialog"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Invite form */}
            <form onSubmit={handleInvite} className="space-y-3">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-700"
              >
                Add people by email
              </label>

              <input
                id="invite-email"
                type="email"
                required
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(event) =>
                  setInviteEmail(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={inviteRole}
                    onChange={(event) =>
                      setInviteRole(
                        event.target.value as "EDITOR" | "VIEWER"
                      )
                    }
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-3 text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sharingAction || !inviteEmail.trim()}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#172b4d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#223c66] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sharingAction ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Mail size={16} />
                  )}
                  Invite
                </button>
              </div>

              <p className="text-xs text-gray-400">
                The invited person must already have an Ajaia Docs
                account.
              </p>
            </form>

            {/* Feedback */}
            {shareError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                <span>{shareError}</span>
              </div>
            )}

            {shareMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <Check
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                <span>{shareMessage}</span>
              </div>
            )}

            {/* Collaborators */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  People with access
                </h3>

                <span className="text-xs text-gray-400">
                  {collaborators.length + 1} people
                </span>
              </div>

              {loadingShares ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Loading people...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Owner */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                      {ownerInfo.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {ownerInfo.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {ownerInfo.email || "Document owner"}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      Owner
                    </span>
                  </div>

                  {/* Collaborator list */}
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.userId}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800">
                        {collaborator.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {collaborator.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {collaborator.email}
                        </p>
                      </div>

                      <div className="relative">
                        <select
                          aria-label={`Permission for ${collaborator.name}`}
                          value={collaborator.role}
                          disabled={sharingAction}
                          onChange={(event) =>
                            handleRoleChange(
                              collaborator,
                              event.target.value as "EDITOR" | "VIEWER"
                            )
                          }
                          className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-gray-700 outline-none focus:border-blue-400 disabled:opacity-50"
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>

                        <ChevronDown
                          size={13}
                          className="pointer-events-none absolute right-2 top-2 text-gray-400"
                        />
                      </div>

                      <button
                        type="button"
                        title={`Remove ${collaborator.name}`}
                        aria-label={`Remove ${collaborator.name}`}
                        disabled={sharingAction}
                        onClick={() =>
                          handleRemoveCollaborator(collaborator)
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {collaborators.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
                      <Users
                        size={22}
                        className="mx-auto mb-2 text-gray-300"
                      />

                      <p className="text-sm font-medium text-gray-600">
                        No collaborators yet
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Invite someone using their email address above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Link section */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={copyDocumentLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Copy size={16} />
                Copy document link
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
