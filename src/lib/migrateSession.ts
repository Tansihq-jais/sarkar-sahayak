import { createServerClient } from "./supabase";
import type { ChatMessage, EligibilityResult } from "@/types";

interface MigrateSessionParams {
  userId: string;
  guestSessionId: string;
  messages: ChatMessage[];
  schemeId?: string;
  schemeName?: string;
  result?: EligibilityResult | null;
}

/**
 * Called after OTP login — migrates any pending guest session
 * data (chat messages + eligibility results) into Supabase.
 * This preserves the user's work even if they logged in mid-session.
 */
export async function migrateGuestSession({
  userId,
  guestSessionId,
  messages,
  schemeId,
  schemeName,
  result,
}: MigrateSessionParams): Promise<void> {
  if (!messages.length && !result) return;

  const supabase = createServerClient();

  try {
    // 1. Create a chat session in DB
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        guest_session: guestSessionId,
        scheme_id: schemeId ?? null,
        scheme_name: schemeName ?? null,
        turn_count: messages.filter((m) => m.role === "user").length,
        verdict: result?.verdict ?? null,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("migrateSession: failed to create session", sessionError);
      return;
    }

    const sessionDbId = session.id;

    // 2. Insert messages
    if (messages.length > 0) {
      const msgRows = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          session_id: sessionDbId,
          role: m.role as "user" | "assistant",
          content: m.content,
          sequence_num: m.sequenceNum,
        }));

      const { error: msgError } = await supabase.from("messages").insert(msgRows);
      if (msgError) {
        console.error("migrateSession: failed to insert messages", msgError);
      }
    }

    // 3. Insert eligibility result
    if (result && result.verdict) {
      const { error: resultError } = await supabase.from("eligibility_results").insert({
        session_id: sessionDbId,
        user_id: userId,
        scheme_id: result.schemeId,
        scheme_name: schemeName ?? null,
        verdict: result.verdict,
        confidence_score: result.confidenceScore,
        criteria_met: result.criteriaMet as unknown as import("@/lib/database.types").Json,
        documents_needed: result.documentsNeeded as unknown as import("@/lib/database.types").Json,
        application_steps: result.applicationSteps as unknown as import("@/lib/database.types").Json,
      });

      if (resultError) {
        console.error("migrateSession: failed to insert result", resultError);
      }
    }
  } catch (err) {
    console.error("migrateSession: unexpected error", err);
  }
}
