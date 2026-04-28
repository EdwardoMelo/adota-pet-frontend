export type UserPetType = "dog" | "cat" | "other";

/** A pet owned by a citizen (not the shelter). */
export interface UserPetResponseDTO {
  id: string;
  userId: string;
  name: string;
  age: number;
  type: UserPetType;
  notes?: string;
  createdAt: string;
}

export interface CreateUserPetDTO {
  userId: string;
  name: string;
  age: number;
  type: UserPetType;
  notes?: string;
}

export interface UpdateUserPetDTO {
  name?: string;
  age?: number;
  type?: UserPetType;
  notes?: string;
}