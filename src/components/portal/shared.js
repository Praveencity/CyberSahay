"use client";
import { portalLanguages } from "../../config/languages";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  FolderOpen,
  FilePenLine,
  MessagesSquare,
  Settings,
  Plus,
  LogOut,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "../Language";
import { words } from "./words";
import "./portal.css";

export function useText() {
  const { lang, setLang } = useLanguage();
  return { lang, setLang, w: (key) => words(key, lang) };
}
export function loginPath() {
  return (
    "/login?next=" + encodeURIComponent(location.pathname + location.search)
  );
}
export async function api(url, method = "GET", data) {
  let response;
  const multipart = data instanceof FormData;
  try {
    response = await fetch(url, {
      method,
      cache: "no-store",
      headers: data && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: multipart ? data : data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw Error("offline");
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && url !== "/api/account")
      location.assign(loginPath());
    throw Object.assign(
      Error(typeof json.error === "string" ? json.error : "offline"),
      { status: response.status },
    );
  }
  return json;
}
export function useResource(url) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    if (url)
      api(url)
        .then((value) => {
          if (active) setData(value);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [url, revision]);
  return {
    data,
    setData,
    error,
    reload: useCallback(() => setRevision((i) => i + 1), []),
  };
}
export function Notice({ error, onRetry, retryLabel = "retry", disabled = false }) {
  const { w } = useText();
  return error ? (
    <div className="portal-alert" role="alert">
      {w(error)}{" "}
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={disabled}>
          {w(retryLabel)}
        </button>
      )}
    </div>
  ) : null;
}
export function LanguageSelect({ value, onChange, disabled }) {
  const { w } = useText();
  return (
    <label className="portal-field">
      {w("lang")}
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.entries(portalLanguages).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </label>
  );
}
export function Workspace({ children, section }) {
  const router = useRouter();
  const { w } = useText(),
    [error, setError] = useState("");
  const links = [
    ["overview", "/dashboard", LayoutDashboard],
    ["new", "/assistant", Plus],
    ["evidenceReport", "/complaints/evidence", Paperclip],
    ["complaints", "/complaints", FolderOpen],
    ["drafts", "/complaints?filter=drafts", FilePenLine],
    ["chats", "/complaints?filter=chats", MessagesSquare],
    ["awareness", "/awareness", BookOpen],
    ["profile", "/profile", Settings],
  ];
  async function logout() {
    try {
      await api("/api/account", "POST", { action: "logout" });
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <main className="portal-shell">
      <aside className="portal-rail">
        <div className="portal-rail-title">{w("rail")}</div>
        <nav aria-label={w("rail")}>
          {links.map(([key, href, Icon]) => (
            <Link
              key={key}
              aria-current={key === section ? "page" : undefined}
              href={href}
            >
              <Icon size={18} />
              {w(key)}
            </Link>
          ))}
          <button onClick={logout}>
            <LogOut size={18} />
            {w("logout")}
          </button>
        </nav>
        <Notice error={error} />
      </aside>
      <section className="portal-main">{children}</section>
    </main>
  );
}
export function Field({ label, ...props }) {
  return (
    <label className="portal-field">
      {label}
      <input {...props} />
    </label>
  );
}
