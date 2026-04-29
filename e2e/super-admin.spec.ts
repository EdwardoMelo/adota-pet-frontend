import { expect, test } from "./fixtures/testHooks";
import { hasRealSuperAdminCreds, isMockMode, realEnv } from "./fixtures/runtimeEnv";

async function loginSuperAdmin(page: any) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(isMockMode ? "helena@adotapet.gov.br" : realEnv.superAdminEmail);
  await page.getByLabel("Senha").fill(isMockMode ? "123456" : realEnv.superAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function ensureSuperAdminSession(page: any) {
  if (isMockMode) return;
  await page.goto("/admin/solicitacoes");
  test.skip(/\/login/.test(page.url()), "Credenciais REAL_SUPERADMIN inválidas ou sem perfil de super admin.");
}

test.describe("Super admin workflow", () => {
  test.beforeEach(() => {
    if (!isMockMode) test.skip("Workflow do super admin no E2E depende de ambiente mock dedicado.");
    if (!isMockMode && !hasRealSuperAdminCreds()) test.skip();
  });

  test("approve shelter registration ticket", async ({ appPage }) => {
    await appPage.goto("/");
    await appPage.getByLabel("Nome do responsável").fill("Solicitante E2E");
    await appPage.getByLabel("E-mail do responsável").fill("solicitante.e2e@email.com");
    await appPage.getByLabel("Senha de acesso").fill("Solicitante@123");
    await appPage.locator("#shelter-user-confirm-password").fill("Solicitante@123");
    await appPage.getByLabel("Nome da entidade").fill("Abrigo E2E");
    await appPage.getByLabel("Contato").fill("(11) 99999-0000");
    await appPage.getByPlaceholder("Rua / Avenida").fill("Rua Teste");
    await appPage.getByPlaceholder("Número", { exact: true }).fill("100");
    await appPage.getByPlaceholder("CEP (somente números)", { exact: true }).fill("01001000");
    await appPage.getByPlaceholder("Cidade").fill("São Paulo");
    await appPage.getByPlaceholder("Estado (UF)").fill("SP");
    await appPage.getByLabel("E-mail institucional").fill("abrigo.e2e@email.com");
    await appPage.getByRole("button", { name: "Enviar para aprovação" }).click();

    await loginSuperAdmin(appPage);
    await ensureSuperAdminSession(appPage);
    await appPage.goto("/admin/solicitacoes");
    await expect(appPage).toHaveURL(/\/admin\/solicitacoes/);
    await expect(appPage.getByRole("button", { name: "Aprovar" }).first()).toBeVisible({ timeout: 15_000 });
    const approve = appPage.getByRole("button", { name: "Aprovar" }).first();
    if (await approve.isVisible()) {
      await approve.click();
      await expect(appPage.getByText(/aprovada com sucesso/i)).toBeVisible();
    }
  });
});
