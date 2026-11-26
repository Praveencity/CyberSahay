"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import { portalLanguages } from "../config/languages";
import { hinglishUi } from "../locales/hinglish-ui";

const Language = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, update] = useState("en");
  useEffect(() => {
    const saved = document.cookie.match(
      /(?:^|; )language=([^;]+)(?:;|$)/,
    )?.[1];
    if (Object.hasOwn(portalLanguages, saved)) update(saved);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  function setLang(value, onChange) {
    if (!Object.hasOwn(portalLanguages, value)) return;
    function commit() {
      onChange?.();
      update(value);
      document.cookie = "language=" + value + "; Path=/; SameSite=Lax; Max-Age=31536000";
    }
    if ((lang !== value || onChange) && document.startViewTransition &&
        window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      // Capture the translated DOM before the browser starts revealing it.
      return document.startViewTransition(() => flushSync(commit)).updateCallbackDone;
    } else {
      commit();
    }
  }
  const t = (en, hi, pa) => ({ hi, pa, "hi-Latn": hinglishUi[en] })[lang] || en;
  return (
    <Language.Provider value={{ lang, setLang, t }}>
      {children}
    </Language.Provider>
  );
}
export const useLanguage = () => useContext(Language);
