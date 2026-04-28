import { expect, test } from "./fixtures/testHooks";

test.describe("Authentication stories", () => {
  test("invalid login should show feedback", async ({ appPage }) => {
    await appPage.goto("/login");
    await appPage.getByLabel("E-mail").fill("invalid@email.com");
    await appPage.getByLabel("Senha").fill("wrong-pass");
    await appPage.getByRole("button", { name: "Entrar" }).click();
    await expect(appPage.getByText("Não foi possível entrar", { exact: false })).toBeVisible();
  });

  test("duplicate citizen registration should fail", async ({ appPage }) => {
    await appPage.goto("/");
    await appPage.getByLabel("Nome").first().fill("Ana Beatriz");
    await appPage.getByLabel("E-mail").first().fill("ana@email.com");
    await appPage.getByLabel("Senha").first().fill("123456");
    await appPage.getByLabel("Confirmar senha").first().fill("123456");
    await appPage.getByRole("button", { name: "Continuar como cidadão" }).click();
    await expect(appPage.getByText(/erro|não foi possível|já cadastrado/i)).toBeVisible();
  });

  test("unauthorized route access should redirect to login", async ({ appPage }) => {
    await appPage.goto("/appointments");
    await expect(appPage).toHaveURL(/\/login/);
  });
});
