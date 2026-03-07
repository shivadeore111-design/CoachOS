import { supabase, isSupabaseConfigured } from "./supabase";
import type { Client, Program, Workout, Alert, Coach, ApiResult } from "../types";

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

function err<T>(msg: string): ApiResult<T> {
  console.error("[CoachOS API]", msg);
  return { data: null, error: msg };
}

function requireSupabase<T>(): ApiResult<T> | null {
  if (isSupabaseConfigured) return null;
  return err("Supabase is not configured.");
}

async function getAuthenticatedCoachId(): Promise<string | null> {
  const blocked = requireSupabase<string>();
  if (blocked) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function getCoachProfile(coachId: string): Promise<ApiResult<Coach>> {
  const blocked = requireSupabase<Coach>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("coaches").select("*").eq("id", coachId).single();
  if (error) return err(error.message);
  return ok(data as Coach);
}

export async function updateCoachProfile(coachId: string, updates: Partial<Coach>): Promise<ApiResult<Coach>> {
  const blocked = requireSupabase<Coach>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("coaches").update(updates).eq("id", coachId).select().single();
  if (error) return err(error.message);
  return ok(data as Coach);
}

export async function getCoachPlan(): Promise<ApiResult<{ plan: string; max_clients: number }>> {
  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");
  const { data, error } = await supabase.from("coaches").select("plan,max_clients").eq("id", coachId).maybeSingle();
  if (error) return err(error.message);
  return ok({ plan: data?.plan ?? "free", max_clients: data?.max_clients ?? 5 });
}

export async function updateCoachPlan(plan: "free" | "pro" | "business", subscriptionId: string): Promise<ApiResult<Coach>> {
  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");
  const maxClients = plan === "free" ? 5 : -1;
  const { data, error } = await supabase
    .from("coaches")
    .update({ plan, max_clients: maxClients, subscription_id: subscriptionId })
    .eq("id", coachId)
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Coach);
}

export async function recordPayment(data: { coach_id: string; plan: string; amount: number; currency?: string; razorpay_payment_id?: string; razorpay_subscription_id?: string; status?: string }): Promise<ApiResult<unknown>> {
  const blocked = requireSupabase<unknown>();
  if (blocked) return blocked;
  const { data: inserted, error } = await supabase.from("payments").insert([{ ...data, currency: data.currency ?? "INR", status: data.status ?? "created" }]).select().single();
  if (error) return err(error.message);
  return ok(inserted);
}

export async function getClients(coachId: string): Promise<ApiResult<Client[]>> {
  const blocked = requireSupabase<Client[]>();
  if (blocked) return blocked;
  const { data: clients, error: clientsError } = await supabase.from("clients").select("*").eq("coach_id", coachId).order("created_at", { ascending: false });
  if (clientsError) return err(clientsError.message);

  const programIds = Array.from(new Set((clients ?? []).map((client) => client.program_id).filter(Boolean))) as string[];
  let programsById = new Map<string, Program>();

  if (programIds.length > 0) {
    const { data: programs, error: programsError } = await supabase.from("programs").select("*").in("id", programIds);
    if (programsError) return err(programsError.message);
    programsById = new Map((programs ?? []).map((program) => [program.id, program as Program]));
  }

  const clientsWithPrograms = (clients ?? []).map((client) => ({
    ...(client as Client),
    program: client.program_id ? programsById.get(client.program_id) : undefined,
  }));

  return ok(clientsWithPrograms as Client[]);
}

export async function getClientById(clientId: string, coachId: string): Promise<ApiResult<Client>> {
  const blocked = requireSupabase<Client>();
  if (blocked) return blocked;
  const { data: client, error: clientError } = await supabase.from("clients").select("*").eq("id", clientId).eq("coach_id", coachId).single();
  if (clientError) return err(clientError.message);

  let program: Program | undefined;
  if (client.program_id) {
    const { data: programData, error: programError } = await supabase.from("programs").select("*").eq("id", client.program_id).maybeSingle();
    if (programError) return err(programError.message);
    program = (programData as Program | null) ?? undefined;
  }

  return ok({ ...(client as Client), program });
}

export async function updateClientProgram(clientId: string, programId: string | null): Promise<ApiResult<Client>> {
  const blocked = requireSupabase<Client>();
  if (blocked) return blocked;

  if (programId) {
    const { data: programData, error: programError } = await supabase.from("programs").select("id, client_id").eq("id", programId).maybeSingle();
    if (programError) return err(programError.message);
    if (programData && !programData.client_id) {
      const { error: attachError } = await supabase.from("programs").update({ client_id: clientId }).eq("id", programId).is("client_id", null);
      if (attachError) return err(attachError.message);
    }
  }

  const { data: updatedClient, error: updateError } = await supabase.from("clients").update({ program_id: programId }).eq("id", clientId).select("*").single();
  if (updateError) return err(updateError.message);

  let program: Program | undefined;
  if (updatedClient.program_id) {
    const { data: programData, error: programError } = await supabase.from("programs").select("*").eq("id", updatedClient.program_id).maybeSingle();
    if (programError) return err(programError.message);
    program = (programData as Program | null) ?? undefined;
  }

  return ok({ ...(updatedClient as Client), program });
}

