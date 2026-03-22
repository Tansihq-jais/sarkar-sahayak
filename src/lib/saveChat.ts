import { createServerClient } from "./supabase";
import type { EligibilityResult } from "@/types";

interface SaveMessagesParams {
  sessionId: string;
  schemeId: string | null;
  schemeName: string | null;
  messages: { role: "user" | "assistant"; content: string; sequenceNum: number }[];
}

// Cache: guestSession → dbSessionId
const sessionCache = new Map<string, string>();

/**
 * Task #77 — Persist chat messages to Supabase.
 * Creates a chat_session row if one doesn't exist yet.
 * Fire-and-forget safe — errors are logged but not thrown.
 */
export async function saveMessages({ sessionId, schemeId, schemeName, messages }: SaveMessagesParams): Promise<void> {
  try {
    const supabase = createServerClient();

    // Get or create DB session
    let dbSessionId = sessionCache.get(sessionId);

    if (!dbSessionId) {
      // Check if session already exists
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("guest_session", sessionId)
        .single();

      if (existing?.id) {
        dbSessionId = existing.id;
      } else {
        // Create new session
        const { data: newSession } = await supabase
          .from("chat_sessions")
          .insert({
            guest_session: sessionId,
            scheme_id: schemeId,
            scheme_name: schemeName,
            turn_count: 0,
          })
          .select("id")
          .single();

        dbSessionId = newSession?.id;
      }

      if (dbSessionId) sessionCache.set(sessionId, dbSessionId);
    }

    if (!dbSessionId) return;

    // Insert messages
    const rows = messages.map((m) => ({
      session_id: dbSessionId!,
      role: m.role,
      content: m.content,
      sequence_num: m.sequenceNum,
    }));

    await supabase.from("messages").insert(rows);

    // Update turn count
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    if (userMsgCount > 0) {
      const { error: rpcErr } = await supabase.rpc("increment_turn_count", {
        session_id: dbSessionId,
        increment: userMsgCount,
      });
      
      if (rpcErr) {
        // RPC might not exist — update directly
        await supabase.from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", dbSessionId!);
      }
    }
  } catch (err) {
    console.error("saveMessages error:", err);
  }
}

/**
 * Task #79 — Persist eligibility result to Supabase.
 * Called when a verdict is detected in the chat response.
 */
export async function saveEligibilityResult(
  result: EligibilityResult,
  sessionId: string,
  schemeName: string | null
): Promise<void> {
  try {
    const supabase = createServerClient();
    const dbSessionId = sessionCache.get(sessionId);

    if (!dbSessionId) return;

    await supabase.from("eligibility_results").insert({
      session_id: dbSessionId,
      scheme_id: result.schemeId,
      scheme_name: schemeName,
      verdict: result.verdict!,
      confidence_score: result.confidenceScore,
      criteria_met: result.criteriaMet as unknown as Record<string, unknown>[],
      documents_needed: result.documentsNeeded as unknown as Record<string, unknown>[],
      application_steps: result.applicationSteps as unknown as Record<string, unknown>[],
    });

    // Also update session verdict
    await supabase
      .from("chat_sessions")
      .update({ verdict: result.verdict })
      .eq("id", dbSessionId);

  } catch (err) {
    console.error("saveEligibilityResult error:", err);
  }
}
