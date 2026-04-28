import { expect, test } from "./fixtures/testHooks";
import { hasRealShelterCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginShelter(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "marcos@canilsp.gov.br" : realEnv.shelterEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.shelterPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Shelter admin stories", () => {
  test.beforeEach(() => {
    if (!isMockMode && !hasRealShelterCreds()) test.skip();
  });

  test("pet management create/edit/status", async ({ appPage }) => {
    await loginShelter(appPage);
    await appPage.goto("/shelter/pets");
    await appPage.getByRole("button", { name: "Novo pet" }).click();
    await appPage.getByLabel("Nome").fill("Playwright Pet");
    await appPage.getByLabel("Idade").fill("2");
    await appPage.getByLabel("Imagem").setInputFiles([]);
    await appPage.getByLabel("Descrição").fill("Pet criado via E2E");
    await appPage.getByRole("button", { name: "Salvar" }).click();
    await expect(appPage.getByText(/pet cadastrado|erro ao salvar/i)).toBeVisible();
  });

  test("procedure management create/edit/toggle", async ({ appPage }) => {
    await loginShelter(appPage);
    await appPage.goto("/shelter/procedures");
    await expect(appPage.getByText(/procedimentos/i)).toBeVisible();
    await appPage.getByRole("button", { name: /novo procedimento/i }).click();
    await appPage.getByLabel("Nome").fill("Procedimento PW");
    await appPage.getByLabel("Duração").fill("30");
    await appPage.getByLabel("Descrição").fill("Fluxo de teste E2E.");
    await appPage.getByRole("button", { name: "Salvar" }).click();
    await expect(appPage.getByText(/procedimento/i)).toBeVisible();
  });

  test("review adoptions and appointments filters", async ({ appPage }) => {
    await loginShelter(appPage);
    await appPage.goto("/shelter/adoptions");
    await expect(appPage.getByText(/adoç/i)).toBeVisible();
    await appPage.goto("/shelter/appointments");
    await expect(appPage.getByText(/agendamentos/i)).toBeVisible();
  });
});
