/**
 * src/lib/api.ts
 * Supabase data layer — all DB access goes through here.
 * Falls back to mock data when Supabase is not configured.
 */
import { supabase, isSupabaseConfigured } from "./supabase";
import { mockClients, mockCoach } from "./mockData";
import type { Client, Program, Workout, Alert, Coach, ApiResult } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}
function err<T>(msg: string): ApiResult<T> {
  console.error("[CoachOS API]", msg);
  return { data: null, error: msg };
}


async function getAuthenticatedCoachId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("[CoachOS API]", error.message);
    return null;
  }
  return data.user?.id ?? null;
}

// ─── Coach ───────────────────────────────────────────────────────────────────

export async function getCoachProfile(coachId: string): Promise<ApiResult<Coach>> {
  if (!isSupabaseConfigured) return ok(mockCoach);
  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", coachId)
    .single();
  if (error) return err(error.message);
  return ok(data as Coach);
}

export async function updateCoachProfile(
  coachId: string,
  updates: Partial<Coach>
): Promise<ApiResult<Coach>> {
  if (!isSupabaseConfigured) return ok({ ...mockCoach, ...updates });
  const { data, error } = await supabase
    .from("coaches")
    .update(updates)
    .eq("id", coachId)
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Coach);
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(coachId: string): Promise<ApiResult<Client[]>> {
  if (!isSupabaseConfigured) return ok(mockClients);
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Client[]);
}

export async function getClientById(
  clientId: string,
  coachId: string
): Promise<ApiResult<Client>> {
  if (!isSupabaseConfigured) {
    const c = mockClients.find((c) => c.id === clientId);
    if (!c) return err("Client not found");
    return ok(c);
  }
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      program:programs!clients_program_id_fkey(*)
    `
    )
    .eq("id", clientId)
    .eq("coach_id", coachId)
    .single();
  if (error) return err(error.message);
  return ok(data as Client);
}

export async function updateClientProgram(
  clientId: string,
  programId: string | null
): Promise<ApiResult<Client>> {
  if (!isSupabaseConfigured) {
    const client = mockClients.find((c) => c.id === clientId);
    if (!client) return err("Client not found");
    return ok({ ...client, program_id: programId });
  }

  if (programId) {
    const { data: programData, error: programError } = await supabase
      .from("programs")
      .select("id, client_id")
      .eq("id", programId)
      .maybeSingle();

    if (programError) return err(programError.message);

    if (programData && !programData.client_id) {
      const { error: attachError } = await supabase
        .from("programs")
        .update({ client_id: clientId })
        .eq("id", programId)
        .is("client_id", null);
      if (attachError) return err(attachError.message);
    }
  }

  const { data, error } = await supabase
    .from("clients")
    .update({ program_id: programId })
    .eq("id", clientId)
    .select(
      `
      *,
      program:programs!clients_program_id_fkey(*)
    `
    )
    .single();
  if (error) return err(error.message);
  return ok(data as Client);
}

export async function getPrograms(): Promise<ApiResult<Program[]>> {
  if (!isSupabaseConfigured) {
    return ok(mockClients.map((c) => c.program).filter(Boolean) as Program[]);
  }

  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Program[]);
}

export async function createTemplateProgram(
  data: Pick<Program, "name" | "type" | "weekly_target" | "duration_weeks"> &
    Partial<Pick<Program, "description" | "exercises">>
): Promise<ApiResult<Program>> {
  if (!isSupabaseConfigured) {
    const fake: Program = {
      ...data,
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
      client_id: null,
      is_template: true,
    };
    return ok(fake);
  }

  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");

  const { data: program, error } = await supabase
    .from("programs")
    .insert([{ ...data, is_template: true, coach_id: coachId, client_id: null }])
    .select()
    .single();

  if (error) return err(error.message);
  return ok(program as Program);
}

export async function getActiveClientPrograms(): Promise<ApiResult<Array<Program & { client: Pick<Client, "id" | "name" | "goal"> | null }>>> {
  if (!isSupabaseConfigured) {
    const active = mockClients
      .filter((c) => c.program)
      .map((c) => ({ ...(c.program as Program), client: { id: c.id, name: c.name, goal: c.goal } }));
    return ok(active);
  }

  const coachId = await getAuthenticatedCoachId();
  if (!coachId) return err("User not authenticated");

  const { data, error } = await supabase
    .from("programs")
    .select(`
      *,
      client:clients!programs_client_id_fkey(id, name, goal, coach_id)
    `)
    .eq("coach_id", coachId)
    .not("client_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as Array<Program & { client: Pick<Client, "id" | "name" | "goal"> | null }>);
}

export async function createClient(
  client: Omit<Client, "id" | "created_at">
): Promise<ApiResult<Client>> {
  if (!isSupabaseConfigured) {
    const fake: Client = {
      ...client,
      id: `c-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return ok(fake);
  }
  const { data, error } = await supabase
    .from("clients")
    .insert([client])
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Client);
}

