"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TabId = "nanobanana" | "seedream" | "veo-3.1" | "kling" | "sora-2";

type PlatformId = "nanobanana" | "seedream" | "veo" | "kling" | "sora" | "openai" | "gemini";

interface KeyItem {
  id: string;
  platform: PlatformId;
  keyName?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  keyPreview?: string;
}

const tabLabels: Record<TabId, string> = {
  nanobanana: "Nanobanana",
  seedream: "Seedream",
  "veo-3.1": "Veo 3.1",
  kling: "Kling",
  "sora-2": "Sora 2",
};

function mapTabToPlatform(tab: TabId): PlatformId {
  switch (tab) {
    case "veo-3.1":
      return "veo";
    case "sora-2":
      return "sora";
    default:
      return tab as PlatformId;
  }
}

export default function SettingsPage() {
  const [active, setActive] = useState<TabId>("nanobanana");
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [apiKey, setApiKey] = useState("");
  const [keyName, setKeyName] = useState("");

  // 전체 API 키 목록 (우측 패널에서 탭과 무관하게 모두 표시)
  const allKeysSorted = useMemo(() => {
    return [...keys].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [keys]);

  async function refreshKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch keys");
      setKeys(json.data as KeyItem[]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshKeys();
  }, []);

  function resetForm() {
    setApiKey("");
    setKeyName("");
  }

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const platform = mapTabToPlatform(active);
      const body: any = { platform, apiKey, keyName };
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add key");
      resetForm();
      await refreshKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch("/api/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update key");
      await refreshKeys();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function deleteKey(id: string) {
    try {
      const res = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete key");
      await refreshKeys();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-gradient.svg')",
          opacity: 0.95,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">API 관리</h1>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
            ainspire_내돈내산
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(tabLabels) as TabId[]).map((tab) => {
            const activeTab = active === tab;
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-full border ${
                  activeTab
                    ? "bg-white/20 border-white/30"
                    : "bg-white/10 border-white/10 hover:bg-white/20"
                } transition-colors`}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add key form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <h2 className="text-lg font-medium mb-4">{tabLabels[active]} 키 추가</h2>
            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-white/80">표시 이름(선택)</label>
                <input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="예: 개인용, 팀용"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white/80">API Key</label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/20 disabled:opacity-60"
                >
                  {loading ? "저장 중..." : "키 저장"}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </form>
            <p className="mt-4 text-xs text-white/50">
              참고: 모든 플랫폼은 API Key만 입력하면 됩니다.
            </p>
          </div>

          {/* Keys list */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <h2 className="text-lg font-medium mb-4">등록된 키</h2>
            {loading && keys.length === 0 ? (
              <div className="text-white/60">불러오는 중…</div>
            ) : allKeysSorted.length === 0 ? (
              <div className="text-white/60">등록된 키가 없습니다.</div>
            ) : (
              <ul className="space-y-3">
                {allKeysSorted.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{k.keyName || "이름 없음"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/70">
                          {k.platform.toUpperCase()}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/70">
                          {k.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-white/60 truncate">
                        {k.keyPreview || "••••••••"}
                      </div>
                      <div className="text-[10px] text-white/40">{new Date(k.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActive(k.id, !k.isActive)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/10"
                      >
                        {k.isActive ? "비활성화" : "활성화"}
                      </button>
                      <button
                        onClick={() => deleteKey(k.id)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-red-500/40 text-red-300 hover:bg-red-500/10"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}
