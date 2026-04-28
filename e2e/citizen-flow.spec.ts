import { expect, test } from "./fixtures/testHooks";
import { hasRealCitizenCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginCitizen(page: Parameters<typeof test>[0]["appPage"]) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "ana@email.com" : realEnv.citizenEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.citizenPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Citizen experience stories", () => {
  test.beforeEach(() => {
    if (!isMockMode && !hasRealCitizenCreds()) test.skip();
  });

  test("browse pets, open details, adopt and schedule visit", async ({ appPage }) => {
    await appPage.goto("/pets");
    await expect(appPage.getByText("Pets disponíveis para adoção")).toBeVisible();
    await appPage.getByPlaceholder("Buscar por nome ou descrição...").fill("Thor");
    await appPage.getByRole("link", { name: /thor/i }).first().click();
    await expect(appPage.getByRole("button", { name: "Visitar pet" })).toBeVisible();

    await appPage.getByRole("button", { name: "Visitar pet" }).click();
    await expect(appPage).toHaveURL(/\/login/);

    await loginCitizen(appPage);
    await appPage.goto("/pets");
    await appPage.getByRole("link", { name: /thor/i }).first().click();
    await appPage.getByRole("button", { name: "Adotar" }).click();
    appPage.once("dialog", (d) => d.accept());
  });

  test("schedule procedure from user pet list", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/my-pets");
    await expect(appPage.getByText("Meus pets")).toBeVisible();
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await expect(appPage).toHaveURL(/\/appointments\/new/);
    await appPage.getByLabel("Canil municipal").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Procedimento").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-05-01T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/agendamento criado com sucesso/i)).toBeVisible();
  });
});