export async function deleteClient(clientId: string): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) return ok(undefined);
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) return err(error.message);
  return ok(undefined);
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export async function getProgram(clientId: string): Promise<ApiResult<Program | null>> {
  if (!isSupabaseConfigured) {
    const c = mockClients.find((c) => c.id === clientId);
    return ok(c?.program ?? null);
  }
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return err(error.message);
  return ok(data as Program | null);
}

export async function createProgram(
  program: Omit<Program, "id" | "created_at">
): Promise<ApiResult<Program>> {
  if (!isSupabaseConfigured) {
    const fake: Program = {
      ...program,
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return ok(fake);
  }
  const { data, error } = await supabase
    .from("programs")
    .insert([program])
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Program);
}

export async function updateProgram(
  programId: string,
  updates: Partial<Program>
): Promise<ApiResult<Program>> {
  if (!isSupabaseConfigured) {
    return ok({ id: programId, ...updates } as Program);
  }
  const { data, error } = await supabase
    .from("programs")
    .update(updates)
    .eq("id", programId)
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Program);
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function getWorkouts(clientId: string): Promise<ApiResult<Workout[]>> {
  if (!isSupabaseConfigured) {
    const c = mockClients.find((c) => c.id === clientId);
    return ok(c?.workouts ?? []);
  }
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Workout[]);
}

export async function getWorkoutsForCoach(coachId: string): Promise<ApiResult<Workout[]>> {
  if (!isSupabaseConfigured) {
    const all = mockClients.flatMap((c) => c.workouts ?? []);
    return ok(all);
  }
  // Join through clients table (RLS handles security)
  const { data, error } = await supabase
    .from("workouts")
    .select("*, clients!inner(coach_id)")
    .eq("clients.coach_id", coachId)
    .order("date", { ascending: false });
  if (error) return err(error.message);
  return ok((data ?? []) as Workout[]);
}

export async function logWorkout(
  workout: Omit<Workout, "id" | "created_at">
): Promise<ApiResult<Workout>> {
  if (!isSupabaseConfigured) {
    const fake: Workout = {
      ...workout,
      id: `w-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return ok(fake);
  }
  const { data, error } = await supabase
    .from("workouts")
    .insert([workout])
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Workout);
}

export async function deleteWorkout(workoutId: string): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) return ok(undefined);
  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) return err(error.message);
  return ok(undefined);
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts(coachId: string): Promise<ApiResult<Alert[]>> {
  if (!isSupabaseConfigured) return ok(generateMockAlerts(coachId));
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return err(error.message);
  return ok((data ?? []) as Alert[]);
}

export async function markAlertRead(alertId: string): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) return ok(undefined);
  const { error } = await supabase
    .from("alerts")
    .update({ read: true })
    .eq("id", alertId);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function markAllAlertsRead(coachId: string): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) return ok(undefined);
  const { error } = await supabase
    .from("alerts")
    .update({ read: true })
    .eq("coach_id", coachId)
    .eq("read", false);
  if (error) return err(error.message);
  return ok(undefined);
}

export async function createAlert(
  alert: Omit<Alert, "id" | "created_at" | "read">
): Promise<ApiResult<Alert>> {
  if (!isSupabaseConfigured) {
    return ok({ ...alert, id: `a-${Date.now()}`, read: false, created_at: new Date().toISOString() });
  }
  const { data, error } = await supabase
    .from("alerts")
    .insert([{ ...alert, read: false }])
    .select()
    .single();
  if (error) return err(error.message);
  return ok(data as Alert);
}

// ─── Mock alert generator ─────────────────────────────────────────────────────

function generateMockAlerts(coachId: string): Alert[] {
  return [
    {
      id: "a-1",
      coach_id: coachId,
      client_id: "c-4",
      type: "critical_adherence",
      message: "Priya Patel dropped to 30% adherence — immediate check-in recommended.",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      client_name: "Priya Patel",
    },
    {
      id: "a-2",
      coach_id: coachId,
      client_id: "c-7",
      type: "critical_adherence",
      message: "Deon Harris has missed 4 consecutive workouts.",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      client_name: "Deon Harris",
    },
    {
      id: "a-3",
      coach_id: coachId,
      client_id: "c-2",
      type: "declining_trend",
      message: "Sarah Kim's adherence has declined 18% over the last 2 weeks.",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      client_name: "Sarah Kim",
    },
    {
      id: "a-4",
      coach_id: coachId,
      client_id: "c-3",
      type: "missed_workout",
      message: "Marcus Webb missed yesterday's session — unusual for him.",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      client_name: "Marcus Webb",
    },
    {
      id: "a-5",
      coach_id: coachId,
      client_id: "c-5",
      type: "declining_trend",
      message: "Tom Briggs is trending downward — consider a program check-in.",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      client_name: "Tom Briggs",
    },
  ];
}
