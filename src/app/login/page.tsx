
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

const accounts = [
  { name: "Alex Morgan", email: "alex@ajaia.demo", initials: "AM" },
  { name: "Jordan Lee", email: "jordan@ajaia.demo", initials: "JL" },
  { name: "Taylor Smith", email: "taylor@ajaia.demo", initials: "TS" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(accounts[0].email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#172b4d] p-3 text-white">
            <FileText size={25} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Ajaia Docs
            </h1>
            <p className="text-sm text-gray-500">
              Your team&apos; workspace
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose a demo account to access your workspace.
        </p>

        <div className="mt-7 space-y-3">
          {accounts.map((account) => (
            <button
              key={account.email}
              onClick={() => setSelected(account.email)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                selected === account.email
                  ? "border-[#3459a5] bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                {account.initials}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {account.name}
                </p>
                <p className="text-sm text-gray-500">
                  {account.email}
                </p>
              </div>

              <div className={`h-4 w-4 rounded-full border-2 ${
                selected === account.email
                  ? "border-[#3459a5] bg-[#3459a5]"
                  : "border-gray-300"
              }`} />
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={login}
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172b4d] px-5 py-3 font-medium text-white transition hover:bg-[#263f69] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Continue to workspace
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          Ajaia Docs · Demo environment
        </p>
      </div>
    </main>
  );
}
