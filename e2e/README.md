# Playwright E2E

Suíte E2E tradicional com dois modos:

- `MOCK=true`: 100% mockado via interceptação de API no Playwright
- `MOCK=false`: chama a API real

## Comandos

```bash
npm run e2e:mock
npm run e2e:real
```

Também disponível:

```bash
npm run e2e
```

## Observações

- O mock de entrada fica em `e2e/fixtures/mockApi.ts`.
- Os cenários cobrem autenticação, fluxo cidadão, fluxo shelter admin e fluxo super admin.
- Para execução real, garanta backend disponível e usuários/dados de teste existentes.
- Em modo real, defina credenciais para não pular cenários dependentes de login:
  - `REAL_CITIZEN_EMAIL`
  - `REAL_CITIZEN_PASSWORD`
  - `REAL_SHELTER_EMAIL`
  - `REAL_SHELTER_PASSWORD`
  - `REAL_SUPERADMIN_EMAIL`
  - `REAL_SUPERADMIN_PASSWORD`
