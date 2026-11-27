"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "./Language";
import { useScrollReveal } from "./useScrollReveal";
import {
  LibraryBig,
  PhoneCall,
  FileText,
  Search,
} from "lucide-react";
import GuideToolkit from "./GuideToolkit";
import { SafetyDiagram } from "./SafetyVisual";
import { awarenessLanguages, awarenessPath, awarenessText, guideCopy } from "../config/awareness-language";
import { guideSources } from "../config/awareness-sources";
import { guideGroups, guides } from "../config/awareness";
import { groups } from "./guideGroups";
const guideCovers = {
  messages: "/awareness/messages-illustration.webp",
  accounts: "/awareness/accounts-illustration.webp",
};
const featuredTopics = Object.keys(guideSources);
const orderedTopics = [...featuredTopics, ...Object.keys(guides).filter((slug) => !Object.hasOwn(guideSources, slug))];

function useAwarenessLanguage(requestedLanguage) {
  const { lang: portalLanguage } = useLanguage();
  const selected = typeof requestedLanguage === "string" && Object.hasOwn(awarenessLanguages, requestedLanguage)
    ? requestedLanguage
    : undefined;
  const lang = selected || portalLanguage;
  return { lang, selected, t: (...copy) => awarenessText(lang, ...copy) };
}

