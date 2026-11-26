import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  for (const width of [1908, 390]) {
    const page = await browser.newPage({
      baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
      viewport: { width, height: 930 },
    });
    await page.goto("/awareness");
    const cards = page.locator("main a.awareness-topic");
    await cards.first().waitFor();
    const count = await cards.count();
    assert.ok(count >= 17);
    await page.goto("/");
    await page.getByRole("link", { name: "Money & payments", exact: true }).click();
    await page.waitForURL("**/awareness?group=money");
    await cards.first().waitFor();
    assert.ok(await cards.count() < count);
    assert.equal(await cards.locator(".topic-kind.money").count(), await cards.count());
    await page.reload();
    const search = page.getByRole("searchbox");
    await search.fill("refund UPI");
    await page.getByRole("heading", { name: "Payment and investment fraud" }).waitFor();
    await search.fill("unmatchedxyz");
    await page.getByRole("status").filter({ hasText: "No matching topics." }).waitFor();
    await page.getByRole("link", { name: "Show all guides" }).click();
    await page.waitForURL("**/awareness");
    await cards.first().waitFor();
    assert.equal(await search.inputValue(), "");
    assert.equal(await cards.count(), count);
    const bounds = await page.locator("main").boundingBox();
    assert.ok(Math.abs(bounds.x - (width - bounds.x - bounds.width)) < 2);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const title = await card.locator("h2").innerText();
      const href = await card.getAttribute("href");
      await card.click({ position: { x: 8, y: 8 } });
      await page.waitForURL("**" + href);
      await page.getByRole("heading", { name: title, exact: true }).waitFor();
      await page.getByRole("link", { name: "All safety topics" }).click();
      await cards.first().waitFor();
    }
    await cards.first().focus();
    await page.keyboard.press("Enter");
    await page.getByRole("heading", { name: "Warning signs" }).waitFor();

    await page.goto("/awareness");
    await page.getByRole("link", { name: "বাংলা", exact: true }).click();
    await page.waitForURL("**/awareness?lang=bn");
    const library = page.locator('main[lang="bn"]');
    await library.getByRole("heading", { name: "সাইবার সচেতনতা", exact: true }).waitFor();
    await library.getByRole("link", { name: "বার্তা ও কল", exact: true }).click();
    await page.waitForURL("**/awareness?group=messages&lang=bn");
    await library.getByRole("searchbox").fill("ডিজিটাল অ্যারেস্ট");
    await library.getByRole("heading", { name: "ডিজিটাল অ্যারেস্ট ও ভুয়া পুলিশ কল", exact: true }).click();
    await page.waitForURL("**/awareness/digital-arrest?lang=bn");
    await library.getByRole("heading", { name: "সতর্কতার লক্ষণ", exact: true }).waitFor();
    assert.equal(await library.locator(".safety-diagram li").count(), 3);

    await library.getByRole("link", { name: "தமிழ்", exact: true }).click();
    await page.waitForURL("**/awareness/digital-arrest?lang=ta");
    const tamilGuide = page.locator('main[lang="ta"]');
    await tamilGuide.getByRole("heading", { name: "எச்சரிக்கை அறிகுறிகள்", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await tamilGuide.getByRole("link", { name: "அனைத்துப் பாதுகாப்புத் தலைப்புகளும்", exact: true }).click();
    await page.waitForURL("**/awareness?lang=ta");
    console.log(
      "All guide links, keyboard navigation and centered layout passed at " +
        width +
        "px",
    );
    await page.close();
  }
} finally {
  await browser.close();
}
