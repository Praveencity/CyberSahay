"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileImage, FileVideo, FolderOpen, LockKeyhole, Paperclip, Trash2, Upload } from "lucide-react";
import { evidenceAccept, maxEvidenceBytes, maxEvidenceFiles } from "../../config/evidence";
import { api, Notice, useResource, useText, Workspace } from "./shared";

import { handleImagePaste, PendingAttachment } from "./Attachment";

export default function Evidence({ id }) {
  const { lang, w } = useText();
  const router = useRouter();
  const complaintPath = id && "/complaints/" + encodeURIComponent(id);
  const url = complaintPath ? "/api" + complaintPath + "/evidence" : "/api/complaints/evidence";
  const resource = useResource(complaintPath ? url : null);
  const files = resource.data?.files ?? [];
  const full = files.length >= maxEvidenceFiles;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);

  const [file, setFile] = useState(null);
  const picker = useRef(null);
  const [dragging, setDragging] = useState(false);
  function select(file) {
    if (file && (!file.size || file.size > maxEvidenceBytes)) {
      setFile(null);
      setStatus("");
      setError(file.size ? "Each file must be 10 MB or smaller." : "Select an image or video.");
      return;
    }
    setFile(file);
    setError("");
    setStatus("");
  }

  function retry() {
    setError("");
    setConflict(false);
    resource.reload();
  }

  async function upload(event) {
    event.preventDefault();
    if (busy || conflict || full || (id && !resource.data)) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    setError("");
    setStatus("");
    if (!file?.size) {
      setError("Select an image or video.");
      picker.current.focus();
      return;
    }
    if (file.size > maxEvidenceBytes) {
      setError("Each file must be 10 MB or smaller.");
      return;
    }
    data.set("file", file);
    if (id) data.set("version", String(resource.data.version));
    else data.set("language", lang);

    setBusy(true);
    try {
      const result = await api(url, "POST", data);
      if (id) {
        resource.setData(result);
        form.reset();
        setFile(null);
        setStatus("evidenceSaved");
      } else {
        router.push("/complaints/" + result.complaint.id + "/preview");
        return;
      }
    } catch (err) {
      setError(err.message);
      if (err.status === 409) setConflict(true);
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  async function remove(file) {
    if (busy || conflict || !window.confirm(w("evidenceConfirmRemove"))) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      resource.setData(await api(url + "/" + file.id, "DELETE", { version: resource.data.version }));
      setStatus("evidenceRemoved");
    } catch (err) {
      setError(err.message);
      if (err.status === 409) setConflict(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Workspace section="evidenceReport">
      <header className="evidence-header">
        <FolderOpen className="evidence-header-icon" aria-hidden="true" />
        <div>
          <h1>{w(id ? "manageEvidence" : "evidenceReport")}</h1>
          <p>{w(id ? "evidenceExisting" : "evidenceIntro")}</p>
        </div>
        {id && <Link className="portal-secondary" href={complaintPath + "/preview"}>{w("preview")}</Link>}
      </header>

      <Notice error={resource.error || error} onRetry={resource.error || conflict ? retry : undefined} />
      {status && <p className="evidence-status" role="status">{w(status)}</p>}
      {id && !resource.data && !resource.error && <p role="status">{w("loading")}</p>}
      {full && <p role="status">{w("A complaint can have up to 5 evidence files.")}</p>}

      <div className="evidence-layout">
        <form className="evidence-form" onSubmit={upload}
          onPaste={(event) => { if (!busy && !full) handleImagePaste(event, select, setError); }}>
          <div className="evidence-fields">
            <h2>{w("evidenceUpload")}</h2>
            <label className="evidence-drop" data-dragging={dragging || undefined}
              onDragOver={(event) => { event.preventDefault(); setDragging(!busy && !full); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (busy || full) return;
                const dropped = event.dataTransfer.files;
                if (dropped.length !== 1) return setError("chooseOneFile");
                select(dropped[0]);
              }}>
              <Upload size={28} aria-hidden="true" />
              <strong>{w("chooseEvidence")}</strong>
              <span>{w("pasteHint")}</span>
              <input ref={picker} name="file" type="file" accept={evidenceAccept} disabled={busy || full}
                aria-label={w("evidenceInput")} aria-describedby="evidence-formats"
                onChange={(event) => {
                  if (event.target.files[0]) select(event.target.files[0]);
                  event.target.value = "";
                }} />
            </label>
            {file && <PendingAttachment file={file} remove={() => select(null)} disabled={busy} w={w} />}
            {!id && (
              <label className="portal-field">
                {w("evidenceDescription")}
                <textarea name="description" rows={4} required maxLength={4000} disabled={busy} />
              </label>
            )}
            <label className="portal-field">
              {w("evidenceNote")}
              <textarea name="note" rows={2} maxLength={4000} disabled={busy || full} />
            </label>
          </div>
          <div className="evidence-submit">
            <button className="portal-primary" disabled={busy || conflict || full || Boolean(id && !resource.data)}>
              <Paperclip size={17} aria-hidden="true" />
              {w(busy ? "saving" : id ? "evidenceUpload" : "evidenceCreate")}
            </button>
          </div>
        </form>
        <aside className="evidence-guide">
          <h2><LockKeyhole size={20} aria-hidden="true" />{w("beforeUpload")}</h2>
          <p id="evidence-formats">{w("evidenceFormats")}</p>
          <p>{w("evidencePrivacy")}</p>
        </aside>
      </div>

      {id && resource.data && (
        <section className="evidence-files">
          <h2>{w("evidenceFiles")} <small>{files.length} / {maxEvidenceFiles}</small></h2>
          <p>{w(files.length ? "evidencePdfNote" : "evidenceEmpty")}</p>
          <ul>
            {files.map((file) => {
              const Icon = file.mediaType.startsWith("video/") ? FileVideo : FileImage;
              const large = file.size >= 1024 * 1024;
              const size = new Intl.NumberFormat(lang, {
                style: "unit",
                unit: large ? "megabyte" : "kilobyte",
                maximumFractionDigits: 2,
              }).format(file.size / (large ? 1024 * 1024 : 1024));
              return (
                <li key={file.id}>
                  <div className="evidence-file-name">
                    <Icon size={20} aria-hidden="true" />
                    <strong>{file.name}</strong>
                    <span>{size}</span>
                  </div>
                  {file.note && <p className="evidence-note">{file.note}</p>}
                  <div className="portal-actions">
                    <a className="portal-secondary" href={url + "/" + file.id}>
                      <Download size={16} aria-hidden="true" />{w("evidenceDownload")}
                    </a>
                    <button type="button" className="portal-danger" disabled={busy || conflict} onClick={() => remove(file)}>
                      <Trash2 size={16} aria-hidden="true" />{w("evidenceRemove")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </Workspace>
  );
}
