import { expect, test } from "./fixtures/testHooks";
import { hasRealCitizenCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginCitizen(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "ana@email.com" : realEnv.citizenEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.citizenPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function ensureCitizenSession(page: any) {
  if (isMockMode) return;
  await page.goto("/pets");
  test.skip(/\/login/.test(page.url()), "Credenciais REAL_CITIZEN inválidas ou sem acesso de cidadão.");
}

async function ensureCitizenPet(page: any) {
  await page.goto("/my-pets");
  if ((await page.getByRole("button", { name: "Novo procedimento" }).count()) > 0) return;

  await page.getByRole("button", { name: /cadastrar pet|novo pet/i }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome").fill(`Pet Regras ${Date.now()}`);
  await dialog.getByLabel("Idade").fill("3");
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("button", { name: "Novo procedimento" }).first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Functional rules and business validations", () => {
  test.beforeEach(() => {
    if (!isMockMode && !hasRealCitizenCreds()) test.skip();
  });

  test("citizen without pet cannot confirm standard appointment", async ({ appPage }) => {
    test.skip(!isMockMode, "Cenário depende de base isolada sem pets prévios.");
    const email = `novo.cidadao.${Date.now()}@email.com`;
    await appPage.goto("/");
    await appPage.getByLabel("Nome").first().fill("Novo Cidadão");
    await appPage.getByLabel("E-mail").first().fill(email);
    await appPage.getByLabel("Senha").first().fill("123456");
    await appPage.getByLabel("Confirmar senha").first().fill("123456");
    await appPage.getByRole("button", { name: "Continuar como cidadão" }).click();

    await appPage.goto("/appointments/new");
    await expect(
      appPage.getByText(/para agendar um procedimento no canil, cadastre primeiro o animal da sua família/i),
    ).toBeVisible();
    await expect(appPage.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
  });

  test("invalid appointment date should fail", async ({ appPage }) => {
    test.skip(!isMockMode, "Cenário depende de validação determinística em ambiente mock.");
    await loginCitizen(appPage);
    await ensureCitizenPet(appPage);
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByRole("combobox").first().click();
    await appPage.getByRole("option").first().click();
    await appPage.getByRole("combobox").nth(1).click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2020-01-01T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage).toHaveURL(/\/appointments\/new/);
  });

  test("double booking should be prevented", async ({ appPage }) => {
    test.skip(!isMockMode, "Cenário depende de disponibilidade controlada no mock.");
    await loginCitizen(appPage);
    await ensureCitizenPet(appPage);
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByRole("combobox").first().click();
    await appPage.getByRole("option").first().click();
    await appPage.getByRole("combobox").nth(1).click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-06-10T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/agendamento criado com sucesso/i)).toBeVisible();

    await appPage.goto("/my-pets");
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByRole("combobox").first().click();
    await appPage.getByRole("option").first().click();
    await appPage.getByRole("combobox").nth(1).click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-06-10T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText("Horário já reservado.").first()).toBeVisible();
  });

  test("pet deletion requires confirmation and can be cancelled", async ({ appPage }) => {
    test.skip(!isMockMode, "Cenário depende de lista de pets estável do usuário.");
    await loginCitizen(appPage);
    await ensureCitizenSession(appPage);
    await appPage.goto("/my-pets");
    const before = await appPage.getByRole("button", { name: "Novo procedimento" }).count();
    await appPage.getByRole("button", { name: /^Remover pet / }).first().click();
    await appPage.getByRole("button", { name: "Cancelar" }).click();
    const after = await appPage.getByRole("button", { name: "Novo procedimento" }).count();
    expect(after).toBe(before);
  });

  test("pets catalog filters by shelter location", async ({ appPage }) => {
    test.skip(!isMockMode, "Filtro por cidade/UF depende de seed fixa no mock.");
    await appPage.goto("/pets");
    await appPage.getByPlaceholder("Cidade (ex.: Gravataí)").fill("Curitiba");
    await expect(appPage.getByRole("link", { name: /nina/i })).toBeVisible();
    await expect(appPage.getByRole("link", { name: /thor/i })).toHaveCount(0);
    await appPage.getByPlaceholder("UF (ex.: RS)").fill("PR");
    await expect(appPage.getByText(/filtrando por localização do canil/i)).toBeVisible();
  });

  test("appointment page highlights selected shelter address", async ({ appPage }) => {
    test.skip(!isMockMode, "Seleção de canil com nome exato depende de seed fixa no mock.");
    await loginCitizen(appPage);
    await ensureCitizenSession(appPage);
    await appPage.goto("/appointments/new");
    await appPage.getByRole("combobox").first().click();
    await appPage.getByRole("option", { name: /curitiba/i }).click();
    await expect(appPage.getByText("Local do atendimento")).toBeVisible();
    await expect(appPage.getByText("Canil Municipal de Curitiba", { exact: true })).toBeVisible();
    await expect(appPage.getByRole("link", { name: /ver rota no mapa/i })).toBeVisible();
  });
});
