import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { words } from "../components/portal/words";
import { fields, label, SKIPPED, UNKNOWN, NOT_APPLICABLE } from "./workflow";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let fontStyle;
async function styles() {
  if (!fontStyle)
    fontStyle = Promise.all(
      ["NotoSans", "NotoSansDevanagari", "NotoSansGurmukhi"].map(
        async (name) => {
          const font = await readFile(
            path.join(process.cwd(), "public", "fonts", name + "-Regular.ttf"),
          );
          return (
            "@font-face{font-family:" +
            name +
            ";src:url(data:font/ttf;base64," +
            font.toString("base64") +
            ")}"
          );
        },
      ),
    )
      .then((r) => r.join(""))
      .catch((e) => {
        fontStyle = null;
        throw e;
      });
  return fontStyle;
}
export async function generatePdf(c, files = []) {
  const l = (k) => escape(label(k, c.language));
  const value = (k) => {
    const v = c.answers[k];
    return !v
      ? l("missing")
      : [SKIPPED, UNKNOWN, NOT_APPLICABLE].includes(v)
        ? l(v)
        : escape(v);
  };
  const rows = fields(c.category)
    .filter((k) => k !== "name")
    .map(
      (k) =>
        "<section><strong>" +
        l(k) +
        "</strong><div>" +
        value(k) +
        "</div></section>",
    )
    .join("");
  const evidence = files.length
    ? "<section><strong>" + escape(words("listOfEvidence", c.language)) + "</strong><ul>" +
      files.map((file) => "<li><div>" + escape(file.name) + "</div>" +
        (file.note ? "<div>" + escape(file.note) + "</div>" : "") + "</li>").join("") +
      "</ul></section>"
    : "";
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    chromiumSandbox: process.env.CHROMIUM_SANDBOX === "true",
  });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.setContent(
      '<html lang="' +
        c.language +
        '"><meta charset=utf-8><style>' +
        (await styles()) +
        "body{font:11pt/1.6 NotoSans,NotoSansDevanagari,NotoSansGurmukhi;color:#142b46}h1{font-size:19pt}section{padding:6pt 0;border-bottom:1px solid #dae2e8}strong{display:block;break-after:avoid;color:#274e77}div{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#526477}</style><h1>" +
        l("draft") +
        "</h1><p>" +
        l("to") +
        "</p><h2>" +
        l("subject") +
        " — " +
        l(c.category) +
        "</h2><p>" +
        l("greeting") +
        "</p><p>" +
        l("intro") +
        "</p><section><strong>" +
        l("name") +
        "</strong>" +
        value("name") +
        "</section>" +
        rows +
        evidence +
        "<p>" +
        l("request") +
        "</p><p>" +
        l("closing") +
        "<br>" +
        value("name") +
        "<br>" +
        escape(
          new Intl.DateTimeFormat(c.language + "-IN", {
            dateStyle: "long",
            timeZone: "Asia/Kolkata",
          }).format(new Date()),
        ) +
        "</p></html>",
    );
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      margin: { top: "18mm", bottom: "18mm", left: "20mm", right: "20mm" },
    });
  } finally {
    await browser.close();
  }
}
