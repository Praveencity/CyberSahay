"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  PanelRightOpen,
  X,
  BookOpen,
  LayoutDashboard,
  FileText,
  Plus,
  ShieldCheck,
  History,
  FolderOpen,
  LockKeyhole,
  Paperclip,
} from "lucide-react";
import { api, LanguageSelect, Notice, useResource, useText } from "./shared";
import { handleImagePaste, PendingAttachment } from "./Attachment";
import { maxEvidenceBytes, maxEvidenceFiles } from "../../config/evidence";
import { starters } from "./starters";
import {
  fields,
  progress,
  nextField,
  label,
  question,
  UNKNOWN,
  SKIPPED,
  NOT_APPLICABLE,
  sensitive,
  isRequired,
} from "../../lib/workflow";

function IncomingReply({ text }) {
  const words = text.split(/(?<=\s)(?=\S)/u);
  const interval = Math.min(34, 640 / words.length);
  return words.map((word, index) => (
    <span className="reply-word" key={index} style={{ "--word-delay": index * interval + "ms" }}>{word}</span>
  ));
}

export default function Assistant({ initialId, initialStarter }) {
  const { w, lang, setLang } = useText(),
    list = useResource("/api/complaints"),
    existing = useResource(
      initialId ? "/api/complaints/" + encodeURIComponent(initialId) : null,
    );
  const [record, setRecord] = useState(null),
    [typedText, setText] = useState(null),
    [starter, setStarter] = useState(initialStarter),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false);
  const [newReplyIndex, setNewReplyIndex] = useState(null);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [savedFiles, setSavedFiles] = useState(null);
  const files = savedFiles ?? existing.data?.files ?? [];
  const picker = useRef(null);
  const text = typedText ?? (starter ? w(starter) : "");
  const detailsDialog = useRef(null);
  const historyDialog = useRef(null);
  const replyArea = useRef(null);
  const sentReply = useRef(false);
  const composer = useRef(null);
  const c = record || existing.data?.complaint,
    answers = c?.answers || {},
    cats = c?.category || "other",
    language = c?.language || lang,
    active = nextField(cats, answers);
  const lastReply = c?.messages?.at(-1);
  const prompt = lastReply?.field === active && lastReply?.language === language
    ? lastReply.text : question(active, language);
  const loadingDraft = Boolean(initialId && !c);
  const starting = !loadingDraft && !c?.messages?.length && !answers.description;
  useEffect(() => {
    const input = composer.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  }, [text, active]);
  const locked = busy || conflict || !list.data || loadingDraft;
  const canChooseStarter = !text.trim() || starters.some(({ prompt }) => text === w(prompt));
  useEffect(() => {
    if (!c?.messages?.length) return;
    const smooth = sentReply.current && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    sentReply.current = false;
    replyArea.current?.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
  }, [c?.messages?.length]);
  function selectImage(file) {
    if (files.length >= maxEvidenceFiles) return setError("A complaint can have up to 5 evidence files.");
    if (file.size > maxEvidenceBytes) return setError("Each file must be 10 MB or smaller.");
    setError("");
    setAttachment(file);
  }
  async function send(value, skip = false) {
    if (locked || (!attachment && !value.trim())) return;
    if (active === "description" && !value.trim()) {
      setError("Describe the incident first.");
      return;
    }
    if (sensitive(value)) {
      setError("privacy");
      return;
    }
    setAwaitingReply(Boolean(value.trim()));
    setBusy(true);
    setError("");
    try {
      if (attachment) {
        const data = new FormData();
        data.set("file", attachment);
        if (c) {
          data.set("version", String(c.version));
          data.set("answer", value.trim());
        } else {
          data.set("fromChat", "1");
          data.set("description", value.trim());
          data.set("language", language);
        }
        const url = c ? "/api/complaints/" + c.id + "/evidence" : "/api/complaints/evidence";
        const result = await api(url, "POST", data);
        if (!c) window.history.replaceState(window.history.state, "", "/assistant?id=" + result.complaint.id);
        sentReply.current = Boolean(value.trim());
        if (sentReply.current) setNewReplyIndex(result.complaint.messages.length - 1);
        setRecord(result.complaint);
        setSavedFiles(result.files);
        setAttachment(null);
        setText("");
        return;
      }
      let current = c;
      if (!current) {
        current = (await api("/api/complaints", "POST", { language }))
          .complaint;
        setRecord(current);
        window.history.replaceState(
          window.history.state,
          "",
          "/assistant?id=" + current.id,
        );
      }
      const { complaint } = await api(
        "/api/complaints/" + current.id + "/chat",
        "POST",
        { text: value.trim(), version: current.version, skip },
      );
      sentReply.current = true;
      setNewReplyIndex(complaint.messages.length - 1);
      setRecord(complaint);
      setText("");
    } catch (e) {
      setError(e.message);
      if (e.status === 409) setConflict(true);
    } finally {
      setAwaitingReply(false);
      setBusy(false);
    }
  }
  async function reloadDraft() {
    setBusy(true);
    try {
      const result = await api("/api/complaints/" + c.id);
      setRecord(result.complaint);
      setSavedFiles(result.files);
      setConflict(false);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeLanguage(value) {
    if (!c) {
      setLang(value);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/complaints/" + c.id, "PATCH", {
        language: value,
        version: c.version,
      });
      await setLang(value, () => setRecord(result.complaint));
    } catch (e) {
      setError(e.message);
      if (e.status === 409) setConflict(true);
    } finally {
      setBusy(false);
    }
  }
  const meaningful = (k) =>
    answers[k] && ![UNKNOWN, SKIPPED, NOT_APPLICABLE].includes(answers[k]);
  const all = fields(cats),
    pct = progress(cats, answers);
  const previous = [
    ...(c ? [c] : []),
    ...(list.data?.complaints || []).filter((item) => item.id !== c?.id),
  ];
  const history = (
    <>
      <a className="portal-primary" href="/assistant">
        <Plus size={16} />
        {w("newChat")}
      </a>
      {previous.length > 0 && <h3>{w("recentChats")}</h3>}
      {!list.data && !list.error && <p className="chat-history-empty" role="status">{w("loading")}</p>}
      {list.data && !previous.length && (
        <div className="chat-history-empty"><MessageCircle size={20} aria-hidden="true" /><p>{w("historyHint")}</p></div>
      )}
      {previous.slice(0, 8).map((item) => (
        <a
          className="portal-history"
          key={item.id}
          aria-current={item.id === c?.id ? "page" : undefined}
          href={"/assistant?id=" + item.id}
        >
          <MessageCircle size={15} />
          <span>{item.answers?.description || label(item.category, lang)}</span>
        </a>
      ))}
      <Link className="portal-link" href="/complaints?filter=drafts">
        <FolderOpen size={17} />
        {w("drafts")}
      </Link>
    </>
  );
  const details = (
    <>
      <p>{w("category")}</p>
      <strong>{c?.answers?.description ? label(cats, language) : "—"}</strong>
      <div className="portal-meter">
        <label htmlFor="completion">
          {w("progress")} · {pct}%
        </label>
        <progress id="completion" value={pct} max="100" />
      </div>
      {[
        ["collected", all.filter(meaningful)],
        ["missing", all.filter((k) => isRequired(k) && !meaningful(k))],
      ].map(([heading, keys]) => (
        <div key={heading}>
          <h3>{w(heading)}</h3>
          <ul>
            {keys.map((k) => (
              <li key={k}>{label(k, language)}</li>
            ))}
          </ul>
          {!keys.length && <p>{w("none")}</p>}
        </div>
      ))}
      <div className="chat-preparation"><h3>{w("keepReady")}</h3><p>{w("keepReadyBody")}</p></div>
      {c && (
        <div className="portal-actions">
          <Link className="portal-secondary" href={"/complaints/" + c.id + "/evidence"}>
            {w("manageEvidence")}
          </Link>
          <Link className="portal-secondary" href={"/complaints/" + c.id + "/preview"}>
            {w("preview")}
          </Link>
        </div>
      )}
    </>
  );
  return (
    <main className="conversation-workspace">
      <header className="conversation-header">
        <div className="conversation-frame conversation-toolbar">
          <h1>{w("assistant")}</h1>
          <div className="conversation-tools">
            <button
              type="button"
              onClick={() => historyDialog.current?.showModal()}
              aria-haspopup="dialog"
              aria-controls="chat-history"
            >
              <History size={18} aria-hidden="true" />
              {w("chats")}
            </button>
            <button
              type="button"
              onClick={() => detailsDialog.current?.showModal()}
              aria-label={w("details")}
              aria-haspopup="dialog"
              aria-controls="complaint-details"
            >
              <PanelRightOpen size={18} aria-hidden="true" />
              {w("details")}
              {c && <b className="draft-percent" aria-hidden="true">{pct}%</b>}
            </button>
            {c?.answers?.description && (
              <Link className="conversation-review" href={"/complaints/" + c.id + "/preview"}>
                <FileText size={18} aria-hidden="true" />
                {w("preview")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <dialog ref={historyDialog} id="chat-history" className="conversation-panel conversation-sidebar" aria-labelledby="chat-history-title">
        <header className="conversation-panel-heading">
          <h2 id="chat-history-title">{w("chats")}</h2>
          <button type="button" onClick={() => historyDialog.current?.close()} aria-label={w("closePanel")}>
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        <div className="conversation-history">{history}</div>
        <nav className="conversation-sidebar-links">
          <Link href="/dashboard"><LayoutDashboard size={19} aria-hidden="true" />{w("overview")}</Link>
          <Link href="/awareness"><BookOpen size={19} aria-hidden="true" />{w("awareness")}</Link>
        </nav>
      </dialog>
      <dialog ref={detailsDialog} id="complaint-details" className="conversation-panel conversation-details" aria-labelledby="complaint-details-title">
        <header className="conversation-panel-heading">
          <h2 id="complaint-details-title">{w("details")}</h2>
          <button type="button" onClick={() => detailsDialog.current?.close()} aria-label={w("closePanel")}>
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        {details}
      </dialog>

      <div className={"conversation-frame conversation-body" + (starting ? " is-new" : "")}>
        <div className="conversation-notices">
          <Notice
            error={existing.error || list.error}
            onRetry={() => {
              existing.reload();
              list.reload();
            }}
          />
          {["payment", "investment", "shopping", "job"].includes(cats) && (
            <p className="portal-guidance">
              {w("urgent")} <a href="tel:1930">1930</a> ·{" "}
              <a href="https://cybercrime.gov.in">cybercrime.gov.in</a>
            </p>
          )}
          {["blackmail", "harassment"].includes(cats) && (
            <p className="portal-guidance">{w("danger")}</p>
          )}
        </div>

        <div className="portal-log" role="log" aria-live="polite">
          {loadingDraft ? (
            !existing.error && <p role="status">{w("loading")}</p>
          ) : starting ? (
            <div className="chat-introduction">
              <h2>{w("incidentWelcome")}</h2>
              <p>{w("welcomeBody")}</p>
            </div>
          ) : (
            <article className="portal-bubble">
              <strong><ShieldCheck size={16} aria-hidden="true" />{w("assistant")}</strong>
              <p>{w("intro")}</p>
            </article>
          )}
          {c?.messages?.map((m, i) => {
            const mine = m.role?.toLowerCase() === "user";
            const incoming = !mine && i === newReplyIndex;
            const message = [UNKNOWN, SKIPPED, NOT_APPLICABLE].includes(m.text) ? label(m.text, language) : m.text;
            return (
              <article key={m.id || i} className={"portal-bubble" + (mine ? " mine" : "")}>
                <strong>
                  {!mine && <ShieldCheck size={16} aria-hidden="true" />}
                  {w(mine ? "you" : "assistant")}
                </strong>
                <p>{incoming ? <IncomingReply text={message} /> : message}</p>
                {!mine && m.source && <small>{w(m.source)}</small>}
              </article>
            );
          })}
          {awaitingReply && (
            <div className="portal-bubble reply-pending">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{w("preparingReply")}</span>
              <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
            </div>
          )}
        </div>

        <div ref={replyArea} className="portal-compose">
          <Notice error={error} />
          <Notice
            error={conflict ? "chatConflict" : ""}
            onRetry={reloadDraft}
            retryLabel="reloadDraft"
            disabled={busy}
          />
          <div className="composer-heading">
            {active ? <label htmlFor="assistant-reply">{w("message")}</label> : <strong>{w("done")}</strong>}
            <LanguageSelect value={language} onChange={changeLanguage} disabled={locked} />
          </div>
          {active ? (
            <form
              onPaste={(event) => { if (!busy) handleImagePaste(event, selectImage, setError); }}
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
            >
              <div className="portal-field">
                <textarea
                  id="assistant-reply"
                  ref={composer}
                  disabled={busy}
                  placeholder={active === "description" ? w("composeHint") : prompt}
                  rows={active === "description" ? 5 : 2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia("(pointer: coarse)").matches) {
                      e.preventDefault();
                      send(text);
                    }
                  }}
                  required={active === "description" || !attachment}
                  aria-describedby="chat-paste"
                  maxLength={3500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <small id="chat-paste">{w("pasteHint")}</small>
              {attachment && <PendingAttachment file={attachment} remove={() => setAttachment(null)} disabled={busy} w={w} />}
              <div className="portal-actions">
                <input ref={picker} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                  const file = event.target.files[0];
                  if (file) selectImage(file);
                  event.target.value = "";
                }} />
                <button className="portal-secondary" type="button" disabled={locked || files.length >= maxEvidenceFiles} onClick={() => picker.current?.click()}>
                  <Paperclip size={16} aria-hidden="true" />{w("attachImage")}
                </button>
                {active !== "description" && !attachment && (
                  <>
                    <button
                      className="portal-secondary"
                      type="button"
                      disabled={locked}
                      onClick={() => send(SKIPPED, true)}
                    >
                      {w("skip")}
                    </button>
                    <button
                      className="portal-secondary"
                      type="button"
                      disabled={locked}
                      onClick={() => send(UNKNOWN)}
                    >
                      {w("unknown")}
                    </button>
                    <button
                      className="portal-secondary"
                      type="button"
                      disabled={locked}
                      onClick={() => send(NOT_APPLICABLE)}
                    >
                      {label(NOT_APPLICABLE, language)}
                    </button>
                  </>
                )}
                <button
                  className="portal-primary conversation-send"
                  aria-label={w(busy ? "saving" : "send")}
                  title={w(busy ? "saving" : "send")}
                  disabled={locked || (!text.trim() && (!attachment || active === "description"))}
                >
                  <Send size={19} /><span>{w(busy ? "saving" : "send")}</span>
                </button>
              </div>
            </form>
          ) : (
            <Link
              className="portal-primary"
              href={"/complaints/" + c.id + "/preview"}
            >
              <FileText size={18} />
              {w("preview")}
            </Link>
          )}
          {c && files.length > 0 && (
            <div className="chat-evidence-files" aria-live="polite">
              <strong>{w("evidenceFiles")}</strong>
              {files.map(file => (
                <a className="portal-link" key={file.id} href={"/api/complaints/" + c.id + "/evidence/" + file.id}>
                  <Paperclip size={15} aria-hidden="true" />{file.name}
                </a>
              ))}
            </div>
          )}
          <small><LockKeyhole size={15} aria-hidden="true" />{w("privacy")}</small>
        </div>

        {starting && (
          <section className="chat-quick-start" aria-labelledby="starter-title">
            <h2 id="starter-title">{w("startWithPrompt")}</h2>
            <div className="chat-starters">
              {starters.map(({ id, topic, Icon, title, prompt }) => (
                <button
                  type="button"
                  key={id}
                  data-topic={topic}
                  aria-pressed={text === w(prompt)}
                  disabled={locked || !canChooseStarter}
                  onClick={() => {
                    setStarter(prompt);
                    setText(null);
                    composer.current?.focus();
                  }}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{w(title)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
