export interface ShelterAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  number: string;
  apartment?: string | null;
}

export const emptyAddress: ShelterAddress = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  number: "",
  apartment: "",
};

export function normalizeAddress(raw?: Partial<ShelterAddress> | null): ShelterAddress {
  return {
    street: raw?.street ?? "",
    city: raw?.city ?? "",
    state: raw?.state ?? "",
    zipCode: raw?.zipCode ?? "",
    number: raw?.number ?? "",
    apartment: raw?.apartment ?? "",
  };
}

export function formatAddressInline(address?: Partial<ShelterAddress> | null): string {
  if (!address) return "";
  const part1 = [address.street, address.number].filter(Boolean).join(", ");
  const part2 = [address.apartment].filter(Boolean).join(" ");
  const part3 = [address.city, address.state].filter(Boolean).join(" - ");
  const part4 = address.zipCode ? `CEP ${address.zipCode}` : "";
  return [part1, part2, part3, part4].filter(Boolean).join(" • ");
}

export function validateAddress(address: ShelterAddress): string | null {
  if (!address.street.trim()) return "Rua é obrigatória.";
  if (!address.city.trim()) return "Cidade é obrigatória.";
  if (!address.state.trim()) return "Estado é obrigatório.";
  if (!address.number.trim()) return "Número é obrigatório.";
  const zip = address.zipCode.replace(/\D/g, "");
  if (zip.length !== 8) return "CEP deve conter 8 dígitos.";
  return null;
}
