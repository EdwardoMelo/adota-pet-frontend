import type { ShelterAddressDTO } from "./tenant.dto";

export interface ShelterResponseDTO {
  id: string;
  name: string;
  cnpj?: string | null;
  contact: string;
  address: ShelterAddressDTO;
  email: string;
  tenantId: string;
  createdAt: string;
}

