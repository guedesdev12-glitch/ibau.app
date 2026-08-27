"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCPF, onlyDigits } from "@/lib/br-format";

export type OnboardingPayload = {
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: string | null;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  roleId: string;
  attendedEncounter: boolean;
  encounterDate: string | null;
};

export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");

  if (!payload.fullName.trim()) throw new Error("Informe seu nome completo.");
  if (!isValidCPF(payload.cpf)) throw new Error("CPF inválido. Confira os números.");
  if (onlyDigits(payload.phone).length < 10) throw new Error("Telefone incompleto.");
  if (!payload.roleId) throw new Error("Selecione como você participa da igreja.");

  // Garante que ninguém se auto-atribua uma categoria restrita
  const { data: role } = await supabase
    .from("roles")
    .select("id, admin_only, is_developer, name")
    .eq("id", payload.roleId)
    .single();

  if (!role || role.admin_only || role.is_developer || role.name === "Administrador") {
    throw new Error("Essa categoria só pode ser atribuída pela liderança.");
  }

  const addressLine = [
    payload.street,
    payload.number,
    payload.complement,
    payload.neighborhood,
    payload.city,
    payload.state,
  ]
    .filter(Boolean)
    .join(", ");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName.trim(),
      cpf: onlyDigits(payload.cpf),
      phone: payload.phone,
      birth_date: payload.birthDate || null,
      postal_code: onlyDigits(payload.postalCode) || null,
      street: payload.street || null,
      number: payload.number || null,
      complement: payload.complement || null,
      neighborhood: payload.neighborhood || null,
      city: payload.city || null,
      state: payload.state || null,
      address: addressLine || null,
      role_id: payload.roleId,
      attended_encounter: payload.attendedEncounter,
      encounter_date: payload.attendedEncounter ? payload.encounterDate || null : null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este CPF já está cadastrado em outra conta.");
    }
    throw new Error(error.message);
  }

  redirect("/dashboard");
}
