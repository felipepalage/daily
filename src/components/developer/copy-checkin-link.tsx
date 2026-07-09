"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyCheckinLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/checkin/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="secondary" onClick={handleCopy}>
        {copied ? "Link copiado!" : "Copiar link de check-in do dev"}
      </Button>
      <span className="text-xs text-foreground-muted">
        Envie esse link pro dev preencher o próprio check-in.
      </span>
    </div>
  );
}
