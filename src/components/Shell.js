"use client";
import { portalLanguages } from "../config/languages";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, Globe, ShieldCheck } from "lucide-react";
import { useLanguage } from "./Language";
export function Header() {
  const { t, lang, setLang } = useLanguage(),
    path = usePathname();
  const [user, setUser] = useState(null);
  useEffect(() => {
    let active = true;
    fetch("/api/account", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active) setUser(d.user);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);
  const items = [
    ["/", t("Home", "मुखपृष्ठ", "ਮੁੱਖ ਪੰਨਾ")],
    ["/assistant", t("AI Assistant", "एआई सहायक", "ਏਆਈ ਸਹਾਇਕ")],
    ["/complaints/evidence", t("Evidence", "साक्ष्य", "ਸਬੂਤ")],
    ["/awareness", t("Cyber Awareness", "साइबर जागरूकता", "ਸਾਈਬਰ ਜਾਗਰੂਕਤਾ")],
    ...(user?.role === "EDITOR"
      ? [["/editor", t("Guide editor", "मार्गदर्शिका संपादक", "ਗਾਈਡ ਸੰਪਾਦਕ")]]
      : []),
    ["/help", t("Help", "सहायता", "ਮਦਦ")],
  ];
  return (
    <header className="mast">
      <div className="container mast-inner">
        <Link className="brand" href="/">
          <span className="brand-mark"><ShieldCheck size={22} aria-hidden="true" /></span> CyberSahay
        </Link>
        <nav aria-label="Navigation">
          {items.map(([href, title]) => (
            <Link
              key={href}
              aria-current={
                path === href || (href !== "/" && path.startsWith(href + "/"))
                  ? "page"
                  : undefined
              }
              href={href}
            >
              {title}
            </Link>
          ))}
        </nav>
        <div className="mast-actions">
          <label className="lang">
            <Globe size={16} aria-hidden="true" />
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {Object.entries(portalLanguages).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown className="lang-chevron" size={14} aria-hidden="true" />
          </label>
          {!user && (
            <Link className="join-nav" href="/register">
              {t("Register", "पंजीकरण", "ਰਜਿਸਟਰ")}
            </Link>
          )}
          <Link className="btn small" href={user ? "/dashboard" : "/login"}>
            {user
              ? t("Dashboard", "डैशबोर्ड", "ਡੈਸ਼ਬੋਰਡ")
              : t("Sign in", "लॉग इन", "ਲਾਗ ਇਨ")}
          </Link>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="foot">
      <div className="container">
        <strong>CyberSahay</strong>
        <p>
          {t(
            "Independent complaint assistance. Unaffiliated with the Indian government or police.",
            "स्वतंत्र शिकायत सहायता। भारत सरकार या पुलिस से संबद्ध नहीं है।",
            "ਸੁਤੰਤਰ ਸ਼ਿਕਾਇਤ ਸਹਾਇਤਾ। ਭਾਰਤ ਸਰਕਾਰ ਜਾਂ ਪੁਲਿਸ ਨਾਲ ਸਬੰਧਤ ਨਹੀਂ ਹੈ।",
          )}
        </p>
        <nav>
          {[
            ["/about", t("About", "परिचय", "ਜਾਣਕਾਰੀ")],
            ["/privacy", t("Privacy", "गोपनीयता", "ਪਰਦੇਦਾਰੀ")],
            ["/terms", t("Terms", "शर्तें", "ਸ਼ਰਤਾਂ")],
            ["/help", t("Help", "सहायता", "ਮਦਦ")],
            [
              "https://cybercrime.gov.in",
              t(
                "Official reporting portal",
                "आधिकारिक रिपोर्टिंग पोर्टल",
                "ਅਧਿਕਾਰਤ ਰਿਪੋਰਟਿੰਗ ਪੋਰਟਲ",
              ),
            ],
          ].map(([h, s]) => (
            <Link key={h} href={h}>
              {s}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
