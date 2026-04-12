import { createClient } from "@supabase/supabase-js";
import { sampleRequests } from "./sampleRequests.js";

const REQUESTS_TABLE = process.env.SUPABASE_REQUESTS_TABLE || "requests";
const riceFieldRanges = {
  reach: { min: 0, max: 5 },
  impact: { min: 0, max: 5 },
  confidence: { min: 0, max: 100 },
  effort: { min: 0, max: 5 },
};
const deliveryStatusOptions = [
  "clarifying",
  "ready",
  "in_progress",
  "blocked",
  "ready_to_launch",
  "launched",
];

function defaultDeliveryFields() {
  return {
    deliveryOwner: "",
    deliveryStatus: "clarifying",
    targetDate: "",
    currentBlocker: "",
    mainRisk: "",
    openDecision: "",
    latestUpdate: "",
    launchQaComplete: false,
    launchStakeholdersInformed: false,
    launchDateConfirmed: false,
    launchMonitoringReady: false,
  };
}

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
    deliveryOwner: row.delivery_owner || "",
    deliveryStatus: row.delivery_status || "clarifying",
    targetDate: row.target_date || "",
    currentBlocker: row.current_blocker || "",
    mainRisk: row.main_risk || "",
    openDecision: row.open_decision || "",
    latestUpdate: row.latest_update || "",
    launchQaComplete: Boolean(row.launch_qa_complete),
    launchStakeholdersInformed: Boolean(row.launch_stakeholders_informed),
    launchDateConfirmed: Boolean(row.launch_date_confirmed),
    launchMonitoringReady: Boolean(row.launch_monitoring_ready),
  };
}

function toDbRequest(input) {
  const now = new Date().toISOString().slice(0, 10);
  const delivery = { ...defaultDeliveryFields(), ...input };
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
    delivery_owner: delivery.deliveryOwner?.trim() ?? "",
    delivery_status: delivery.deliveryStatus ?? "clarifying",
    target_date: delivery.targetDate || null,
    current_blocker: delivery.currentBlocker ?? "",
    main_risk: delivery.mainRisk ?? "",
    open_decision: delivery.openDecision ?? "",
    latest_update: delivery.latestUpdate ?? "",
    launch_qa_complete: Boolean(delivery.launchQaComplete),
    launch_stakeholders_informed: Boolean(delivery.launchStakeholdersInformed),
    launch_date_confirmed: Boolean(delivery.launchDateConfirmed),
    launch_monitoring_ready: Boolean(delivery.launchMonitoringReady),
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

function validateDeliveryFields(input) {
  if (
    input.deliveryStatus !== undefined &&
    input.deliveryStatus !== null &&
    input.deliveryStatus !== "" &&
    !deliveryStatusOptions.includes(input.deliveryStatus)
  ) {
    return "deliveryStatus must be a valid delivery state.";
  }

  if (input.targetDate) {
    const targetDate = new Date(input.targetDate);
    if (Number.isNaN(targetDate.getTime())) {
      return "targetDate must be a valid date.";
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

      const deliveryError = validateDeliveryFields(payload);
      if (deliveryError) {
        throw new Error(deliveryError);
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

      const deliveryError = validateDeliveryFields(mergedPayload);
      if (deliveryError) {
        throw new Error(deliveryError);
      }

      const row = {
        ...current,
        ...toDbRequest(mergedPayload),
        id,
      };
      records.set(id, row);
      return toClientRequest(row);
    },
    async deleteRequest(id) {
      const current = records.get(id);
      if (!current) {
        return false;
      }

      records.delete(id);
      return true;
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

      const deliveryError = validateDeliveryFields(payload);
      if (deliveryError) {
        throw new Error(deliveryError);
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

      const deliveryError = validateDeliveryFields(mergedPayload);
      if (deliveryError) {
        throw new Error(deliveryError);
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
    async deleteRequest(id) {
      const { data, error } = await supabase
        .from(REQUESTS_TABLE)
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      return Boolean(data?.id);
    },
  };
}

export function createRequestStore() {
  return createSupabaseStore() ?? createMemoryStore();
}
