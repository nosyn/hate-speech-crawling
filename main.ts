import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const MAIN_URL = 'https://www.ptt.cc/bbs/HatePolitics';

const main = async () => {
  // Setup browser
  const browser = await chromium.launch({
    headless: false, // Change to false if you want to see the browser
  });
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
  });
  const homePage = await context.newPage();

  await homePage.goto(`${MAIN_URL}/index.html`);

  const anchorSelector = homePage.locator('.r-ent > .title > a');
  const links = await anchorSelector.evaluateAll(
    (anchor: HTMLAnchorElement[]) => anchor.map((a) => a.href)
  );

  const summary = [];

  for (const link of links) {
    const newTab = await browser.newPage();
    await newTab.goto(link);

    const mainContentSelector = newTab.locator('#main-content');
    const mainContent = await mainContentSelector.evaluate(
      (content: HTMLElement) => content.textContent
    );

    summary.push({
      link,
      content: mainContent,
    });

    newTab.close();
  }

  homePage.close();
  browser.close();

  fs.writeFileSync('report.json', JSON.stringify(summary, null, 2));
};

main();
