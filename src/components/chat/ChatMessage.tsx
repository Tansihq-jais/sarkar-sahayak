import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5",
          isUser ? "bg-navy text-white" : "bg-brand-orange-light text-brand-orange"
        )}
      >
        {isUser ? "👤" : "🏛️"}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-chat",
          isUser
            ? "rounded-tr-sm bg-navy text-white"
            : "rounded-tl-sm bg-white text-ink border border-sand"
        )}
      >
        <FormattedText text={message.content} isUser={isUser} />
        {isStreaming && (
          <span className="ml-1 inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce-dot"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

/** Renders message text with basic markdown-like formatting */
function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  // Split on double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        // Bullet list
        if (para.trim().startsWith("- ") || para.trim().startsWith("• ")) {
          const items = para.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("• "));
          return (
            <ul key={i} className="space-y-1 pl-1">
              {items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className={isUser ? "text-blue-200" : "text-brand-orange"}>•</span>
                  <span>{item.replace(/^[-•]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        // Bold text (**text**)
        const withBold = para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className={isUser ? "text-blue-100" : "text-navy"}>{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        );
        return <p key={i}>{withBold}</p>;
      })}
    </div>
  );
}

/** Typing indicator shown while streaming */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <div className="h-8 w-8 rounded-full bg-brand-orange-light text-brand-orange flex items-center justify-center text-sm shrink-0">
        🏛️
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-sand px-4 py-3 shadow-chat">
        <span className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-muted animate-bounce-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
