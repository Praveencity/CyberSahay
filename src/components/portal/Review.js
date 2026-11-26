"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Paperclip, Pencil, Trash2 } from "lucide-react";
import { words } from "./words";
import { api, Notice, useResource, useText, Workspace } from "./shared";
import {
  categories,
  fields,
  nextField,
  label,
  UNKNOWN,
  SKIPPED,
  NOT_APPLICABLE,
} from "../../lib/workflow";
const special = [UNKNOWN, SKIPPED, NOT_APPLICABLE];
function Draft({ c, files }) {
  const l = (id) => label(id, c.language),
    v = (id) =>
      c.answers[id]
        ? special.includes(c.answers[id])
          ? l(c.answers[id])
          : c.answers[id]
        : l("missing");
  return (
    <article className="portal-paper" lang={c.language}>
      <small>{l("draft")}</small>
      <p>{l("to")}</p>
      <h2>
        {l("subject")} — {l(c.category)}
      </h2>
      <p>{l("greeting")}</p>
      <p>{l("intro")}</p>
      <dl>
        {["name", ...fields(c.category).filter((k) => k !== "name")].map(
          (k) => (
            <div key={k}>
              <dt>{l(k)}</dt>
              <dd>{v(k)}</dd>
            </div>
          ),
        )}
      </dl>
      {files.length > 0 && (
        <section className="evidence-list-in-report">
          <h3>{words("listOfEvidence", c.language)}</h3>
          <ul>
            {files.map((file) => (
              <li key={file.id}>
                <strong>{file.name}</strong>
                {file.note && <div className="evidence-note">{file.note}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p>{l("request")}</p>
      <p>
        {l("closing")}
        <br />
        {v("name")}
        <br />
        {new Intl.DateTimeFormat(c.language + "-IN", {
          dateStyle: "long",
          timeZone: "Asia/Kolkata",
        }).format(new Date())}
      </p>
    </article>
  );
}
export default function Review({ id, preview = false }) {
  const router = useRouter();
  const url = "/api/complaints/" + encodeURIComponent(id),
    { lang, w } = useText(),
    resource = useResource(url),
    c = resource.data?.complaint;
  const [edit, setEdit] = useState(false),
    [answers, setAnswers] = useState({}),
    [category, setCategory] = useState("other"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false),
    [notice, setNotice] = useState("");
  const lastReply = c?.messages?.at(-1);
  const showQuestion = lastReply?.source && lastReply.language === c.language &&
    lastReply.field === nextField(c.category, c.answers);
  function start() {
    setAnswers({ ...c.answers });
    setCategory(c.category);
    setEdit(true);
    setNotice("");
  }
  async function save(e) {
    e.preventDefault();
    if (busy || conflict) return;
    setBusy(true);
    setError("");
    try {
      const filtered = Object.fromEntries(
        fields(category).map((k) => [k, answers[k] || ""]),
      );
      const result = await api(url, "PATCH", {
        version: c.version,
        category,
        answers: filtered,
      });
      resource.setData({ ...resource.data, ...result });
      setEdit(false);
      setNotice("saved");
    } catch (err) {
      setError(err.message);
      if (err.status === 409) setConflict(true);
    } finally {
      setBusy(false);
    }
  }
  async function reloadDraft() {
    setBusy(true);
    try {
      resource.setData(await api(url));
      setEdit(false);
      setConflict(false);
      setError("");
      setNotice("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!window.confirm(w("confirmDel"))) return;
    setBusy(true);
    setError("");
    try {
      await api(url, "DELETE");
      router.replace("/complaints");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(url + "/generate", {
        method: "POST",
        cache: "no-store",
      });
      if (!r.ok) throw Error((await r.json()).error || "offline");
      const href = URL.createObjectURL(await r.blob()),
        a = document.createElement("a");
      a.href = href;
      a.download = "complaint-" + id.slice(-8) + ".pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 10000);
      resource.setData(await api(url));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace section="complaints">
      <header className="portal-head">
        <div>
          <h1>{w(preview ? "preview" : "review")}</h1>
          <p>{w("note")}</p>
        </div>
      </header>
      <Notice
        error={resource.error || error}
        onRetry={resource.error ? resource.reload : undefined}
      />
      <Notice
        error={conflict ? "editConflict" : ""}
        onRetry={reloadDraft}
        retryLabel="reloadDraft"
        disabled={busy}
      />
      <p role="status">{w(notice)}</p>
      {!edit && showQuestion && (
        <p><small>{w(lastReply.source)}</small><br />{lastReply.text}</p>
      )}
      {!c && !resource.error && <p>{w("loading")}</p>}
      {c && (
        <>
          {!edit && (
            <div className="portal-actions portal-toolbar">
              <button
                className="portal-primary"
                onClick={download}
                disabled={busy || !c.answers.description}
              >
                <Download size={16} />
                {w(busy ? "loading" : "pdf")}
              </button>
              <button
                disabled={busy}
                className="portal-secondary"
                onClick={start}
              >
                <Pencil size={16} />
                {w("edit")}
              </button>
              <Link className="portal-secondary" href={"/assistant?id=" + id}>
                {w("resume")}
              </Link>
              <Link className="portal-secondary" href={"/complaints/" + encodeURIComponent(id) + "/evidence"}>
                <Paperclip size={16} aria-hidden="true" />{w("manageEvidence")}
              </Link>
              <button
                disabled={busy}
                className="portal-danger"
                onClick={remove}
              >
                <Trash2 size={16} />
                {w("del")}
              </button>
            </div>
          )}
          {edit ? (
            <form className="portal-card portal-edit" onSubmit={save}>
              <label className="portal-field">
                {w("category")}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((k) => (
                    <option key={k} value={k}>
                      {label(k, lang)}
                    </option>
                  ))}
                </select>
              </label>
              {fields(category).map((k) => (
                <label key={k} className="portal-field">
                  {label(k, c.language)}
                  <textarea
                    maxLength={4000}
                    rows={k === "description" ? 4 : 2}
                    placeholder={label("missing", c.language)}
                    value={
                      special.includes(answers[k])
                        ? label(answers[k], c.language)
                        : answers[k] || ""
                    }
                    onChange={(e) =>
                      setAnswers({ ...answers, [k]: e.target.value })
                    }
                  />
                </label>
              ))}
              <div className="portal-actions">
                <button className="portal-primary" disabled={busy || conflict}>
                  {w(busy ? "saving" : "save")}
                </button>
                <button
                  className="portal-secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => setEdit(false)}
                >
                  {w("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <Draft c={c} files={resource.data.files ?? []} />
          )}
          <Link className="portal-link" href="/help">
            {w("official")}
          </Link>
        </>
      )}
    </Workspace>
  );
}
