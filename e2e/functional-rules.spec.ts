import { expect, test } from "./fixtures/testHooks";
import { hasRealCitizenCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginCitizen(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "ana@email.com" : realEnv.citizenEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.citizenPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Functional rules and business validations", () => {
  test.beforeEach(() => {
    if (!isMockMode && !hasRealCitizenCreds()) test.skip();
  });

  test("citizen without pet cannot confirm standard appointment", async ({ appPage }) => {
    const email = `novo.cidadao.${Date.now()}@email.com`;
    await appPage.goto("/");
    await appPage.getByLabel("Nome").first().fill("Novo Cidadão");
    await appPage.getByLabel("E-mail").first().fill(email);
    await appPage.getByLabel("Senha").first().fill("123456");
    await appPage.getByLabel("Confirmar senha").first().fill("123456");
    await appPage.getByRole("button", { name: "Continuar como cidadão" }).click();

    await appPage.goto("/appointments/new");
    await expect(appPage.getByText(/ainda não cadastrou nenhum pet/i)).toBeVisible();
    await expect(appPage.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
  });

  test("invalid appointment date should fail", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/my-pets");
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByLabel("Canil municipal").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Procedimento").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2020-01-01T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/não foi possível|inválida|erro/i)).toBeVisible();
  });

  test("double booking should be prevented", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/my-pets");
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByLabel("Canil municipal").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Procedimento").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-06-10T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/agendamento criado com sucesso/i)).toBeVisible();

    await appPage.goto("/my-pets");
    await appPage.getByRole("button", { name: "Novo procedimento" }).first().click();
    await appPage.getByLabel("Canil municipal").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Procedimento").click();
    await appPage.getByRole("option").first().click();
    await appPage.getByLabel("Data e horário").fill("2026-06-10T10:00");
    await appPage.getByRole("button", { name: "Confirmar agendamento" }).click();
    await expect(appPage.getByText(/não foi possível|já reservado|erro/i)).toBeVisible();
  });

  test("pet deletion requires confirmation and can be cancelled", async ({ appPage }) => {
    await loginCitizen(appPage);
    await appPage.goto("/my-pets");
    const before = await appPage.getByRole("button", { name: "Novo procedimento" }).count();
    appPage.once("dialog", (dialog) => dialog.dismiss());
    await appPage
      .locator("section .grid > *")
      .first()
      .locator("button")
      .last()
      .click();
    const after = await appPage.getByRole("button", { name: "Novo procedimento" }).count();
    expect(after).toBe(before);
  });
});
