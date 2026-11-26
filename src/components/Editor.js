"use client";
import { portalLanguages } from "../config/languages";
import { useState } from "react";
import Link from "next/link";
import { guideCopy } from "@/config/awareness-language";
import { guides } from "@/config/awareness";
import { useLanguage } from "./Language";
import { useResource, api } from "./portal/shared";
export default function Editor() {
  const { t, lang } = useLanguage();
  const [topic, setTopic] = useState(Object.keys(guides)[0]),
    [language, setLanguage] = useState(lang);
  return (
    <main className="container editorial">
      <h1>{t("Guide editor", "मार्गदर्शिका संपादक", "ਗਾਈਡ ਸੰਪਾਦਕ")}</h1>
      <p>
        {t(
          "Publish a local safety note on a guide. Readers see it in the selected language.",
          "मार्गदर्शिका पर सुरक्षा नोट प्रकाशित करें। पाठक इसे चुनी गई भाषा में देखेंगे।",
          "ਗਾਈਡ ਉੱਤੇ ਸੁਰੱਖਿਆ ਨੋਟ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ। ਪਾਠਕ ਇਸਨੂੰ ਚੁਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਵੇਖਣਗੇ।",
        )}
      </p>
      <label className="field">
        {t("Guide", "मार्गदर्शिका", "ਗਾਈਡ")}
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          {Object.keys(guides).map((slug) => (
            <option value={slug} key={slug}>
              {guideCopy(slug, lang)[0]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        {t("Note language", "नोट की भाषा", "ਨੋਟ ਦੀ ਭਾਸ਼ਾ")}
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {Object.entries(portalLanguages).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </label>
      <Note key={topic + language} topic={topic} language={language} />
      <Link href={"/awareness/" + topic}>
        {t("View guide", "मार्गदर्शिका देखें", "ਗਾਈਡ ਵੇਖੋ")}
      </Link>
    </main>
  );
}
function Note({ topic, language }) {
  const { t } = useLanguage(),
    resource = useResource(
      "/api/editor?" + new URLSearchParams({ topic, language }),
    );
  const [draft, setDraft] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const data = await api("/api/editor", "PUT", {
        topic,
        language,
        version: resource.data.version,
        text: draft,
      });
      resource.setData(data);
      setDraft(null);
      setMessage(t("Published.", "प्रकाशित हुआ।", "ਪ੍ਰਕਾਸ਼ਿਤ ਹੋਇਆ।"));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="card stack" onSubmit={submit}>
      <label className="field">
        {t("Public safety note", "सार्वजनिक सुरक्षा नोट", "ਜਨਤਕ ਸੁਰੱਖਿਆ ਨੋਟ")}
        <textarea
          rows="6"
          maxLength="2400"
          disabled={!resource.data || busy}
          value={draft ?? resource.data?.text ?? ""}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <small>
        {t(
          "Publish an empty note to remove it from the guide.",
          "नोट हटाने के लिए खाली नोट प्रकाशित करें।",
          "ਨੋਟ ਹਟਾਉਣ ਲਈ ਖਾਲੀ ਨੋਟ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ।",
        )}
      </small>
      <div className="actions">
        <button
          className="btn"
          disabled={!resource.data || draft === null || busy}
        >
          {t("Publish note", "नोट प्रकाशित करें", "ਨੋਟ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ")}
        </button>
        <button
          className="btn secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            resource.reload();
            setDraft(null);
            setMessage("");
          }}
        >
          {t("Reload saved note", "सहेजा नोट खोलें", "ਸੰਭਾਲਿਆ ਨੋਟ ਖੋਲ੍ਹੋ")}
        </button>
      </div>
      <p role="status">{resource.error || message}</p>
    </form>
  );
}
