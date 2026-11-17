import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { ApiError } from "@/api/client";
import { IconButton, Spinner, Textarea } from "@shared/ui";
import { attachmentError, formatFileSize } from "../lib/attachments";

export interface MessageDraft {
  body: string;
  file?: File;
}

export interface MessageInputProps {
  /** Rejette si l'envoi echoue : le brouillon est alors conserve. */
  onSend: (draft: MessageDraft) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * R-P1 : un compte suspendu perd toute capacite d'ecriture (`disabled`).
 * R-MSG8 : une piece jointe peut partir seule, sans texte.
 */
export function MessageInput({
  onSend,
  disabled,
  disabledReason,
}: MessageInputProps) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmed = body.trim();
  const canSend = !disabled && !sending && (Boolean(trimmed) || Boolean(file));

  function pickFile(next: File) {
    const problem = attachmentError(next);
    setError(problem);
    if (!problem) setFile(next);
  }

  async function submit() {
    if (!canSend) return;
    setSending(true);
    setError(undefined);
    try {
      await onSend({ body: trimmed, file });
      setBody("");
      setFile(undefined);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Le message n'a pas pu être envoyé.",
      );
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="border-t border-border p-3">
      {disabled && disabledReason && (
        <p className="mb-2 text-body-sm text-muted-foreground">
          {disabledReason}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-2 text-body-sm text-destructive">
          {error}
        </p>
      )}
      {file && (
        <div className="mb-2 flex w-fit max-w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-body-sm text-foreground">
          <Paperclip size={14} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{file.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            aria-label={`Retirer ${file.name}`}
            disabled={sending}
            onClick={() => setFile(undefined)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const next = event.target.files?.[0];
            // Remis a zero pour pouvoir rechoisir le meme fichier.
            event.target.value = "";
            if (next) pickFile(next);
          }}
        />
        <IconButton
          aria-label="Joindre un fichier"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
        >
          <Paperclip size={18} />
        </IconButton>
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.files[0];
            if (pasted) {
              e.preventDefault();
              pickFile(pasted);
            }
          }}
          placeholder="Écris ton message…"
          rows={1}
          maxLength={4000}
          disabled={disabled}
          className="max-h-30 flex-1 resize-none"
        />
        <IconButton
          aria-label="Envoyer"
          onClick={() => void submit()}
          disabled={!canSend}
        >
          {sending ? <Spinner size="sm" /> : <Send size={18} />}
        </IconButton>
      </div>
    </div>
  );
}
