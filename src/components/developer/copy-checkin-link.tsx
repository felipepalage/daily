"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CopyCheckinLink({ token }: { token: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/checkin/${token}`);
  }, [token]);

  async function handleCopy() {
    inputRef.current?.select();

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch {
        // segue para o fallback abaixo
      }
    }

    // Sem HTTPS o navegador bloqueia a Clipboard API — o texto já fica
    // selecionado no input, então Ctrl+C/Cmd+C funciona manualmente.
    document.execCommand?.("copy");
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground-muted">
        Link de check-in do dev
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="max-w-md"
        />
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-foreground-muted">
        Envie esse link pro dev preencher o próprio check-in. Se o botão não
        copiar, clique no campo e use Ctrl+C.
      </p>
    </div>
  );
}