function AwarenessLanguageLinks({ slug, group, lang, t }) {
  const label = t("Guide language", "मार्गदर्शिका की भाषा", "ਗਾਈਡ ਦੀ ਭਾਸ਼ਾ");
  return (
    <nav className="awareness-languages" aria-label={label}>
      <strong>{label}</strong>
      <ul>
        {Object.entries(awarenessLanguages).map(([id, name]) => (
          <li key={id}>
            <Link
              href={awarenessPath({ slug, group, lang: id })}
              lang={id}
              hrefLang={id}
              scroll={false}
              aria-current={lang === id ? "true" : undefined}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Category({ slug, t }) {
  const group = guideGroups[slug];
  const [Icon, ...name] = groups[group];
  return (
    <small className={`topic-kind ${group}`}>
      <Icon size={20} aria-hidden="true" />
      {t(...name)}
    </small>
  );
}

export function Awareness({ selectedGroup, requestedLanguage }) {
  const { lang, selected, t } = useAwarenessLanguage(requestedLanguage);
  const [query, setQuery] = useState("");
  const reveal = useScrollReveal(`${selectedGroup}:${lang}:${query}`);
  const group = Object.hasOwn(groups, selectedGroup) ? selectedGroup : "all";
  const terms = query.trim().normalize("NFKC").toLowerCase().split(/\s+/).filter(Boolean);
  const visible = orderedTopics.filter((slug) => {
    if (group !== "all" && group !== guideGroups[slug]) return false;
    if (!terms.length) return true;
    const category = groups[guideGroups[slug]].slice(1);
    const text = [...guides[slug], ...guideCopy(slug, lang), ...category, t(...category)]
      .join(" ").normalize("NFKC").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  return (
    <main className="container awareness-page" lang={lang} ref={reveal}>
      <header className="library-hero">
        <div>
          <h1>{t("Cyber awareness", "साइबर जागरूकता", "ਸਾਈਬਰ ਜਾਗਰੂਕਤਾ")}</h1>
          <p>
            {t(
              "Look up a message, payment request or account problem. Each guide explains what to check and what to keep.",
              "संदेश, भुगतान अनुरोध या खाते की समस्या खोजें। जानें क्या जाँचें और क्या सहेजें।",
              "ਸੁਨੇਹਾ, ਭੁਗਤਾਨ ਬੇਨਤੀ ਜਾਂ ਖਾਤੇ ਦੀ ਸਮੱਸਿਆ ਲੱਭੋ। ਜਾਣੋ ਕੀ ਜਾਂਚਣਾ ਹੈ ਤੇ ਕੀ ਸੰਭਾਲਣਾ ਹੈ।",
            )}
          </p>
        </div>
        <Image
          className="awareness-cover"
          src="/awareness/library-illustration.webp"
          alt=""
          width={960}
          height={720}
          sizes="(max-width: 720px) 90vw, 460px"
          fetchPriority="high"
        />
      </header>
      <AwarenessLanguageLinks group={group} lang={lang} t={t} />
      <section className="awareness-first-steps" data-scroll-reveal>
        <h2>{t("If you think it’s a scam", "अगर आपको ठगी का शक है", "ਜੇ ਤੁਹਾਨੂੰ ਠੱਗੀ ਦਾ ਸ਼ੱਕ ਹੈ", "প্রতারণা মনে হলে", "மோசடியாகத் தோன்றினால்")}</h2>
        <SafetyDiagram t={t} />
      </section>
      <div className="awareness-search">
        <label>
          {t("Find a safety topic", "सुरक्षा विषय खोजें", "ਸੁਰੱਖਿਆ ਵਿਸ਼ਾ ਲੱਭੋ")}{" "}
          <span className="guide-search-field">
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </span>
        </label>
      </div>
      <div className="library-filters">
        {["all", ...Object.keys(groups)].map((id) => (
          <Link
            key={id}
            data-topic={id}
            href={awarenessPath({ group: id, lang: selected })}
            scroll={false}
            aria-current={group === id ? "true" : undefined}
          >
            {id === "all"
              ? t("All topics", "सभी विषय", "ਸਾਰੇ ਵਿਸ਼ੇ")
              : t(...groups[id].slice(1))}
          </Link>
        ))}
      </div>
      <p className="guide-count" role="status">
        {visible.length
          ? lang === "en"
            ? `${visible.length} ${visible.length === 1 ? "guide" : "guides"}`
            : `${new Intl.NumberFormat(lang).format(visible.length)} ${t("Guides", "मार्गदर्शिकाएँ", "ਗਾਈਡਾਂ")}`
          : t("No matching topics.", "कोई विषय नहीं मिला।", "ਕੋਈ ਵਿਸ਼ਾ ਨਹੀਂ ਮਿਲਿਆ।")}
      </p>
      <div className="resource-grid">
        {visible.map((slug) => {
          const [title, summary] = guideCopy(slug, lang);
          return (
            <Link
              className="card awareness-topic"
              data-scroll-reveal
              data-topic={guideGroups[slug]}
              key={slug}
              href={awarenessPath({ slug, lang: selected })}
            >
              <Category slug={slug} t={t} />
              <h2>{title}</h2>
              <p>{summary}</p>
              <span>{t("Read guide", "मार्गदर्शिका पढ़ें", "ਗਾਈਡ ਪੜ੍ਹੋ")}</span>
            </Link>
          );
        })}
      </div>
      {!visible.length && (
        <Link href={awarenessPath({ lang: selected })} scroll={false} className="btn secondary" onClick={() => setQuery("")}>
          {t("Show all guides", "सभी मार्गदर्शिकाएँ दिखाएँ", "ਸਾਰੀਆਂ ਗਾਈਡਾਂ ਦਿਖਾਓ")}
        </Link>
      )}
      <Official translate={t} />
    </main>
  );
}
export function AwarenessGuide({ slug, notes, requestedLanguage }) {
  const { t, lang, selected } = useAwarenessLanguage(requestedLanguage);
  const [title, summary, warning, next] = guideCopy(slug, lang);
  const reveal = useScrollReveal(slug);
  const group = guideGroups[slug];
  const source = guideSources[slug];
  const cover = source && guideCovers[group];
  return (
    <main className="container awareness-page awareness-guide" lang={lang} ref={reveal}>
      <Link className="guide-back" href={awarenessPath({ lang: selected })}>
        <LibraryBig size={17} />{t("All safety topics", "सभी सुरक्षा विषय", "ਸਾਰੇ ਸੁਰੱਖਿਆ ਵਿਸ਼ੇ")}
      </Link>
      <header className={cover ? "guide-heading guide-heading-illustrated" : "guide-heading"} data-topic={group}>
        <div>
          <Category slug={slug} t={t} />
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
        {cover && (
          <Image
            className="awareness-cover"
            src={cover}
            alt=""
            width={960}
            height={540}
            sizes="(max-width: 720px) 90vw, 420px"
          />
        )}
      </header>
      <AwarenessLanguageLinks slug={slug} lang={lang} t={t} />
      <div className="guide-columns">
        <div className="guide-content" data-topic={group}>
          <section className="card warning-card" id="warning-signs">
            <h2>{t("Warning signs", "चेतावनी के संकेत", "ਚੇਤਾਵਨੀ ਦੇ ਸੰਕੇਤ")}</h2>
            <p>{warning}</p>
          </section>
          <GuideToolkit key={slug} group={group} t={t} />
          <section className="card" id="next-steps">
            <h2>{t("What you can do", "आप क्या कर सकते हैं", "ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ")}</h2>
            <p>{next || summary}</p>
          </section>
          {notes[lang] && <section className="card editor-note">
            <h2>{t("Editor’s note", "संपादक का नोट", "ਸੰਪਾਦਕ ਦਾ ਨੋਟ")}</h2><p>{notes[lang]}</p>
          </section>}
          <section className="guide-cta">
            <FileText size={30} />
            <div><h2>{t("Turn your notes into a clear complaint", "विवरण से स्पष्ट शिकायत बनाएँ", "ਵੇਰਵਿਆਂ ਤੋਂ ਸਪਸ਼ਟ ਸ਼ਿਕਾਇਤ ਬਣਾਓ")}</h2>
              <p>{t("Our guided workspace helps you organize the facts, review your draft and download a PDF. You submit it through official channels.", "सहायक से तथ्य व्यवस्थित करें, मसौदा जाँचें और पीडीएफ डाउनलोड करें। उसे आधिकारिक माध्यम से स्वयं जमा करें।", "ਸਹਾਇਕ ਨਾਲ ਤੱਥ ਸੰਗਠਿਤ ਕਰੋ, ਖਰੜਾ ਜਾਂਚੋ ਅਤੇ ਪੀਡੀਐੱਫ ਡਾਊਨਲੋਡ ਕਰੋ। ਇਸ ਨੂੰ ਅਧਿਕਾਰਤ ਮਾਧਿਅਮ ਰਾਹੀਂ ਖ਼ੁਦ ਜਮ੍ਹਾਂ ਕਰੋ।")}</p>
              <Link className="btn" href="/assistant">{t("Prepare a complaint", "शिकायत तैयार करें", "ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੋ")}</Link>
            </div>
          </section>
        </div>
        <aside className="guide-sidebar">
          <nav className="card guide-contents" aria-label={t("In this guide", "इस मार्गदर्शिका में", "ਇਸ ਗਾਈਡ ਵਿੱਚ")}>
            <strong>{t("In this guide", "इस मार्गदर्शिका में", "ਇਸ ਗਾਈਡ ਵਿੱਚ")}</strong>
            <a href="#warning-signs">{t("Warning signs", "चेतावनी के संकेत", "ਚੇਤਾਵਨੀ ਦੇ ਸੰਕੇਤ")}</a>
            <a href="#safety-check">{t("A safer response", "सुरक्षित प्रतिक्रिया", "ਸੁਰੱਖਿਅਤ ਜਵਾਬ")}</a>
            <a href="#action-checklist">{t("Action checklist", "कार्य सूची", "ਕਾਰਵਾਈ ਸੂਚੀ")}</a>
            <a href="#next-steps">{t("Next steps", "अगले कदम", "ਅਗਲੇ ਕਦਮ")}</a>
          </nav>
          <Official translate={t} />
      <section className="card">
        <h2>{t("Related guides", "संबंधित मार्गदर्शिकाएँ", "ਸਬੰਧਤ ਗਾਈਡਾਂ")}</h2>
        <ul>
          {Object.keys(guides)
            .filter(
              (id) => id !== slug && guideGroups[id] === guideGroups[slug],
            )
            .map((id) => (
              <li key={id}>
                <Link href={awarenessPath({ slug: id, lang: selected })}>
                  {guideCopy(id, lang)[0]}
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <section className="card">
        <h2>{t("Further reading", "और पढ़ें", "ਹੋਰ ਪੜ੍ਹੋ")}</h2>
        <ul>
          {source && <li><a href={source[0]}>{t(...source.slice(1))}</a></li>}
          <li>
            <a href="https://ps.keralapolice.gov.in/malappuramcyberps-ps/notifications/WHAT-TO-DO-IF-YOU-ARE-A-VICTIM-OF-CYBER-FRAUD-3541">
              {t(
                "Kerala Police · Steps after cyber fraud",
                "केरल पुलिस · साइबर ठगी के बाद",
                "ਕੇਰਲ ਪੁਲਿਸ · ਸਾਈਬਰ ਠੱਗੀ ਤੋਂ ਬਾਅਦ",
              )}
            </a>
          </li>
          {guideGroups[slug] === "messages" && (
            <li>
              <a href="https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams">
                {t(
                  "FTC · Recognizing phishing",
                  "एफटीसी · फ़िशिंग पहचानें",
                  "ਐੱਫਟੀਸੀ · ਫਿਸ਼ਿੰਗ ਪਛਾਣੋ",
                )}
              </a>
            </li>
          )}
          {["task-jobs", "shopping-and-job-scams"].includes(slug) && (
            <li>
              <a href="https://consumer.ftc.gov/articles/job-scams">
                {t(
                  "FTC · Job scams",
                  "एफटीसी · नौकरी की ठगी",
                  "ਐੱਫਟੀਸੀ · ਨੌਕਰੀ ਠੱਗੀ",
                )}
              </a>
            </li>
          )}
        </ul>
      </section>

          <section className="card source-card">
            <h2>{t("Trusted references", "विश्वसनीय संदर्भ", "ਭਰੋਸੇਯੋਗ ਹਵਾਲੇ")}</h2>
            <a href="https://www.npci.org.in/fraud-awareness">NPCI · {t("Payment safety", "भुगतान सुरक्षा", "ਭੁਗਤਾਨ ਸੁਰੱਖਿਆ")}</a>
            <a href="https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account">FTC · {t("Account recovery", "खाता रिकवरी", "ਖਾਤਾ ਰਿਕਵਰੀ")}</a>
          </section>
        </aside>
      </div>
    </main>
  );
}
function Official({ translate }) {
  const { t: portalText } = useLanguage();
  const t = translate || portalText;
  return (
    <section className="block card official-card">
      <PhoneCall size={23} aria-hidden="true" />
      <h3>
        {t(
          "Official reporting in India",
          "भारत में आधिकारिक रिपोर्टिंग",
          "ਭਾਰਤ ਵਿੱਚ ਅਧਿਕਾਰਤ ਰਿਪੋਰਟਿੰਗ",
        )}
      </h3>
      <p>
        {t(
          "For financial cyber fraud, contact your bank immediately and call the national helpline.",
          "वित्तीय साइबर ठगी में तुरंत अपने बैंक से संपर्क करें और राष्ट्रीय हेल्पलाइन पर कॉल करें।",
          "ਵਿੱਤੀ ਸਾਈਬਰ ਠੱਗੀ ਵਿੱਚ ਤੁਰੰਤ ਆਪਣੇ ਬੈਂਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਰਾਸ਼ਟਰੀ ਹੈਲਪਲਾਈਨ ਨੂੰ ਕਾਲ ਕਰੋ।",
        )}{" "}
        <a href="tel:1930">1930</a> ·{" "}
        <a href="https://cybercrime.gov.in">cybercrime.gov.in</a>
      </p>
    </section>
  );
}
export function Help() {
  const { t } = useLanguage();
  const entries = [
    [
      t(
        "How do I prepare a complaint?",
        "शिकायत कैसे तैयार करूँ?",
        "ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਤਿਆਰ ਕਰਾਂ?",
      ),
      t(
        "Sign in, describe the incident, then answer one question at a time. Review the details and correct anything that is inaccurate.",
        "लॉग इन करें, घटना बताएं और एक-एक सवाल का उत्तर दें। विवरण जाँचें और गलतियाँ सुधारें।",
        "ਲਾਗ ਇਨ ਕਰੋ, ਘਟਨਾ ਦੱਸੋ ਤੇ ਇੱਕ-ਇੱਕ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦਿਓ। ਵੇਰਵੇ ਚੈੱਕ ਕਰਕੇ ਗਲਤੀਆਂ ਸੁਧਾਰੋ।",
      ),
    ],
    [
      t(
        "What evidence should I keep?",
        "कौन से सबूत रखूँ?",
        "ਕਿਹੜੇ ਸਬੂਤ ਰੱਖਾਂ?",
      ),
      t(
        "Keep original messages, dates, transaction references and screenshots in a safe place. Describe the evidence without sharing passwords, PINs or OTPs.",
        "मूल संदेश, तारीखें, लेनदेन संदर्भ और स्क्रीनशॉट सुरक्षित रखें। पासवर्ड, पिन या ओटीपी साझा किए बिना सबूत बताएं।",
        "ਅਸਲ ਸੁਨੇਹੇ, ਤਾਰੀਖਾਂ, ਲੈਣ-ਦੇਣ ਹਵਾਲੇ ਅਤੇ ਸਕਰੀਨਸ਼ਾਟ ਸੰਭਾਲੋ। ਪਾਸਵਰਡ, ਪਿੰਨ ਜਾਂ ਓਟੀਪੀ ਸਾਂਝੇ ਕੀਤੇ ਬਿਨਾਂ ਸਬੂਤ ਦੱਸੋ।",
      ),
    ],
    [
      t(
        "How do I download and submit?",
        "डाउनलोड और जमा कैसे करूँ?",
        "ਡਾਊਨਲੋਡ ਅਤੇ ਜਮ੍ਹਾਂ ਕਿਵੇਂ ਕਰਾਂ?",
      ),
      t(
        "Open the draft preview and download the PDF. Submit separately through the official portal or your local police station.",
        "मसौदे का पूर्वावलोकन खोलें और पीडीएफ डाउनलोड करें। आधिकारिक पोर्टल या थाने में अलग से जमा करें।",
        "ਖਰੜੇ ਦੀ ਝਲਕ ਖੋਲ੍ਹੋ ਤੇ ਪੀਡੀਐੱਫ ਡਾਊਨਲੋਡ ਕਰੋ। ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਜਾਂ ਥਾਣੇ ਵਿੱਚ ਵੱਖਰੇ ਤੌਰ ਤੇ ਜਮ੍ਹਾਂ ਕਰੋ।",
      ),
    ],
  ];
  return (
    <main className="reading">
      <h1>{t("Help and resources", "सहायता और संसाधन", "ਮਦਦ ਅਤੇ ਸਰੋਤ")}</h1>
      {entries.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
      <Link href="/privacy">
        {t(
          "Privacy and data handling",
          "गोपनीयता और डेटा",
          "ਪਰਦੇਦਾਰੀ ਅਤੇ ਡਾਟਾ",
        )}
      </Link>
      <Official />
    </main>
  );
}
export function Information({ kind }) {
  const { t } = useLanguage();
  const pages = {
    about: [
      t("About CyberSahay", "CyberSahay के बारे में", "CyberSahay ਬਾਰੇ"),
      t(
        "CyberSahay helps you organize incident details into a complaint you can review and share with the appropriate authority. It is an independent project with no government or police affiliation.",
        "CyberSahay घटना का विवरण शिकायत में व्यवस्थित करता है। आप उसे जाँचकर उचित प्राधिकारी को दे सकते हैं। यह सरकार और पुलिस से स्वतंत्र परियोजना है।",
        "CyberSahay ਘਟਨਾ ਦੇ ਵੇਰਵੇ ਸ਼ਿਕਾਇਤ ਵਿੱਚ ਸੰਗਠਿਤ ਕਰਦਾ ਹੈ। ਤੁਸੀਂ ਇਸ ਨੂੰ ਚੈੱਕ ਕਰਕੇ ਸੰਬੰਧਿਤ ਅਧਿਕਾਰੀ ਨੂੰ ਦੇ ਸਕਦੇ ਹੋ। ਇਹ ਸਰਕਾਰ ਤੇ ਪੁਲਿਸ ਤੋਂ ਸੁਤੰਤਰ ਪ੍ਰੋਜੈਕਟ ਹੈ।",
      ),
    ],
    terms: [
      t("Terms of use", "उपयोग की शर्तें", "ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ"),
      t(
        "Review the facts before sharing a draft. Classification is a drafting aid. Saving a document here does not submit an official complaint or register an FIR.",
        "मसौदा साझा करने से पहले तथ्य जाँचें। वर्गीकरण केवल मसौदा तैयार करने में सहायता करता है। यहाँ सहेजने से आधिकारिक शिकायत या एफआईआर दर्ज नहीं होती।",
        "ਖਰੜਾ ਸਾਂਝਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਤੱਥ ਚੈੱਕ ਕਰੋ। ਵਰਗੀਕਰਨ ਖਰੜਾ ਬਣਾਉਣ ਲਈ ਹੈ। ਇੱਥੇ ਸੰਭਾਲਣ ਨਾਲ ਅਧਿਕਾਰਤ ਸ਼ਿਕਾਇਤ ਜਾਂ ਐੱਫਆਈਆਰ ਦਰਜ ਨਹੀਂ ਹੁੰਦੀ।",
      ),
    ],
    privacy: [
      t("Privacy and data handling", "गोपनीयता और डेटा", "ਪਰਦੇਦਾਰੀ ਅਤੇ ਡਾਟਾ"),
      t(
        "Your account stores your name and email. Saved drafts and conversation details allow you to resume and review your complaint. Remove drafts in your complaint list or use your profile to delete your history. Keep passwords, PINs and payment credentials out of incident descriptions.",
        "आपके खाते में नाम और ईमेल सहेजे जाते हैं। मसौदे और बातचीत सहेजने से आप शिकायत जारी रख सकते हैं। शिकायत सूची से मसौदा या प्रोफ़ाइल से इतिहास हटाएँ। विवरण में पासवर्ड, पिन या भुगतान क्रेडेंशियल न दें।",
        "ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਨਾਂ ਅਤੇ ਈਮੇਲ ਸੰਭਾਲੇ ਜਾਂਦੇ ਹਨ। ਖਰੜੇ ਤੇ ਗੱਲਬਾਤ ਸੰਭਾਲਣ ਨਾਲ ਤੁਸੀਂ ਸ਼ਿਕਾਇਤ ਜਾਰੀ ਰੱਖ ਸਕਦੇ ਹੋ। ਸ਼ਿਕਾਇਤ ਸੂਚੀ ਤੋਂ ਖਰੜਾ ਜਾਂ ਪ੍ਰੋਫਾਈਲ ਤੋਂ ਇਤਿਹਾਸ ਮਿਟਾਓ। ਵੇਰਵੇ ਵਿੱਚ ਪਾਸਵਰਡ, ਪਿੰਨ ਜਾਂ ਭੁਗਤਾਨ ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਨਾ ਦਿਓ।",
      ),
    ],
  };
  const [title, body] = pages[kind];
  return (
    <main className="reading">
      <h1>{title}</h1>
      <p>{body}</p>
      {kind === "privacy" && (
        <>
          <p>
            {t(
              "Admins can look up account names and email addresses to manage Member and Guide editor roles.",
              "प्रशासक सदस्य और मार्गदर्शिका संपादक भूमिकाएँ प्रबंधित करने के लिए खातों के नाम और ईमेल पते देख सकते हैं।",
              "ਪ੍ਰਬੰਧਕ ਮੈਂਬਰ ਅਤੇ ਗਾਈਡ ਸੰਪਾਦਕ ਭੂਮਿਕਾਵਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰਨ ਲਈ ਖਾਤਿਆਂ ਦੇ ਨਾਂ ਅਤੇ ਈਮੇਲ ਪਤੇ ਵੇਖ ਸਕਦੇ ਹਨ।",
            )}
          </p>
          <p>
            {t(
              "Evidence files and notes are stored with your complaint. Only your signed-in account can retrieve them through CyberSahay. Removing a file, its complaint, or your account removes the associated files from the active database.",
              "साक्ष्य फ़ाइलें और नोट शिकायत के साथ सहेजे जाते हैं। CyberSahay में आपके साइन इन खाते से ही उन्हें पाया जा सकता है। फ़ाइल, उससे जुड़ी शिकायत या खाता हटाने से संबंधित फ़ाइलें सक्रिय डेटाबेस से हट जाती हैं।",
              "ਸਬੂਤ ਦੀਆਂ ਫ਼ਾਈਲਾਂ ਅਤੇ ਨੋਟ ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਨਾਲ ਸੰਭਾਲੇ ਜਾਂਦੇ ਹਨ। CyberSahay ਵਿੱਚ ਤੁਹਾਡੇ ਸਾਈਨ ਇਨ ਖਾਤੇ ਰਾਹੀਂ ਹੀ ਉਹ ਮਿਲ ਸਕਦੇ ਹਨ। ਫ਼ਾਈਲ, ਉਸ ਦੀ ਸ਼ਿਕਾਇਤ ਜਾਂ ਖਾਤਾ ਮਿਟਾਉਣ ਨਾਲ ਸਬੰਧਿਤ ਫ਼ਾਈਲਾਂ ਚਾਲੂ ਡਾਟਾਬੇਸ ਤੋਂ ਮਿਟ ਜਾਂਦੀਆਂ ਹਨ।",
            )}
          </p>
          <p>
            {t(
              "When an AI provider is configured, it receives selected incident keywords, language and predefined question fields to suggest a category and write follow-up questions. The assistant also works without an AI provider. A session cookie keeps you signed in.",
              "एआई सेवा चालू होने पर श्रेणी सुझाने और अगला सवाल लिखने के लिए उसे घटना के चुने हुए शब्द, भाषा और तय सवालों के विषय भेजे जाते हैं। सहायक एआई सेवा के बिना भी काम करता है। सत्र कुकी आपको लॉग इन रखती है।",
              "ਏਆਈ ਸੇਵਾ ਚਾਲੂ ਹੋਣ ਤੇ ਸ਼੍ਰੇਣੀ ਸੁਝਾਉਣ ਅਤੇ ਅਗਲਾ ਸਵਾਲ ਲਿਖਣ ਲਈ ਉਸ ਨੂੰ ਘਟਨਾ ਦੇ ਚੁਣੇ ਸ਼ਬਦ, ਭਾਸ਼ਾ ਅਤੇ ਤੈਅ ਸਵਾਲਾਂ ਦੇ ਵਿਸ਼ੇ ਭੇਜੇ ਜਾਂਦੇ ਹਨ। ਸਹਾਇਕ ਏਆਈ ਸੇਵਾ ਤੋਂ ਬਿਨਾਂ ਵੀ ਕੰਮ ਕਰਦਾ ਹੈ। ਸੈਸ਼ਨ ਕੂਕੀ ਤੁਹਾਨੂੰ ਲਾਗ ਇਨ ਰੱਖਦੀ ਹੈ।",
            )}
          </p>
        </>
      )}
      <Official />
    </main>
  );
}
