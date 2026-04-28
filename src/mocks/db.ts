import type {
  TenantResponseDTO,
  UserResponseDTO,
  ShelterPetResponseDTO,
  UserPetResponseDTO,
  ProcedureResponseDTO,
  AppointmentResponseDTO,
  AdoptionResponseDTO,
} from "@/dtos";

/**
 * In-memory mock database. Simulates a SQL backend.
 * Mutations performed via services are kept in this module-level state
 * so that the app behaves like a real backend during a session.
 */

export const tenants: TenantResponseDTO[] = [
  {
    id: "tenant-1",
    name: "Canil Municipal de São Paulo",
    address: {
      street: "Rua Vergueiro",
      number: "1000",
      apartment: "",
      city: "São Paulo",
      state: "SP",
      zipCode: "01504000",
    },
    subscriptionStatus: "active",
    stripeAccountId: "acct_mock_sp",
    createdAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "tenant-2",
    name: "Canil Municipal de Curitiba",
    address: {
      street: "Rua XV de Novembro",
      number: "420",
      apartment: "",
      city: "Curitiba",
      state: "PR",
      zipCode: "80020010",
    },
    subscriptionStatus: "trialing",
    createdAt: "2024-03-22T10:00:00.000Z",
  },
  {
    id: "tenant-3",
    name: "Canil Municipal de Recife",
    address: {
      street: "Avenida Conde da Boa Vista",
      number: "950",
      apartment: "",
      city: "Recife",
      state: "PE",
      zipCode: "50060140",
    },
    subscriptionStatus: "past_due",
    createdAt: "2023-11-05T10:00:00.000Z",
  },
];

export const users: UserResponseDTO[] = [
  {
    id: "user-super-1",
    name: "Helena Costa",
    email: "helena@adotapet.gov.br",
    role: "super_admin",
    tenantId: null,
    createdAt: "2023-10-01T10:00:00.000Z",
  },
  {
    id: "user-shelter-1",
    name: "Marcos Almeida",
    email: "marcos@canilsp.gov.br",
    role: "shelter_admin",
    tenantId: "tenant-1",
    stripeCustomerId: "cus_mock_sp",
    stripeSubscriptionId: "sub_mock_sp",
    createdAt: "2024-01-20T10:00:00.000Z",
  },
  {
    id: "user-shelter-2",
    name: "Júlia Ribeiro",
    email: "julia@canilcwb.gov.br",
    role: "shelter_admin",
    tenantId: "tenant-2",
    createdAt: "2024-03-25T10:00:00.000Z",
  },
  {
    id: "user-citizen-1",
    name: "Ana Beatriz",
    email: "ana@email.com",
    role: "citizen",
    tenantId: "tenant-1",
    createdAt: "2024-05-10T10:00:00.000Z",
  },
  {
    id: "user-citizen-2",
    name: "Rafael Souza",
    email: "rafael@email.com",
    role: "citizen",
    tenantId: "tenant-2",
    createdAt: "2024-06-02T10:00:00.000Z",
  },
];

const img = (seed: string) => `https://images.unsplash.com/${seed}?w=800&q=80`;

export const shelterPets: ShelterPetResponseDTO[] = [
  {
    id: "pet-1",
    name: "Thor",
    age: 3,
    species: "dog",
    description:
      "Vira-lata carinhoso, adora passeios e crianças. Já castrado e vacinado.",
    status: "available",
    imageUrl: img("photo-1543466835-00a7907e9de1"),
    tenantId: "tenant-1",
    createdAt: "2024-08-10T10:00:00.000Z",
  },
  {
    id: "pet-2",
    name: "Mel",
    age: 2,
    species: "dog",
    description: "Calma, ótima para apartamento. Convive bem com outros animais.",
    status: "available",
    imageUrl: img("photo-1587300003388-59208cc962cb"),
    tenantId: "tenant-1",
    createdAt: "2024-08-12T10:00:00.000Z",
  },
  {
    id: "pet-3",
    name: "Luna",
    age: 1,
    species: "cat",
    description: "Gatinha brincalhona resgatada da rua. Adora carinho na barriga.",
    status: "available",
    imageUrl: img("photo-1574144611937-0df059b5ef3e"),
    tenantId: "tenant-1",
    createdAt: "2024-09-01T10:00:00.000Z",
  },
  {
    id: "pet-4",
    name: "Rex",
    age: 5,
    species: "dog",
    description: "Cão guardião amigável, ideal para casas com quintal.",
    status: "adopted",
    imageUrl: img("photo-1561037404-61cd46aa615b"),
    tenantId: "tenant-1",
    createdAt: "2024-07-22T10:00:00.000Z",
  },
  {
    id: "pet-5",
    name: "Nina",
    age: 4,
    species: "cat",
    description: "Independente e tranquila, adora janelas ensolaradas.",
    status: "available",
    imageUrl: img("photo-1518791841217-8f162f1e1131"),
    tenantId: "tenant-2",
    createdAt: "2024-09-15T10:00:00.000Z",
  },
  {
    id: "pet-6",
    name: "Bidu",
    age: 6,
    species: "dog",
    description: "Senhorzinho dócil em busca de um lar tranquilo para envelhecer.",
    status: "available",
    imageUrl: img("photo-1477884213360-7e9d7dcc1e48"),
    tenantId: "tenant-2",
    createdAt: "2024-09-20T10:00:00.000Z",
  },
];

