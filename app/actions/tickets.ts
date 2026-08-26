"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

export async function reserveTicket(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");

  const quantity = Math.max(1, Math.min(Number(formData.get("quantity") ?? 1), 10));

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, is_free, price, capacity, registration_open, registration_deadline")
    .eq("id", eventId)
    .single();

  if (eventError || !event) throw new Error("Evento não encontrado.");
  if (!event.registration_open) throw new Error("As inscrições para este evento estão fechadas.");

  if (event.registration_deadline) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > event.registration_deadline) {
      throw new Error("O prazo de inscrição já encerrou.");
    }
  }

  const { data: spotsLeft } = await supabase.rpc("event_spots_left", { p_event_id: eventId });
  if (spotsLeft !== null && spotsLeft !== undefined && spotsLeft < quantity) {
    throw new Error(
      spotsLeft === 0 ? "Este evento está esgotado." : `Restam apenas ${spotsLeft} vaga(s).`,
    );
  }

  const unitPrice = event.is_free ? 0 : Number(event.price ?? 0);

  const { error } = await supabase.from("event_tickets").insert({
    event_id: eventId,
    profile_id: user.id,
    code: generateCode(),
    quantity,
    unit_price: unitPrice,
    total_price: unitPrice * quantity,
    // Evento gratuito confirma na hora; pago fica pendente até a
    // confirmação do pagamento pela secretaria/gateway.
    status: event.is_free ? "confirmado" : "pendente",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/eventos");
  revalidatePath(`/dashboard/eventos/${eventId}`);
}

export async function cancelTicket(ticketId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_tickets")
    .update({ status: "cancelado" })
    .eq("id", ticketId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/eventos");
}

export async function confirmTicketPayment(ticketId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_tickets")
    .update({ status: "confirmado" })
    .eq("id", ticketId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/eventos");
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/eventos");
  revalidatePath("/dashboard");
}
