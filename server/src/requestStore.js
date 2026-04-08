import { createClient } from "@supabase/supabase-js";
import { sampleRequests } from "./sampleRequests.js";

const REQUESTS_TABLE = process.env.SUPABASE_REQUESTS_TABLE || "requests";
const riceFieldRanges = {
  reach: { min: 0, max: 5 },
  impact: { min: 0, max: 5 },
  confidence: { min: 0, max: 100 },
  effort: { min: 0, max: 5 },
};

function toClientRequest(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    submitterName: row.submitter_name,
    submitterPriority: row.submitter_priority,
    reach: row.reach,
    impact: row.impact,
    confidence: row.confidence,
    effort: row.effort,
    riceScore: row.rice_score,
    notes: row.notes || "",
    isArchived: Boolean(row.is_archived),
    status: row.status,
    placement: row.placement,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbRequest(input) {
  const now = new Date().toISOString().slice(0, 10);
  return {
    title: input.title?.trim() ?? "",
    description: input.description?.trim() ?? "",
    submitter_name: input.submitterName?.trim() ?? "",
    submitter_priority: input.submitterPriority ?? "High",
    reach: input.reach ?? null,
    impact: input.impact ?? null,
    confidence: input.confidence ?? null,
    effort: input.effort ?? null,
    rice_score: input.riceScore ?? null,
    notes: input.notes ?? "",
    is_archived: input.isArchived ?? false,
    status: input.status ?? "submitted",
    placement: input.placement ?? "unassigned",
    created_at: input.createdAt ?? now,
    updated_at: input.updatedAt ?? now,
  };
}

function validateCreateRequest(input) {
  if (!input.title?.trim()) {
    return "Title is required.";
  }
  if (!input.description?.trim()) {
    return "Description is required.";
  }
  if (!input.submitterName?.trim()) {
    return "Submitter name is required.";
  }
  return null;
}

function validateRiceFields(input) {
  for (const [field, { min, max }] of Object.entries(riceFieldRanges)) {
    const value = input[field];

    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
      return `${field} must be a number.`;
    }

    if (value < min || value > max) {
      return `${field} must stay between ${min} and ${max}.`;
    }
  }

  return null;
}

function createMemoryStore() {
  const records = new Map(sampleRequests.map((request) => [request.id, request]));

  return {
    mode: "memory",
    async listRequests() {
      return Array.from(records.values())
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .map(toClientRequest);
    },
    async createRequest(payload) {
      const validationError = validateCreateRequest(payload);
      if (validationError) {
        throw new Error(validationError);
      }

      const riceError = validateRiceFields(payload);
      if (riceError) {
        throw new Error(riceError);
      }

      const id = crypto.randomUUID();
      const row = {
        id,
        ...toDbRequest(payload),
      };
      records.set(id, row);
      return toClientRequest(row);
    },
    async updateRequest(id, patch) {
      const current = records.get(id);
      if (!current) {
        return null;
      }

      const mergedPayload = {
        ...toClientRequest(current),
        ...patch,
        createdAt: current.created_at,
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      const riceError = validateRiceFields(mergedPayload);
      if (riceError) {
        throw new Error(riceError);
      }

      const row = {
        ...current,
        ...toDbRequest(mergedPayload),
        id,
      };
      records.set(id, row);
      return toClientRequest(row);
    },
  };
}

function createSupabaseStore() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return {
    mode: "supabase",
    async listRequests() {
      const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data.map(toClientRequest);
    },
    async createRequest(payload) {
      const validationError = validateCreateRequest(payload);
      if (validationError) {
        throw new Error(validationError);
      }

      const riceError = validateRiceFields(payload);
      if (riceError) {
        throw new Error(riceError);
      }

      const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .insert(toDbRequest(payload))
        .select()
        .single();

      if (error) throw error;
      return toClientRequest(data);
    },
    async updateRequest(id, patch) {
      const existing = await supabase
        .from(REQUESTS_TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (existing.error) throw existing.error;
      if (!existing.data) return null;

      const mergedPayload = {
        ...toClientRequest(existing.data),
        ...patch,
        createdAt: existing.data.created_at,
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      const riceError = validateRiceFields(mergedPayload);
      if (riceError) {
        throw new Error(riceError);
      }

      const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .update(toDbRequest(mergedPayload))
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return toClientRequest(data);
    },
  };
}

export function createRequestStore() {
  return createSupabaseStore() ?? createMemoryStore();
}
