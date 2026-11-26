"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText, Globe, History, MessageSquareText, PhoneCall } from "lucide-react";
import { groups } from "@/components/guideGroups";
import { useLanguage } from "@/components/Language";
import { useScrollReveal } from "@/components/useScrollReveal";
import { starters } from "@/components/portal/starters";
import { words } from "@/components/portal/words";
import { guideCopy } from "@/config/awareness-language";
import { guideGroups } from "@/config/awareness";

const featuredGuides = ["qr-refund", "impersonation", "account-recovery"];

export default function Home() {
  const { t, lang } = useLanguage();
  const reveal = useScrollReveal();
  const w = (key) => words(key, lang);

  return (
    <main className="home" ref={reveal}>
      <section className="urgent" aria-labelledby="urgent-title">
        <div className="container urgent-inner">
          <PhoneCall size={19} aria-hidden="true" />
          <div className="urgent-copy">
            <strong id="urgent-title">
              {t("Lost money to online fraud?", "ऑनलाइन ठगी में पैसे खोए?", "ਆਨਲਾਈਨ ਠੱਗੀ ਵਿੱਚ ਪੈਸੇ ਗੁਆਏ?")}
            </strong>
            <span>
              {t("Contact your bank immediately.", "तुरंत अपने बैंक से संपर्क करें।", "ਤੁਰੰਤ ਆਪਣੇ ਬੈਂਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।")}
            </span>
          </div>
          <div className="urgent-links">
            <a className="call" href="tel:1930">{t("Call", "कॉल करें", "ਕਾਲ ਕਰੋ")} 1930</a>
            <a href="https://cybercrime.gov.in">
              {t("Official reporting portal", "आधिकारिक रिपोर्टिंग पोर्टल", "ਅਧਿਕਾਰਤ ਰਿਪੋਰਟਿੰਗ ਪੋਰਟਲ")}
            </a>
          </div>
        </div>
      </section>

      <section className="home-feature">
        <div className="container hero">
          <div className="hero-copy">
            <p className="hero-context">
              {t("Cybercrime support in India", "भारत में साइबर अपराध सहायता", "ਭਾਰਤ ਵਿੱਚ ਸਾਈਬਰ ਅਪਰਾਧ ਸਹਾਇਤਾ")}
            </p>
            <h1>
              {t("Get help reporting", "साइबर अपराध की", "ਸਾਈਬਰ ਅਪਰਾਧ ਦੀ")}{" "}
              <em>{t("cybercrime.", "शिकायत बनाएँ।", "ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੋ।")}</em>
            </h1>
            <p className="hero-description">
              {t(
                "Describe what happened, build a complaint in your language, and download a copy to submit through official channels.",
                "घटना बताएँ, अपनी भाषा में शिकायत तैयार करें और आधिकारिक माध्यम से जमा करने के लिए उसकी प्रति डाउनलोड करें।",
                "ਘਟਨਾ ਦੱਸੋ, ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੋ ਅਤੇ ਅਧਿਕਾਰਤ ਮਾਧਿਅਮ ਰਾਹੀਂ ਜਮ੍ਹਾਂ ਕਰਨ ਲਈ ਕਾਪੀ ਡਾਊਨਲੋਡ ਕਰੋ।",
              )}
            </p>
            <div className="actions">
              <Link className="btn" href="/assistant">
                <FileText size={18} aria-hidden="true" />
                {t("Start a complaint", "शिकायत शुरू करें", "ਸ਼ਿਕਾਇਤ ਸ਼ੁਰੂ ਕਰੋ")}
              </Link>
              <Link className="btn secondary" href="/complaints?filter=drafts">
                <History size={18} aria-hidden="true" />
                {t("Resume a draft", "सहेजा मसौदा खोलें", "ਸੰਭਾਲਿਆ ਖਰੜਾ ਖੋਲ੍ਹੋ")}
              </Link>
            </div>
            <p className="hero-languages"><Globe size={16} aria-hidden="true" /> English <span>·</span> हिन्दी <span>·</span> Hinglish <span>·</span> ਪੰਜਾਬੀ</p>
          </div>
          <div className="hero-art">
            <Image src="/complaint-illustration.webp" alt="" width={1280} height={960} sizes="(max-width: 720px) 100vw, (max-width: 1200px) 45vw, 520px" fetchPriority="high" loading="eager" />
          </div>
        </div>
      </section>

      <div className="container">
        <nav className="home-topics" data-scroll-reveal aria-labelledby="home-topics-title">
          <div className="section-heading">
            <h2 id="home-topics-title">{t("Find help by topic", "विषय के अनुसार सहायता पाएँ", "ਵਿਸ਼ੇ ਮੁਤਾਬਕ ਮਦਦ ਲੱਭੋ")}</h2>
            <Link href="/awareness">{t("Browse the library", "सभी मार्गदर्शिकाएँ", "ਸਾਰੀਆਂ ਗਾਈਡਾਂ")}</Link>
          </div>
          <div className="home-topic-grid">
            {Object.entries(groups).map(([id, [Icon, ...label]]) => (
              <Link key={id} data-topic={id} href={`/awareness?group=${id}`}>
                <span className="topic-icon"><Icon aria-hidden="true" size={21} strokeWidth={1.7} /></span>
                <span>{t(...label)}</span>
              </Link>
            ))}
          </div>
        </nav>

        <section className="home-assistant" data-scroll-reveal aria-labelledby="home-assistant-title">
          <div>
            <div className="home-assistant-icon"><MessageSquareText size={23} aria-hidden="true" /></div>
            <h2 id="home-assistant-title">{t("AI complaint assistant", "एआई शिकायत सहायक", "ਏਆਈ ਸ਼ਿਕਾਇਤ ਸਹਾਇਕ")}</h2>
            <p>
              {t(
                "Answer one question at a time. The assistant organizes your answers into a draft you can edit and download.",
                "एक बार में एक सवाल का जवाब दें। सहायक आपके जवाबों से ऐसा मसौदा तैयार करता है जिसे आप संपादित और डाउनलोड कर सकते हैं।",
                "ਇੱਕ ਵਾਰ ਵਿੱਚ ਇੱਕ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦਿਓ। ਸਹਾਇਕ ਤੁਹਾਡੇ ਜਵਾਬਾਂ ਤੋਂ ਖਰੜਾ ਬਣਾਉਂਦਾ ਹੈ ਜਿਸ ਨੂੰ ਤੁਸੀਂ ਸੋਧ ਅਤੇ ਡਾਊਨਲੋਡ ਕਰ ਸਕਦੇ ਹੋ।",
              )}
            </p>
            <p className="home-ai-note">
              {t(
                "When AI is available, it suggests a category from a limited set of keywords. You can change the category when you review your draft.",
                "एआई उपलब्ध होने पर यह चुनिंदा शब्दों से श्रेणी सुझाता है। मसौदे की समीक्षा करते समय आप श्रेणी बदल सकते हैं।",
                "ਏਆਈ ਉਪਲਬਧ ਹੋਣ ’ਤੇ ਇਹ ਚੁਣੇ ਹੋਏ ਸ਼ਬਦਾਂ ਤੋਂ ਸ਼੍ਰੇਣੀ ਸੁਝਾਉਂਦਾ ਹੈ। ਖਰੜੇ ਦੀ ਸਮੀਖਿਆ ਕਰਦਿਆਂ ਤੁਸੀਂ ਸ਼੍ਰੇਣੀ ਬਦਲ ਸਕਦੇ ਹੋ।",
              )}
            </p>
          </div>
          <div className="home-starters">
            <h3>{w("startWithPrompt")}</h3>
            {starters.map(({ id, topic, Icon, title }) => (
              <Link key={id} data-topic={topic} href={`/assistant?starter=${id}`}>
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                <span>{w(title)}</span>
              </Link>
            ))}
            <Link className="home-freeform" href="/assistant">
              {t("Start with your own words", "अपने शब्दों में शुरू करें", "ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਸ਼ੁਰੂ ਕਰੋ")}
            </Link>
          </div>
        </section>

        <section className="home-library" data-scroll-reveal aria-labelledby="home-guides-title">
          <div className="section-heading">
            <h2 id="home-guides-title">{t("Cyber safety guides", "साइबर सुरक्षा मार्गदर्शिकाएँ", "ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਗਾਈਡਾਂ")}</h2>
          </div>
          <div className="resource-grid">
            {featuredGuides.map((slug) => {
              const [title, summary] = guideCopy(slug, lang);
              const topic = guideGroups[slug];
              const [Icon, ...category] = groups[topic];
              return (
                <Link key={slug} className="awareness-topic" data-topic={topic} href={`/awareness/${slug}`}>
                  <small className="topic-kind"><Icon size={17} aria-hidden="true" />{t(...category)}</small>
                  <h3>{title}</h3>
                  <p>{summary}</p>
                  <span><BookOpen size={16} aria-hidden="true" />{t("Read guide", "मार्गदर्शिका पढ़ें", "ਗਾਈਡ ਪੜ੍ਹੋ")}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
