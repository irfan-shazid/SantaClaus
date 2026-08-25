import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => console.log(`[console:${m.type()}]`, m.text()));
page.on("response", (res) => { if (res.url().includes("/api/auth")) console.log("[response]", res.status(), res.url()); });
page.on("requestfailed", (r) => console.log("[requestfailed]", r.url(), r.failure()?.errorText));

await page.goto("https://santa-claus-five.vercel.app/login", { waitUntil: "load", timeout: 30000 });
console.log("Login page loaded, URL:", page.url());
await page.click('button:has-text("Continue with Google")');
await page.waitForTimeout(4000);
console.log("URL after clicking Google:", page.url());
await page.screenshot({ path: "_vercel_google2.png" });
await browser.close();