export const procedures: ProcedureResponseDTO[] = [
  {
    id: "proc-visit-1",
    tenantId: "tenant-1",
    name: "Visita ao pet",
    description: "Visita guiada ao canil para conhecer o pet antes da adoção.",
    durationMinutes: 45,
    isActive: true,
    createdAt: "2024-02-10T10:00:00.000Z",
  },
  {
    id: "proc-1",
    tenantId: "tenant-1",
    name: "Consulta veterinária",
    description: "Avaliação clínica geral por veterinário do canil.",
    durationMinutes: 30,
    isActive: true,
    createdAt: "2024-02-10T10:00:00.000Z",
  },
  {
    id: "proc-2",
    tenantId: "tenant-1",
    name: "Castração",
    description: "Procedimento cirúrgico gratuito para cães e gatos.",
    durationMinutes: 90,
    isActive: true,
    createdAt: "2024-02-10T10:00:00.000Z",
  },
  {
    id: "proc-3",
    tenantId: "tenant-1",
    name: "Vacinação antirrábica",
    description: "Aplicação da vacina antirrábica anual.",
    durationMinutes: 15,
    isActive: true,
    createdAt: "2024-02-10T10:00:00.000Z",
  },
  {
    id: "proc-visit-2",
    tenantId: "tenant-2",
    name: "Visita ao pet",
    description: "Visita monitorada para aproximação com o pet desejado.",
    durationMinutes: 45,
    isActive: true,
    createdAt: "2024-04-01T10:00:00.000Z",
  },
  {
    id: "proc-4",
    tenantId: "tenant-2",
    name: "Consulta veterinária",
    description: "Atendimento clínico geral.",
    durationMinutes: 30,
    isActive: true,
    createdAt: "2024-04-01T10:00:00.000Z",
  },
  {
    id: "proc-5",
    tenantId: "tenant-2",
    name: "Castração",
    description: "Castração de cães e gatos pelo programa municipal.",
    durationMinutes: 90,
    isActive: true,
    createdAt: "2024-04-01T10:00:00.000Z",
  },
  {
    id: "proc-6",
    tenantId: "tenant-3",
    name: "Microchipagem",
    description: "Identificação por microchip subcutâneo.",
    durationMinutes: 15,
    isActive: false,
    createdAt: "2024-01-15T10:00:00.000Z",
  },
];

export const userPets: UserPetResponseDTO[] = [
  {
    id: "upet-1",
    userId: "user-citizen-1",
    name: "Mingau",
    age: 4,
    type: "cat",
    notes: "Gato adulto, alérgico a frango.",
    createdAt: "2024-09-01T10:00:00.000Z",
  },
  {
    id: "upet-2",
    userId: "user-citizen-1",
    name: "Pipoca",
    age: 2,
    type: "dog",
    notes: "SRD, muito agitada em consulta.",
    createdAt: "2024-10-12T10:00:00.000Z",
  },
  {
    id: "upet-3",
    userId: "user-citizen-2",
    name: "Bolinha",
    age: 7,
    type: "dog",
    createdAt: "2024-11-01T10:00:00.000Z",
  },
];

export const appointments: AppointmentResponseDTO[] = [
  {
    id: "appt-1",
    tenantId: "tenant-1",
    userId: "user-citizen-1",
    procedureId: "proc-1",
    userPetId: "upet-1",
    scheduledAt: "2025-05-12T14:00:00.000Z",
    status: "scheduled",
    notes: "Primeira consulta do Mingau no canil.",
    createdAt: "2025-04-20T10:00:00.000Z",
  },
  {
    id: "appt-2",
    tenantId: "tenant-2",
    userId: "user-citizen-2",
    procedureId: "proc-5",
    userPetId: "upet-3",
    scheduledAt: "2025-05-08T10:30:00.000Z",
    status: "confirmed",
    createdAt: "2025-04-18T10:00:00.000Z",
  },
];

export const adoptions: AdoptionResponseDTO[] = [
  {
    id: "adopt-1",
    tenantId: "tenant-1",
    petId: "pet-4",
    userId: "user-citizen-1",
    status: "completed",
    notes: "Adoção finalizada após período de adaptação.",
    createdAt: "2025-03-10T10:00:00.000Z",
    updatedAt: "2025-03-20T10:00:00.000Z",
  },
];

export const genId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;