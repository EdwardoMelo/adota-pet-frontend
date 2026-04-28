import { expect, test } from "./fixtures/testHooks";
import { hasRealCitizenCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginCitizen(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "ana@email.com" : realEnv.citizenEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.citizenPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Citizen dashboard and history", () => {
  test.beforeEach(() => {
    if (!isMockMode && !hasRealCitizenCreds()) test.skip();
  });

  test("citizen can navigate adoption and appointment history", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/adoptions");
    await expect(appPage.getByText(/minhas adoções/i)).toBeVisible();
    await appPage.goto("/appointments");
    await expect(appPage.getByText(/meus agendamentos/i)).toBeVisible();
  });

  test("citizen can navigate catalog and own pets", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/pets");
    await expect(appPage.getByText(/pets disponíveis/i)).toBeVisible();
    await appPage.goto("/my-pets");
    await expect(appPage.getByText(/meus pets/i)).toBeVisible();
  });
});
