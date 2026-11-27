"use client";
import { portalLanguages } from "../../config/languages";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { roleLabelKeys } from "./words";
import {
  api,
  Field,
  loginPath,
  Notice,
  useResource,
  useText,
  Workspace,
} from "./shared";
export function Auth({ register = false }) {
  const { w, lang, setLang } = useText(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [next, setNext] = useState("/dashboard");
  useEffect(() => {
    const raw = new URLSearchParams(location.search).get("next");
    if (raw) {
      try {
        const u = new URL(raw, location.origin);
        if (
          u.origin === location.origin &&
          /^\/(assistant|complaints|dashboard|profile|editor|admin)(\/|$)/.test(
            u.pathname,
          )
        )
          setNext(u.pathname + u.search);
      } catch {}
    }
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const form = Object.fromEntries(new FormData(e.currentTarget));
    if (register && form.password !== form.confirm) {
      setError("mismatch");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/account", "POST", {
        action: register ? "register" : "login",
        email: form.email,
        password: form.password,
        ...(register ? { name: form.name, language: lang } : {}),
      });
      if (result.user?.language) setLang(result.user.language);
      location.assign(next);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <main className="portal-auth">
      <section className="portal-card">
        <LockKeyhole className="portal-glyph" />
        <h1>{w(register ? "join" : "welcome")}</h1>
        <p>{w("authIntro")}</p>
        <form onSubmit={submit}>
          {register && (
            <Field
              label={w("name")}
              name="name"
              autoComplete="name"
              maxLength={100}
              required
            />
          )}
          <Field
            label={w("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
          <Field
            label={w("password")}
            name="password"
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            aria-describedby={register ? "password-hint" : undefined}
            required
            minLength={register ? 12 : 1}
            maxLength={256}
          />
          {register && <small id="password-hint">{w("passHint")}</small>}
          {register && (
            <Field
              label={w("confirm")}
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          )}
          <Notice error={error} />
          <button className="portal-primary" disabled={busy}>
            {w(busy ? "loading" : register ? "register" : "login")}
          </button>
        </form>
        <Link
          className="portal-link"
          href={
            (register ? "/login" : "/register") +
            "?next=" +
            encodeURIComponent(next)
          }
        >
          {w(register ? "login" : "register")}
        </Link>
      </section>
    </main>
  );
}
export function Profile() {
  const router = useRouter();
  const { w, setLang } = useText(),
    resource = useResource("/api/account"),
    user = resource.data?.user;
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource.data && !user) location.replace(loginPath());
  }, [resource.data, user]);
  async function submit(event, action) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget,
      data = Object.fromEntries(new FormData(form));
    if (
      ["delete", "clear"].includes(action) &&
      !window.confirm(w("confirmRemove"))
    )
      return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/api/account", "POST", { ...data, action });
      if (action === "delete") {
        router.replace("/");
        router.refresh();
        return;
      }
      if (action === "update") {
        setLang(data.language);
        window.dispatchEvent(new Event("account-updated"));
      } else form.reset();
      setMessage("saved");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace section="profile">
      <h1>{w("profile")}</h1>
      <Notice
        error={resource.error || error}
        onRetry={resource.error ? resource.reload : undefined}
      />
      <p role="status">{w(message)}</p>
      {user ? (
        <div className="portal-profile">
          <form className="portal-card" onSubmit={(e) => submit(e, "update")}>
            <p className="portal-access">
              {w("access")} ·{" "}
              {w(roleLabelKeys[user.role])}
            </p>
            {user.role === "EDITOR" && (
              <Link href="/editor">{w("editorRole")}</Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin">{w("manageRoles")}</Link>
            )}
            <Field label={w("email")} value={user.email} readOnly />
            <Field
              label={w("name")}
              name="name"
              required
              maxLength={100}
              defaultValue={user.name}
            />
            <label className="portal-field">
              {w("lang")}
              <select name="language" defaultValue={user.language || "en"}>
                {Object.entries(portalLanguages).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>
            <button className="portal-primary" disabled={busy}>
              {w("save")}
            </button>
          </form>
          <form className="portal-card" onSubmit={(e) => submit(e, "password")}>
            <h2>{w("changePass")}</h2>
            <Field
              label={w("current")}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              label={w("newPass")}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
            />
            <button className="portal-secondary" disabled={busy}>
              {w("changePass")}
            </button>
          </form>
          <form
            className="portal-card"
            onSubmit={(e) => submit(e, e.nativeEvent.submitter.value)}
          >
            <h2>{w("manage")}</h2>
            <Field
              label={w("current")}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <div className="portal-actions">
              <button value="clear" className="portal-danger" disabled={busy}>
                {w("clear")}
              </button>
              <button value="delete" className="portal-danger" disabled={busy}>
                {w("deleteAccount")}
              </button>
            </div>
          </form>
        </div>
      ) : (
        !resource.error && <p role="status">{w("loading")}</p>
      )}
    </Workspace>
  );
}
