import { Page, Route } from "@playwright/test";
import {
  tenants as seedTenants,
  users as seedUsers,
  shelterPets as seedShelterPets,
  procedures as seedProcedures,
  userPets as seedUserPets,
  appointments as seedAppointments,
  adoptions as seedAdoptions,
} from "../../src/mocks/db";

type AnyObj = Record<string, any>;

const db = {
  tenants: structuredClone(seedTenants),
  users: structuredClone(seedUsers),
  shelterPets: structuredClone(seedShelterPets),
  procedures: structuredClone(seedProcedures),
  userPets: structuredClone(seedUserPets),
  appointments: structuredClone(seedAppointments),
  adoptions: structuredClone(seedAdoptions),
  tickets: [] as AnyObj[],
};

const passwords = new Map<string, string>();
for (const user of db.users) passwords.set(user.email, "123456");

const json = (route: Route, status: number, payload: any) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(payload) });

const parseBody = (route: Route) => {
  const body = route.request().postData();
  return body ? JSON.parse(body) : {};
};

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const shelterFromTenant = (tenant: AnyObj) => ({
  id: `shelter-${tenant.id}`,
  name: tenant.name,
  cnpj: null,
  contact: "Contato do abrigo",
  address: tenant.address,
  email: `contato+${tenant.id}@abrigo.mock`,
  tenantId: tenant.id,
  createdAt: tenant.createdAt ?? new Date().toISOString(),
});

