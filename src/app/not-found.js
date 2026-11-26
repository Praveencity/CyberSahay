"use client";

import Link from "next/link";
import { useLanguage } from "@/components/Language";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <main className="reading">
      <h1>{t("Page not found", "पेज नहीं मिला", "ਪੰਨਾ ਨਹੀਂ ਮਿਲਿਆ")}</h1>
      <Link className="btn" href="/">
        {t("Return home", "मुखपृष्ठ पर जाएँ", "ਮੁੱਖ ਪੰਨੇ ’ਤੇ ਜਾਓ")}
      </Link>
    </main>
  );
}
