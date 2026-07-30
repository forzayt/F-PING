import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitCommit,
  GitPullRequest,
  ExternalLink,
  RefreshCw,
  User,
  Calendar,
  Code,
} from "lucide-react";

export const Route = createFileRoute("/commits")({
  head: () => ({
    meta: [
      { title: "Commit Logs — FPING" },
      {
        name: "description",
        content: "Complete commit history for the FPING repository from GitHub.",
      },
    ],
  }),
  component: CommitsPage,
});

interface CommitDetail {
  sha: string;
  fullSha: string;
  message: string;
  authorName: string;
  authorLogin?: string;
  authorAvatar?: string;
  authorUrl?: string;
  commitUrl: string;
  date: string;
  timeAgo: string;
}

function CommitsPage() {
  const [commits, setCommits] = useState<CommitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.github.com/repos/forzayt/F-PING/commits?per_page=30");
      if (!res.ok) {
        throw new Error(`Failed to fetch commits (${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: CommitDetail[] = data.map((item: any) => {
          const commitDate = new Date(item.commit.author?.date);
          return {
            sha: item.sha.substring(0, 7),
            fullSha: item.sha,
            message: item.commit.message,
            authorName: item.commit.author?.name || "Unknown",
            authorLogin: item.author?.login,
            authorAvatar: item.author?.avatar_url,
            authorUrl: item.author?.html_url || (item.commit.author?.email ? `https://github.com/${item.commit.author?.name}` : undefined),
            commitUrl: item.html_url,
            date: commitDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            timeAgo: getTimeAgo(commitDate),
          };
        });
        setCommits(mapped);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load commits from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, []);

  return (
    <AppShell
      title="Commit Logs"
      subtitle="Complete commit history from official GitHub repository."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-glass-border bg-glass"
            onClick={fetchCommits}
            disabled={loading}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <a
            href="https://github.com/forzayt/F-PING"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <GitPullRequest className="size-3.5" />
            Contribute Repo
          </a>
        </div>
      }
    >
      {() => (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <GitCommit className="size-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base">forzayt / F-PING</h2>
                <p className="text-xs text-muted-foreground">
                  Branch: <span className="font-mono font-medium text-foreground">main</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/forzayt/F-PING/commits/main/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <span>View on GitHub</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-shimmer h-20 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="glass grid place-items-center rounded-3xl px-6 py-12 text-center">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button size="sm" onClick={fetchCommits}>
                Try Again
              </Button>
            </div>
          ) : commits.length === 0 ? (
            <div className="glass grid place-items-center rounded-3xl px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No commits found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commits.map((c) => {
                const [firstLine, ...bodyLines] = c.message.split("\n");
                return (
                  <div
                    key={c.fullSha}
                    className="glass animate-rise rounded-2xl p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground break-words">
                          {firstLine}
                        </p>
                        {bodyLines.filter(Boolean).length > 0 && (
                          <pre className="text-xs text-muted-foreground font-sans whitespace-pre-wrap rounded-lg bg-sidebar-accent/50 p-2">
                            {bodyLines.filter(Boolean).join("\n")}
                          </pre>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            {c.authorAvatar ? (
                              <img
                                src={c.authorAvatar}
                                alt={c.authorName}
                                className="size-4 rounded-full border border-border"
                              />
                            ) : (
                              <User className="size-3.5" />
                            )}
                            {c.authorUrl ? (
                              <a
                                href={c.authorUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-foreground hover:text-primary hover:underline"
                              >
                                {c.authorName} {c.authorLogin && `@${c.authorLogin}`}
                              </a>
                            ) : (
                              <span className="font-medium text-foreground">
                                {c.authorName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{c.date} ({c.timeAgo})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <a
                          href={c.commitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-sidebar-accent border border-glass-border px-2.5 py-1 text-xs font-mono text-primary hover:bg-sidebar-accent/80 transition-colors"
                        >
                          <Code className="size-3" />
                          <span>{c.sha}</span>
                          <ExternalLink className="size-3 opacity-60 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
