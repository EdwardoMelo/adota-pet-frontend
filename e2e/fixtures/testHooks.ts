import { Page, test as base } from "@playwright/test";
import { enableMockApi } from "./mockApi";

const isMock = process.env.MOCK !== "false";

export const test = base.extend<{
  appPage: Page;
}>({
  appPage: async ({ page }, use) => {
    if (isMock) await enableMockApi(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
