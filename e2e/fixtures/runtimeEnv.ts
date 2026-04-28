export const isMockMode = process.env.MOCK !== "false";

export const realEnv = {
  citizenEmail: process.env.REAL_CITIZEN_EMAIL ?? "",
  citizenPassword: process.env.REAL_CITIZEN_PASSWORD ?? "",
  shelterEmail: process.env.REAL_SHELTER_EMAIL ?? "",
  shelterPassword: process.env.REAL_SHELTER_PASSWORD ?? "",
  superAdminEmail: process.env.REAL_SUPERADMIN_EMAIL ?? "",
  superAdminPassword: process.env.REAL_SUPERADMIN_PASSWORD ?? "",
};

export function hasRealCitizenCreds(): boolean {
  return !!realEnv.citizenEmail && !!realEnv.citizenPassword;
}

export function hasRealShelterCreds(): boolean {
  return !!realEnv.shelterEmail && !!realEnv.shelterPassword;
}

export function hasRealSuperAdminCreds(): boolean {
  return !!realEnv.superAdminEmail && !!realEnv.superAdminPassword;
}
