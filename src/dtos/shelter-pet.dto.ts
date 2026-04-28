export type ShelterPetStatus = "available" | "adopted";
export type PetSpecies = "dog" | "cat" | "other";

/** Pet listed by a shelter (tenant) for adoption. */
export interface ShelterPetResponseDTO {
  id: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      number: string;
      apartment?: string | null;
    };
  };
  name: string;
  age: number;
  species: PetSpecies;
  description: string;
  status: ShelterPetStatus;
  imageUrl: string;
  createdAt: string;
}

export interface CreateShelterPetDTO {
  tenantId: string;
  name: string;
  age: number;
  species: PetSpecies;
  description: string;
  imageUrl: string;
  status?: ShelterPetStatus;
}

export interface UpdateShelterPetDTO {
  name?: string;
  age?: number;
  species?: PetSpecies;
  description?: string;
  status?: ShelterPetStatus;
  imageUrl?: string;
}

/** Backwards-compatible aliases (legacy "Pet" naming). */
export type PetStatus = ShelterPetStatus;
export type PetResponseDTO = ShelterPetResponseDTO;
export type CreatePetDTO = CreateShelterPetDTO;
export type UpdatePetDTO = UpdateShelterPetDTO;