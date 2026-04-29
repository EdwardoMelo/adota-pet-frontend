import { expect, test } from "./fixtures/testHooks";
import { hasRealCitizenCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginCitizen(page: Parameters<typeof test>[0]["appPage"]) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "ana@email.com" : realEnv.citizenEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.citizenPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function ensureCitizenSession(page: Parameters<typeof test>[0]["appPage"]) {
  if (isMockMode) return;
  await page.goto("/pets");
  test.skip(/\/login/.test(page.url()), "Credenciais REAL_CITIZEN inválidas ou sem acesso de cidadão.");
}

async function ensureCitizenPet(page: Parameters<typeof test>[0]["appPage"]) {
  await page.goto("/my-pets");
  if ((await page.getByRole("button", { name: "Novo procedimento" }).count()) > 0) return;

  await page.getByRole("button", { name: /cadastrar pet|novo pet/i }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome").fill(`Pet E2E ${Date.now()}`);
  await dialog.getByLabel("Idade").fill("2");
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("button", { name: "Novo procedimento" }).first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Citizen experience stories", () => {
  test.beforeEach(() => {
    if (!isMockMode) test.skip("Fluxos citizen completos rodam apenas com base mock controlada.");
    if (!isMockMode && !hasRealCitizenCreds()) test.skip();
  });

  test("browse pets, open details, adopt and schedule visit", async ({ appPage }) => {
    await ensureCitizenSession(appPage);
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
    await expect(appPage.getByRole("alertdialog")).toBeVisible();
    await appPage.getByRole("button", { name: "Confirmar adoção" }).click();
    await expect(appPage).toHaveURL(/\/adoptions/);
  });

  test("schedule procedure from user pet list", async ({ appPage }) => {
    await loginCitizen(appPage);
    await ensureCitizenSession(appPage);
    await ensureCitizenPet(appPage);
    await expect(appPage.getByRole("heading", { level: 1, name: "Meus pets" })).toBeVisible();
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await expect(appPage).toHaveURL(/\/appointments\/new/);
    await appPage.getByRole("combobox").first().click();
    await appPage.getByRole("option").first().click();
    await appPage.getByRole("combobox").nth(1).click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-05-01T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/agendamento criado com sucesso/i)).toBeVisible();
  });
});
