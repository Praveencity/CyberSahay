"use client";
import { portalLanguages } from "../config/languages";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Globe, Menu, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "./Language";
export function Header() {
  const { t, lang, setLang } = useLanguage(),
    path = usePathname();
  const [user, setUser] = useState(null);
  const [menuPath, setMenuPath] = useState(null);
  const menuButton = useRef(null);
  const menuOpen = menuPath === path;
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
  const activeHref = items.find(([href]) => path === href || (href !== "/" && path.startsWith(href + "/")))?.[0];
  const register = t("Register", "पंजीकरण", "ਰਜਿਸਟਰ");
  const accountHref = user ? "/dashboard" : "/login";
  const accountLabel = user
    ? t("Dashboard", "डैशबोर्ड", "ਡੈਸ਼ਬੋਰਡ")
    : t("Sign in", "लॉग इन", "ਲਾਗ ਇਨ");

  function closeOnEscape(event) {
    if (event.key === "Escape" && menuOpen && menuButton.current?.getClientRects().length) {
      setMenuPath(null);
      menuButton.current.focus();
    }
  }

  return (
    <header className="mast" onKeyDown={closeOnEscape}>
      <div className="container mast-inner">
        <Link className="brand" href="/" onClick={() => setMenuPath(null)}>
          <span className="brand-mark"><ShieldCheck size={22} aria-hidden="true" /></span> CyberSahay
        </Link>
        <button
          className="mast-toggle"
          type="button"
          ref={menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? t("Close menu", "मेनू बंद करें", "ਮੀਨੂ ਬੰਦ ਕਰੋ") : t("Open menu", "मेनू खोलें", "ਮੀਨੂ ਖੋਲ੍ਹੋ")}
          onClick={() => setMenuPath(menuOpen ? null : path)}
        >
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
        <nav
          id="site-navigation"
          data-open={menuOpen}
          aria-label={t("Navigation", "नेविगेशन", "ਨੇਵੀਗੇਸ਼ਨ")}
        >
          {items.map(([href, title]) => (
            <Link
              key={href}
              aria-current={href === activeHref ? (href === path ? "page" : "location") : undefined}
              href={href}
              onClick={() => setMenuPath(null)}
            >
              {title}
            </Link>
          ))}
          <div className="mast-menu-account">
            {!user && <Link href="/register" onClick={() => setMenuPath(null)}>{register}</Link>}
            <Link className="btn small" href={accountHref} onClick={() => setMenuPath(null)}>{accountLabel}</Link>
          </div>
        </nav>
        <div className="mast-actions">
          <label className="lang">
            <Globe size={16} aria-hidden="true" />
            <select
              aria-label={t("Language", "भाषा", "ਭਾਸ਼ਾ")}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {Object.entries(portalLanguages).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown className="lang-chevron" size={14} aria-hidden="true" />
          </label>
          {!user && <Link className="join-nav" href="/register">{register}</Link>}
          <Link className="btn small" href={accountHref}>{accountLabel}</Link>
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
        <nav aria-label={t("Footer navigation", "फ़ुटर नेविगेशन", "ਫੁੱਟਰ ਨੇਵੀਗੇਸ਼ਨ")}>
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
