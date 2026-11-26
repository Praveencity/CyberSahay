"use client";
import { useState } from "react";
import Link from "next/link";
import { FileText, Files, FileCheck2, Plus, FolderOpen, Trash2 } from "lucide-react";
import { api, Notice, useResource, useText, Workspace } from "./shared";
import { label } from "../../lib/workflow";
export default function Listing({ overview = false, filter }) {
  const { lang, w } = useText(),
    query = new URLSearchParams(
      ["drafts", "generated"].includes(filter) ? { filter } : {},
    ),
    resource = useResource("/api/complaints?" + query),
    [extra, setExtra] = useState([]),
    [next, setNext] = useState(undefined),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [deletedRef, setDeletedRef] = useState("");
  const data = resource.data,
    section = overview
      ? "overview"
      : filter === "drafts"
        ? "drafts"
        : filter === "chats"
          ? "chats"
          : "complaints";
  const rows = [...(data?.complaints || []), ...extra],
    cursor = next === undefined ? data?.nextCursor : next;
  const latestDraft = rows.find((c) => c.status !== "DOCUMENT_GENERATED");
  async function remove(c) {
    const reference = c.id.slice(-8).toUpperCase();
    if (busy || !window.confirm(reference + " · " + w("confirmDel"))) return;
    setBusy(true);
    setError("");
    setDeletedRef("");
    try {
      await api("/api/complaints/" + encodeURIComponent(c.id), "DELETE");
      setDeletedRef(reference);
      // A removed row may have been the cursor for the next page.
      setExtra([]);
      setNext(undefined);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function more() {
    setBusy(true);
    setError("");
    try {
      const page = await api(
        "/api/complaints?" +
          new URLSearchParams([...query, ["cursor", cursor]]),
      );
      setExtra((a) => [...a, ...page.complaints]);
      setNext(page.nextCursor || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace section={section}>
      <header className="portal-head">
        <div>
          <h1>
            {w(
              overview
                ? "dashboard"
                : filter === "generated"
                  ? "prepared"
                  : section,
            )}
          </h1>
          {overview && <p>{w("overviewIntro")}</p>}
        </div>
        <Link className="portal-primary" href="/assistant">
          <Plus size={17} />
          {w("new")}
        </Link>
      </header>
      <Notice
        error={resource.error || error}
        onRetry={resource.error ? resource.reload : undefined}
      />
      {deletedRef && <p role="status">{w("complaintDeleted")} · {deletedRef}</p>}
      {!data && !resource.error && <p role="status">{w("loading")}</p>}
      {data && (
        <>
          {overview && latestDraft && (
            <section className="portal-resume">
              <div>
                <h2>{w("resumeDraft")}</h2>
                <p>{label(latestDraft.category, lang)}</p>
              </div>
              <Link
                className="portal-primary"
                href={"/assistant?id=" + latestDraft.id}
              >
                {w("resume")}
              </Link>
            </section>
          )}
          {overview && (
            <div className="portal-stats">
              {[
                ["total", "total", Files, "/complaints"],
                ["drafts", "drafts", FileText, "/complaints?filter=drafts"],
                [
                  "generated",
                  "prepared",
                  FileCheck2,
                  "/complaints?filter=generated",
                ],
              ].map(([key, title, Icon, href]) => (
                <Link className="portal-card" key={key} data-stat={key} href={href}>
                  <Icon size={22} />
                  <p>{w(title)}</p>
                  <strong>{data.stats[key]}</strong>
                </Link>
              ))}
            </div>
          )}
          <div className="portal-card">
            <h2>
              {w(
                overview
                  ? "recent"
                  : filter === "generated"
                    ? "prepared"
                    : section,
              )}
            </h2>
            {rows.length ? (
              <div className="portal-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {["ref", "category", "created", "status", "actions"].map(
                        (k) => (
                          <th key={k}>{w(k)}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(overview ? rows.slice(0, 6) : rows).map((c) => (
                      <tr key={c.id}>
                        <td>{c.id.slice(-8).toUpperCase()}</td>
                        <td>{label(c.category, lang)}</td>
                        <td>
                          {new Date(c.createdAt).toLocaleDateString(
                            lang + "-IN",
                          )}
                        </td>
                        <td>
                          <span className="portal-pill" data-status={c.status}>{w(c.status)}</span>
                        </td>
                        <td>
                          <div className="portal-actions">
                            <Link href={"/assistant?id=" + c.id}>
                              {w("resume")}
                            </Link>
                            <Link href={"/complaints/" + c.id}>
                              {w("view")}
                            </Link>
                            <button
                              type="button"
                              className="portal-danger"
                              disabled={busy}
                              aria-label={w("del") + " " + c.id.slice(-8).toUpperCase()}
                              onClick={() => remove(c)}
                            >
                              <Trash2 size={15} aria-hidden="true" />{w("del")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="portal-empty">
                <FolderOpen />
                <p>{w("empty")}</p>
              </div>
            )}
            {!overview && cursor && (
              <button
                className="portal-secondary"
                onClick={more}
                disabled={busy}
              >
                {w(busy ? "loading" : "more")}
              </button>
            )}
            {overview && rows.length > 6 && (
              <Link className="portal-link" href="/complaints">
                {w("complaints")}
              </Link>
            )}
          </div>
        </>
      )}
    </Workspace>
  );
}