export async function enableMockApi(page: Page): Promise<void> {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, "");

    if (method === "POST" && path === "/auth/login") {
      const { email, password } = parseBody(route);
      const user = db.users.find((u: AnyObj) => u.email === email);
      if (!user || passwords.get(email) !== password) {
        return json(route, 401, { message: "Credenciais inválidas." });
      }
      return json(route, 200, { user });
    }

    if (method === "GET" && path === "/users") return json(route, 200, db.users);
    if (method === "GET" && path.startsWith("/users/")) {
      const user = db.users.find((u: AnyObj) => u.id === path.split("/")[2]) ?? null;
      return json(route, 200, user);
    }

    if (method === "GET" && path === "/tenants") {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const city = (url.searchParams.get("city") ?? "").toLowerCase();
      const state = (url.searchParams.get("state") ?? "").toLowerCase();
      const items = db.tenants.filter((t: AnyObj) => {
        const tCity = (t.address?.city ?? "").toLowerCase();
        const tState = (t.address?.state ?? "").toLowerCase();
        const combined = `${t.name ?? ""} ${t.address?.street ?? ""} ${tCity} ${tState}`.toLowerCase();
        if (city && !tCity.includes(city)) return false;
        if (state && !tState.includes(state)) return false;
        if (search && !combined.includes(search)) return false;
        return true;
      });
      return json(route, 200, items);
    }
    if (method === "GET" && path.startsWith("/tenants/")) {
      const tenant = db.tenants.find((t: AnyObj) => t.id === path.split("/")[2]) ?? null;
      return json(route, 200, tenant);
    }

    if (method === "GET" && path === "/shelters") {
      const tenantId = url.searchParams.get("tenantId");
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const city = (url.searchParams.get("city") ?? "").toLowerCase();
      const state = (url.searchParams.get("state") ?? "").toLowerCase();
      const items = db.tenants
        .filter((tenant: AnyObj) => (!tenantId || tenant.id === tenantId))
        .map((tenant: AnyObj) => shelterFromTenant(tenant))
        .filter((shelter: AnyObj) => {
          const sCity = (shelter.address?.city ?? "").toLowerCase();
          const sState = (shelter.address?.state ?? "").toLowerCase();
          const combined = `${shelter.name ?? ""} ${shelter.address?.street ?? ""} ${sCity} ${sState}`.toLowerCase();
          if (city && !sCity.includes(city)) return false;
          if (state && !sState.includes(state)) return false;
          if (search && !combined.includes(search)) return false;
          return true;
        });
      return json(route, 200, items);
    }
    if (method === "GET" && path.startsWith("/shelters/")) {
      const shelterId = path.split("/")[2];
      const tenant = db.tenants.find((t: AnyObj) => `shelter-${t.id}` === shelterId) ?? null;
      return json(route, 200, tenant ? shelterFromTenant(tenant) : null);
    }

    if (method === "GET" && path === "/shelter-pets") {
      const tenantId = url.searchParams.get("tenantId");
      const items = tenantId
        ? db.shelterPets.filter((p: AnyObj) => p.tenantId === tenantId)
        : db.shelterPets;
      return json(route, 200, items.map((p: AnyObj) => enrichPet(p)));
    }

    if (method === "GET" && path === "/shelter-pets/available") {
      const tenantId = url.searchParams.get("tenantId");
      const city = (url.searchParams.get("city") ?? "").toLowerCase();
      const state = (url.searchParams.get("state") ?? "").toLowerCase();
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const items = db.shelterPets.filter(
        (p: AnyObj) => {
          if (p.status !== "available") return false;
          if (tenantId && p.tenantId !== tenantId) return false;
          const tenant = db.tenants.find((t: AnyObj) => t.id === p.tenantId);
          const pCity = (tenant?.address?.city ?? "").toLowerCase();
          const pState = (tenant?.address?.state ?? "").toLowerCase();
          const combined = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
          if (city && !pCity.includes(city)) return false;
          if (state && !pState.includes(state)) return false;
          if (search && !combined.includes(search)) return false;
          return true;
        },
      );
      return json(route, 200, items.map((p: AnyObj) => enrichPet(p)));
    }

    if (method === "GET" && path.startsWith("/shelter-pets/")) {
      const pet = db.shelterPets.find((p: AnyObj) => p.id === path.split("/")[2]) ?? null;
      return json(route, 200, pet ? enrichPet(pet) : null);
    }

    if (method === "POST" && path === "/shelter-pets") {
      const body = parseBody(route);
      const created = { ...body, id: id("pet"), createdAt: new Date().toISOString() };
      db.shelterPets.unshift(created);
      return json(route, 201, enrichPet(created));
    }

    if (method === "PATCH" && path.startsWith("/shelter-pets/")) {
      const petId = path.split("/")[2];
      const body = parseBody(route);
      const idx = db.shelterPets.findIndex((p: AnyObj) => p.id === petId);
      if (idx === -1) return json(route, 404, { message: "Pet não encontrado." });
      db.shelterPets[idx] = { ...db.shelterPets[idx], ...body };
      return json(route, 200, enrichPet(db.shelterPets[idx]));
    }

    if (method === "DELETE" && path.startsWith("/shelter-pets/")) {
      const petId = path.split("/")[2];
      db.shelterPets = db.shelterPets.filter((p: AnyObj) => p.id !== petId);
      return json(route, 200, {});
    }

    if (method === "GET" && path === "/procedures/active") {
      const tenantId = url.searchParams.get("tenantId");
      return json(
        route,
        200,
        db.procedures.filter((p: AnyObj) => p.isActive && (!tenantId || p.tenantId === tenantId)),
      );
    }

    if (method === "GET" && path === "/procedures") {
      const tenantId = url.searchParams.get("tenantId");
      return json(route, 200, tenantId ? db.procedures.filter((p: AnyObj) => p.tenantId === tenantId) : db.procedures);
    }

    if (method === "GET" && path.startsWith("/procedures/")) {
      const proc = db.procedures.find((p: AnyObj) => p.id === path.split("/")[2]) ?? null;
      return json(route, 200, proc);
    }

    if (method === "POST" && path === "/procedures") {
      const body = parseBody(route);
      const created = { ...body, id: id("proc"), createdAt: new Date().toISOString() };
      db.procedures.unshift(created);
      return json(route, 201, created);
    }

    if (method === "PATCH" && path.startsWith("/procedures/")) {
      const procId = path.split("/")[2];
      const body = parseBody(route);
      const idx = db.procedures.findIndex((p: AnyObj) => p.id === procId);
      if (idx === -1) return json(route, 404, { message: "Procedimento não encontrado." });
      db.procedures[idx] = { ...db.procedures[idx], ...body };
      return json(route, 200, db.procedures[idx]);
    }

    if (method === "GET" && path === "/user-pets") {
      const userId = url.searchParams.get("userId");
      return json(route, 200, db.userPets.filter((p: AnyObj) => p.userId === userId));
    }

    if (method === "POST" && path === "/user-pets") {
      const body = parseBody(route);
      const created = { ...body, id: id("upet"), createdAt: new Date().toISOString() };
      db.userPets.unshift(created);
      return json(route, 201, created);
    }

    if (method === "POST" && path === "/appointments") {
      const body = parseBody(route);
      if (!body.userPetId) return json(route, 400, { message: "userPetId é obrigatório." });
      if (new Date(body.scheduledAt).getTime() < Date.now()) {
        return json(route, 400, { message: "Data de agendamento inválida." });
      }
      const duplicated = db.appointments.some(
        (a: AnyObj) =>
          a.tenantId === body.tenantId &&
          a.procedureId === body.procedureId &&
          a.scheduledAt === body.scheduledAt &&
          a.status !== "cancelled",
      );
      if (duplicated) return json(route, 409, { message: "Horário já reservado." });
      const created = { ...body, id: id("appt"), status: "scheduled", createdAt: new Date().toISOString() };
      db.appointments.unshift(created);
      return json(route, 201, created);
    }

    if (method === "POST" && path === "/appointments/visit") {
      const body = parseBody(route);
      if (new Date(body.scheduledAt).getTime() < Date.now()) {
        return json(route, 400, { message: "Data de visita inválida." });
      }
      const created = {
        tenantId: body.tenantId,
        userId: body.userId,
        procedureId: body.procedureId,
        userPetId: null,
        scheduledAt: body.scheduledAt,
        notes: body.notes,
        id: id("appt"),
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };
      db.appointments.unshift(created);
      return json(route, 201, created);
    }

    if (method === "GET" && path.startsWith("/user-pets/")) {
      const upet = db.userPets.find((p: AnyObj) => p.id === path.split("/")[2]) ?? null;
      return json(route, 200, upet);
    }

    if (method === "PATCH" && path.startsWith("/user-pets/")) {
      const upetId = path.split("/")[2];
      const body = parseBody(route);
      const idx = db.userPets.findIndex((p: AnyObj) => p.id === upetId);
      if (idx === -1) return json(route, 404, { message: "Pet do usuário não encontrado." });
      db.userPets[idx] = { ...db.userPets[idx], ...body };
      return json(route, 200, db.userPets[idx]);
    }

    if (method === "DELETE" && path.startsWith("/user-pets/")) {
      const upetId = path.split("/")[2];
      db.userPets = db.userPets.filter((p: AnyObj) => p.id !== upetId);
      return json(route, 200, {});
    }

    if (method === "GET" && path === "/appointments") {
      const userId = url.searchParams.get("userId");
      const tenantId = url.searchParams.get("tenantId");
      return json(
        route,
        200,
        db.appointments.filter(
          (a: AnyObj) => (!userId || a.userId === userId) && (!tenantId || a.tenantId === tenantId),
        ),
      );
    }

    if (method === "PATCH" && path.startsWith("/appointments/")) {
      const apptId = path.split("/")[2];
      const body = parseBody(route);
      const idx = db.appointments.findIndex((a: AnyObj) => a.id === apptId);
      if (idx === -1) return json(route, 404, { message: "Agendamento não encontrado." });
      db.appointments[idx] = { ...db.appointments[idx], ...body };
      return json(route, 200, db.appointments[idx]);
    }

    if (method === "POST" && path === "/adoptions") {
      const body = parseBody(route);
      const created = { ...body, id: id("adopt"), status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.adoptions.unshift(created);
      return json(route, 201, created);
    }

    if (method === "GET" && path === "/adoptions") {
      const userId = url.searchParams.get("userId");
      const tenantId = url.searchParams.get("tenantId");
      return json(
        route,
        200,
        db.adoptions.filter(
          (a: AnyObj) => (!userId || a.userId === userId) && (!tenantId || a.tenantId === tenantId),
        ),
      );
    }

    if (method === "PATCH" && path.startsWith("/adoptions/")) {
      const adoptionId = path.split("/")[2];
      const body = parseBody(route);
      const idx = db.adoptions.findIndex((a: AnyObj) => a.id === adoptionId);
      if (idx === -1) return json(route, 404, { message: "Adoção não encontrada." });
      db.adoptions[idx] = { ...db.adoptions[idx], ...body, updatedAt: new Date().toISOString() };
      return json(route, 200, db.adoptions[idx]);
    }

    if (method === "POST" && path === "/onboarding/citizen") {
      const body = parseBody(route);
      if (db.users.some((u: AnyObj) => u.email === body.email)) {
        return json(route, 400, { message: "Email já cadastrado." });
      }
      const created = {
        id: id("user"),
        name: body.name,
        email: body.email,
        role: "citizen",
        tenantId: null,
        createdAt: new Date().toISOString(),
      };
      db.users.unshift(created);
      passwords.set(created.email, body.password);
      return json(route, 201, { user: created });
    }

    if (method === "POST" && path === "/onboarding/admin-register-ticket") {
      const body = parseBody(route);
      const created = {
        id: db.tickets.length + 1,
        userName: body.name,
        userEmail: body.email,
        status: "pending",
        payload: body,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
      };
      db.tickets.unshift(created);
      return json(route, 201, created);
    }

    if (method === "GET" && path === "/admin/register-tickets") return json(route, 200, db.tickets);

    if (method === "PATCH" && path.match(/^\/admin\/register-tickets\/\d+\/approve$/)) {
      const ticketId = Number(path.split("/")[3]);
      const ticket = db.tickets.find((t: AnyObj) => t.id === ticketId);
      if (!ticket) return json(route, 404, { message: "Ticket não encontrado." });
      ticket.status = "approved";
      ticket.reviewedAt = new Date().toISOString();
      const tenant = {
        id: id("tenant"),
        name: ticket.payload.shelter.name,
        address: ticket.payload.shelter.address,
        subscriptionStatus: "trialing",
        createdAt: new Date().toISOString(),
      };
      db.tenants.unshift(tenant);
      const user = {
        id: id("user"),
        name: ticket.payload.name,
        email: ticket.payload.email,
        role: "shelter_admin",
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      };
      db.users.unshift(user);
      passwords.set(user.email, ticket.payload.password);
      return json(route, 200, ticket);
    }

    if (method === "PATCH" && path.match(/^\/admin\/register-tickets\/\d+\/reject$/)) {
      const ticketId = Number(path.split("/")[3]);
      const ticket = db.tickets.find((t: AnyObj) => t.id === ticketId);
      if (!ticket) return json(route, 404, { message: "Ticket não encontrado." });
      ticket.status = "rejected";
      ticket.reviewedAt = new Date().toISOString();
      return json(route, 200, ticket);
    }

    return route.fallback();
  });
}

function enrichPet(pet: AnyObj) {
  const tenant = db.tenants.find((t: AnyObj) => t.id === pet.tenantId);
  return {
    ...pet,
    tenant: tenant ? { id: tenant.id, name: tenant.name, address: tenant.address } : undefined,
  };
}
