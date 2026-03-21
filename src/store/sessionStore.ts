import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SessionState {
  sessionId: string | null;
  queryCount: number;
  queryLimit: number;
  resetAt: string | null;
  isRateLimited: boolean;
  warningShown: boolean;

  // Actions
  setSessionId: (id: string) => void;
  incrementQueryCount: () => void;
  setRateLimitReset: (resetAt: string) => void;
  checkRateLimit: () => boolean;
  dismissWarning: () => void;
  reset: () => void;
}

const QUERY_LIMIT = 20;
const WARNING_THRESHOLD = 15;

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      sessionId: null,
      queryCount: 0,
      queryLimit: QUERY_LIMIT,
      resetAt: null,
      isRateLimited: false,
      warningShown: false,

      setSessionId: (id) => set({ sessionId: id }, false, "setSessionId"),

      incrementQueryCount: () => {
        const { queryCount } = get();
        const newCount = queryCount + 1;
        set(
          {
            queryCount: newCount,
            isRateLimited: newCount >= QUERY_LIMIT,
            warningShown: newCount >= WARNING_THRESHOLD,
          },
          false,
          "incrementQueryCount"
        );
      },

      setRateLimitReset: (resetAt) => {
        set({ resetAt, isRateLimited: true }, false, "setRateLimitReset");
        // Auto-reset after the specified time
        const resetTime = new Date(resetAt).getTime() - Date.now();
        if (resetTime > 0) {
          setTimeout(() => {
            set(
              { queryCount: 0, isRateLimited: false, resetAt: null, warningShown: false },
              false,
              "autoReset"
            );
          }, resetTime);
        }
      },

      checkRateLimit: () => {
        const { queryCount, queryLimit } = get();
        return queryCount >= queryLimit;
      },

      dismissWarning: () =>
        set({ warningShown: false }, false, "dismissWarning"),

      reset: () =>
        set(
          {
            queryCount: 0,
            isRateLimited: false,
            resetAt: null,
            warningShown: false,
          },
          false,
          "reset"
        ),
    }),
    { name: "SessionStore" }
  )
);
