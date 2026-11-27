"use client";

import { useState } from "react";
import { api, Field, Notice, useText } from "./shared";
import { roleLabelKeys } from "./words";

const accountsUrl = "/api/admin/accounts";

export default function Admin() {
  const { w } = useText();
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function lookup(event) {
    event.preventDefault();
    if (busy) return;
    const email = new FormData(event.currentTarget).get("email");
    setAccount(null);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api(accountsUrl, "POST", { email });
      setAccount(result.account);
      setRole(result.account.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (busy || role === account.role) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api(accountsUrl, "PATCH", {
        id: account.id,
        currentRole: account.role,
        role,
      });
      setAccount({ ...account, role: result.role });
      setMessage("saved");
    } catch (err) {
      if (err.status === 409 || err.status === 403) setAccount(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="editorial">
      <h1>{w("manageRoles")}</h1>
      <p>{w("roleLookupHelp")}</p>
      <form className="card stack" onSubmit={lookup}>
        <Field label={w("email")} name="email" type="email" maxLength={254} required />
        <div className="portal-actions">
          <button className="portal-primary" disabled={busy}>{w("findAccount")}</button>
        </div>
      </form>
      {account && (
        <form className="card stack" onSubmit={save}>
          <Field label={w("name")} value={account.name} readOnly />
          <Field label={w("email")} value={account.email} readOnly />
          <label className="portal-field">
            {w("access")}
            <select value={role} onChange={(event) => setRole(event.target.value)} disabled={busy}>
              <option value="MEMBER">{w(roleLabelKeys.MEMBER)}</option>
              <option value="EDITOR">{w(roleLabelKeys.EDITOR)}</option>
            </select>
          </label>
          <div className="portal-actions">
            <button className="portal-primary" disabled={busy || role === account.role}>
              {w("saveRole")}
            </button>
          </div>
        </form>
      )}
      <Notice error={error} />
      <p role="status">{w(busy ? "loading" : message)}</p>
    </main>
  );
}
