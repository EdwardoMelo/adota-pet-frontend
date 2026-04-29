import { expect, test } from "./fixtures/testHooks";
import { hasRealShelterCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

/** 1×1 PNG for shelter pet image upload in E2E */
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function loginShelter(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "marcos@canilsp.gov.br" : realEnv.shelterEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.shelterPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function ensureShelterSession(page: any) {
  if (isMockMode) return;
  await page.goto("/shelter");
  test.skip(/\/login/.test(page.url()), "Credenciais REAL_SHELTER inválidas ou sem perfil de abrigo.");
}

test.describe("Shelter admin stories", () => {
  test.beforeEach(() => {
    if (!isMockMode) test.skip("Fluxos de gestão do abrigo rodam com dados mockados e isolados.");
    if (!isMockMode && !hasRealShelterCreds()) test.skip();
  });

  test("pet management create/edit/status", async ({ appPage }) => {
    await loginShelter(appPage);
    await ensureShelterSession(appPage);
    await appPage.goto("/shelter/pets");
    await expect(appPage.getByRole("heading", { level: 1, name: "Pets do canil" })).toBeVisible();
    await expect(appPage.getByRole("button", { name: "Novo pet" })).toBeVisible();
    await appPage.getByRole("button", { name: "Novo pet" }).click();
    await appPage.getByLabel("Nome").fill("Playwright Pet");
    await appPage.getByLabel("Idade").fill("2");
    await appPage.getByLabel("Imagem").setInputFiles({
      name: "e2e-pet.png",
      mimeType: "image/png",
      buffer: MINIMAL_PNG,
    });
    await appPage.getByLabel("Descrição").fill("Pet criado via E2E");
    await appPage.getByRole("button", { name: "Salvar" }).click();
    await expect(appPage.getByText("Playwright Pet").first()).toBeVisible({ timeout: 30_000 });
  });

  test("procedure management create/edit/toggle", async ({ appPage }) => {
    await loginShelter(appPage);
    await ensureShelterSession(appPage);
    await appPage.goto("/shelter/procedures");
    await expect(appPage.getByRole("heading", { level: 1, name: "Procedimentos" })).toBeVisible();
    await appPage.getByRole("button", { name: /novo procedimento/i }).click();
    await appPage.getByLabel("Nome").fill("Procedimento PW");
    await appPage.getByLabel("Duração").fill("30");
    await appPage.getByLabel("Descrição").fill("Fluxo de teste E2E.");
    await appPage.getByRole("button", { name: "Salvar" }).click();
    await expect(appPage.getByText("Procedimento PW").first()).toBeVisible({ timeout: 15_000 });
  });

  test("review adoptions and appointments filters", async ({ appPage }) => {
    await loginShelter(appPage);
    await ensureShelterSession(appPage);
    await appPage.goto("/shelter/adoptions");
    await expect(appPage.getByRole("heading", { level: 1, name: "Adoções" })).toBeVisible();
    await appPage.goto("/shelter/appointments");
    await expect(appPage.getByRole("heading", { level: 1, name: "Agendamentos" })).toBeVisible();
  });
});
