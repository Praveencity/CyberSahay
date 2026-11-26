// Run against the local dev server: node --env-file=.env tests/design.mjs
// Synthetic account and complaint responses; no database writes.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { sealData } from "iron-session";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
await mkdir("/tmp/cybersahay-design", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 900 }, colorScheme: "light" });
    await context.addCookies([{ name: "portal_session", url: baseURL, value: await sealData({ uid: "design-test", version: 0 }, { password: process.env.AUTH_SECRET, ttl: 43200 }) }]);
    await context.addInitScript(() => localStorage.setItem("theme", "dark"));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/api/account", (r) => r.fulfill({ json: { user: { name: "Design test", role: "MEMBER" } } }));
    await page.route("**/api/complaints", (r) => r.fulfill({ json: { complaints: [] } }));
    for (const path of ["/assistant", "/awareness/payment-and-investment-fraud", "/awareness", "/"]) {
      await page.goto(path);
      await page.locator("main h1").waitFor();
      const animatedIntro = page.locator({
        "/assistant": ".chat-introduction",
        "/awareness/payment-and-investment-fraud": ".guide-heading",
        "/awareness": ".library-hero",
        "/": ".hero-copy",
      }[path]);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.equal(await animatedIntro.evaluate((el) => getComputedStyle(el).animationName), "enter-content");
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await animatedIntro.evaluate((el) => getComputedStyle(el).animationName), "none");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      if (path === "/assistant") {
        const workspace = page.locator(".conversation-workspace");
        const reply = page.locator("textarea");
        assert.ok((await workspace.boundingBox()).width >= width - 1);
        assert.ok((await reply.boundingBox()).height >= 128);
        await page.getByRole("button", { name: "A suspicious message" }).click();
        assert.match(await reply.inputValue(), /suspicious message/);
        await reply.press("Shift+Enter");
        assert.ok((await reply.inputValue()).includes("\n"));
        await reply.fill("");
        assert.equal(await page.locator(".portal-log").evaluate((el) => getComputedStyle(el).overflowY), "visible");

        const historyToggle = page.getByRole("button", { name: "Chat history", exact: true });
        const history = page.getByRole("dialog", { name: "Chat history" });
        assert.equal(await history.isVisible(), false);
        const widthBeforeHistory = (await reply.boundingBox()).width;
        await historyToggle.click();
        await history.getByText("Your saved conversations will appear here.").waitFor();
        assert.equal((await reply.boundingBox()).width, widthBeforeHistory);
        await page.screenshot({ path: `/tmp/cybersahay-design/sidebar-${width}.png`, animations: "disabled" });
        await history.getByRole("button", { name: "Close panel" }).click();
        await history.waitFor({ state: "hidden" });

        const details = page.getByRole("dialog", { name: "Complaint details" });
        await page.getByRole("button", { name: "Complaint details", exact: true }).click();
        await details.locator("#completion").waitFor();
        assert.equal(await details.evaluate((el) => el.open), true);
        await page.keyboard.press("Escape");
        await details.waitFor({ state: "hidden" });
        assert.equal(await page.locator(".mast").isVisible(), true);
        assert.equal(await page.locator(".foot").isVisible(), true);
        assert.notEqual(
          await workspace.evaluate((el) => getComputedStyle(el).backgroundColor),
          await page.locator(".conversation-header").evaluate((el) => getComputedStyle(el).backgroundColor),
        );
      }
      if (path === "/") {
        const artwork = page.locator(".hero-art");
        assert.equal(await artwork.evaluate((el) => getComputedStyle(el).animationName), "enter-art");
        await page.emulateMedia({ reducedMotion: "reduce" });
        const measureHero = () => page.locator(".hero").evaluate(async (hero) => {
          await document.fonts.ready;
          const title = getComputedStyle(hero.querySelector("h1"));
          return { font: title.fontSize, line: title.lineHeight, height: hero.offsetHeight };
        });
        const english = await measureHero();
        for (const language of ["hi-Latn", "hi", "pa", "en"]) {
          await page.locator("header select").selectOption(language);
          await page.waitForFunction((value) => document.documentElement.lang === value, language);
          const translated = await measureHero();
          assert.equal(translated.font, english.font);
          assert.equal(translated.line, english.line);
          if (width >= 961) assert.ok(Math.abs(translated.height - english.height) <= 1, language);
        }
        await page.emulateMedia({ reducedMotion: "no-preference" });
        const guides = page.locator(".home-library");
        await guides.evaluate((el) => el.scrollIntoView({ block: "start" }));
        await page.locator(".home-library[data-revealed]").waitFor();
        assert.equal(await guides.evaluate((el) => getComputedStyle(el).animationName), "enter-content");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await guides.evaluate((el) => getComputedStyle(el).animationName), "none");
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
      if (path.includes("payment-and")) {
        await page.getByRole("checkbox").first().check();
        await page.getByText("1 / 3", { exact: true }).waitFor();
      }
      for (const preference of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: preference });
        assert.match(await page.locator("html").evaluate((el) => getComputedStyle(el).colorScheme), /light/);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${path} overflows at ${width}`);
      }
      await page.screenshot({ path: `/tmp/cybersahay-design/${path.replaceAll("/", "_")}-${width}-light.png`, fullPage: true, animations: "disabled" });
    }
    await page.goto("/awareness/payment-and-investment-fraud");
    for (const lang of ["hi", "pa"]) {
      await page.locator("header select").selectOption(lang);
      await page.waitForFunction((value) => document.documentElement.lang === value, lang);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    assert.deepEqual(errors, []);
    console.log(`Passed responsive pages, light-only appearance, starter prompts and checklist at ${width}px.`);
    await context.close();
  }
} finally { await browser.close(); }
