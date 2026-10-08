/* visual-verify-method-awareness.cjs
 * Loads the app, sets the project method to Scrum, navigates to the
 * dashboard (method-focus card) and tasks view (Definition of Done
 * column), and captures screenshots for visual verification.
 *
 * Run: node visual-verify-method-awareness.cjs
 */
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Suppress the first-visit tutorial so it doesn't cover the UI.
  await page.addInitScript(() => localStorage.setItem("lc_tour_seen", "1"));

  // Load the static app via file:// — no server needed for browser rendering.
  const appPath = "file://" + path.resolve(__dirname, "index.html");
  await page.goto(appPath, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#content", { timeout: 10000 });

  // Set the project method to Scrum via the charter form, then return to dashboard.
  await page.evaluate(() => {
    const S = window.LCStore;
    const st = S.get();
    st.project = st.project || {};
    st.project.name = "Visual Verification Project";
    st.project.method = "Scrum";
    st.project.status = "IN PROGRESS";
    st.project.currency = "DKK";
    S.save();
  });

  // Navigate to dashboard and expand nav groups so chips are visible.
  await page.evaluate(() => {
    document.querySelectorAll("#nav details.nav-group-wrap").forEach(d => { d.open = true; });
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("dashboard");
  });
  await page.waitForTimeout(500); // render settle

  // Screenshot 1: dashboard with method-focus card
  await page.screenshot({ path: "screenshots/dashboard-scrum-method-focus.png", fullPage: true });
  console.log("Captured: dashboard-scrum-method-focus.png");

  // Verify the method-focus card text is present.
  const focusCardText = await page.locator("text=Method focus").first().textContent().catch(() => null);
  console.log("Method-focus card present:", !!focusCardText);

  // Navigate to tasks view and add a row so the DoD column renders
  // (tableWrap returns empty-state when there are no rows, so the
  // method-conditional headers only appear once a row exists).
  await page.evaluate(() => {
    const S = window.LCStore;
    const st = S.get();
    st.registers = st.registers || {};
    st.registers.tasks = st.registers.tasks || [];
    if (!st.registers.tasks.length) {
      st.registers.tasks.push({ _id: "t1-" + Date.now(), title: "Define requirements", category: "Requirements", priority: "2-HIGH", status: "OPEN", progress: 3 });
    }
    S.save();
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("tasks");
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/tasks-scrum-dod-column.png", fullPage: true });
  console.log("Captured: tasks-scrum-dod-column.png");

  // Verify the Definition of Done column header is present.
  const dodHeader = await page.locator("th:has-text('Definition of Done')").count();
  console.log("Definition of Done column header count:", dodHeader);

  // Also test SAFe to show the dashboard card changes.
  await page.evaluate(() => {
    const S = window.LCStore;
    const st = S.get();
    st.project.method = "SAFe (Scaled Agile)";
    S.save();
    if (window.LCUI && window.LCUI.navigate) window.LCUI.navigate("dashboard");
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/dashboard-safe-method-focus.png", fullPage: true });
  console.log("Captured: dashboard-safe-method-focus.png");

  const safeCardText = await page.locator("text=Method focus").first().textContent().catch(() => null);
  const safeSummary = await page.locator("text=Agile Release Trains").count();
  console.log("SAFe method-focus card present:", !!safeCardText, "| SAFe summary visible:", safeSummary > 0);

  await browser.close();

  // Report
  const ok = !!focusCardText && dodHeader > 0 && !!safeCardText && safeSummary > 0;
  console.log(ok ? "\nVISUAL VERIFICATION: PASSED" : "\nVISUAL VERIFICATION: FAILED — see issues above");
  process.exit(ok ? 0 : 1);
})();