export async function getPrograms(): Promise<ApiResult<Program[]>> {
  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");
  const { data, error } = await supabase.from("programs").select("*").eq("coach_id", coachId).order("created_at", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Program[]);
}

export async function createTemplateProgram(data: Pick<Program, "name" | "type" | "weekly_target" | "duration_weeks"> & Partial<Pick<Program, "description" | "exercises">>): Promise<ApiResult<Program>> {
  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");
  const { data: program, error } = await supabase.from("programs").insert([{ ...data, is_template: true, coach_id: coachId, client_id: null }]).select().single();
  if (error) return err(error.message);
  return ok(program as Program);
}

export async function getActiveClientPrograms(): Promise<ApiResult<Array<Program & { client: Pick<Client, "id" | "name" | "goal"> | null }>>> {
  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");
  const { data: programs, error: programsError } = await supabase
    .from("programs")
    .select("*")
    .eq("coach_id", coachId)
    .not("client_id", "is", null)
    .order("created_at", { ascending: false });
  if (programsError) return err(programsError.message);

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, goal, avatar")
    .eq("coach_id", coachId);
  if (clientsError) return err(clientsError.message);

  const clientsById = new Map((clients ?? []).map((client) => [client.id, client]));
  const programsWithClients = (programs ?? []).map((program) => {
    const client = program.client_id ? clientsById.get(program.client_id) : null;
    return {
      ...(program as Program),
      client: client ? { id: client.id, name: client.name, goal: client.goal } : null,
    };
  });

  return ok(programsWithClients as Array<Program & { client: Pick<Client, "id" | "name" | "goal"> | null }>);
}

export async function createClient(client: Omit<Client, "id" | "created_at">): Promise<ApiResult<Client>> {
  const blocked = requireSupabase<Client>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("clients").insert([client]).select().single();
  if (error) return err(error.message);
  return ok(data as Client);
}

export async function deleteClient(clientId: string): Promise<ApiResult<void>> {
  const blocked = requireSupabase<void>();
  if (blocked) return blocked;
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function getProgram(clientId: string): Promise<ApiResult<Program | null>> {
  const blocked = requireSupabase<Program | null>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("programs").select("*").eq("client_id", clientId).single();
  if (error && error.code !== "PGRST116") return err(error.message);
  return ok((data as Program) ?? null);
}

export async function createProgram(program: Omit<Program, "id" | "created_at">): Promise<ApiResult<Program>> {
  const blocked = requireSupabase<Program>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("programs").insert([program]).select().single();
  if (error) return err(error.message);
  return ok(data as Program);
}

export async function updateProgram(programId: string, updates: Partial<Program>): Promise<ApiResult<Program>> {
  const blocked = requireSupabase<Program>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("programs").update(updates).eq("id", programId).select().single();
  if (error) return err(error.message);
  return ok(data as Program);
}

export async function getWorkouts(clientId: string): Promise<ApiResult<Workout[]>> {
  const blocked = requireSupabase<Workout[]>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("workouts").select("*").eq("client_id", clientId).order("date", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Workout[]);
}

export async function getWorkoutsForCoach(coachId: string): Promise<ApiResult<Workout[]>> {
  const blocked = requireSupabase<Workout[]>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("workouts").select("*, clients!inner(coach_id)").eq("clients.coach_id", coachId).order("date", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Workout[]);
}

export async function logWorkout(workout: Omit<Workout, "id" | "created_at">): Promise<ApiResult<Workout>> {
  const blocked = requireSupabase<Workout>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("workouts").insert([workout]).select().single();
  if (error) return err(error.message);
  return ok(data as Workout);
}

export async function deleteWorkout(workoutId: string): Promise<ApiResult<void>> {
  const blocked = requireSupabase<void>();
  if (blocked) return blocked;
  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function getAlerts(coachId: string): Promise<ApiResult<Alert[]>> {
  const blocked = requireSupabase<Alert[]>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("alerts").select("*").eq("coach_id", coachId).order("created_at", { ascending: false }).limit(20);
  if (error) return err(error.message);
  return ok((data ?? []) as Alert[]);
}

export async function markAlertRead(alertId: string): Promise<ApiResult<void>> {
  const blocked = requireSupabase<void>();
  if (blocked) return blocked;
  const { error } = await supabase.from("alerts").update({ read: true }).eq("id", alertId);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function markAllAlertsRead(coachId: string): Promise<ApiResult<void>> {
  const blocked = requireSupabase<void>();
  if (blocked) return blocked;
  const { error } = await supabase.from("alerts").update({ read: true }).eq("coach_id", coachId).eq("read", false);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function createAlert(alert: Omit<Alert, "id" | "created_at" | "read">): Promise<ApiResult<Alert>> {
  const blocked = requireSupabase<Alert>();
  if (blocked) return blocked;
  const { data, error } = await supabase.from("alerts").insert([{ ...alert, read: false }]).select().single();
  if (error) return err(error.message);
  return ok(data as Alert);
}
