import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { IconButton, Textarea } from "@shared/ui";

export interface MessageInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
  disabledReason?: string;
}

/** R-P1 : un compte suspendu perd toute capacite d'ecriture (`disabled`). */
export function MessageInput({
  onSend,
  disabled,
  disabledReason,
}: MessageInputProps) {
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setBody("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  return (
    <div className="border-t border-border p-3">
      {disabled && disabledReason && (
        <p className="mb-2 text-body-sm text-muted-foreground">
          {disabledReason}
        </p>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Écris ton message…"
          rows={1}
          disabled={disabled}
          className="max-h-30 flex-1 resize-none"
        />
        <IconButton
          aria-label="Envoyer"
          onClick={submit}
          disabled={disabled || !body.trim()}
        >
          <Send size={18} />
        </IconButton>
      </div>
    </div>
  );
}
