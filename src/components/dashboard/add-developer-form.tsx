"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Credential = { email: string | null; temporaryPassword: string | null };

export function AddDeveloperForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          name: formData.get("name"),
          role: formData.get("role"),
          email: formData.get("email"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao criar desenvolvedor.");
        return;
      }
      const data = (await res.json().catch(() => null)) as Credential | null;
      router.refresh();
      if (data?.temporaryPassword) {
        setCredential({ email: data.email, temporaryPassword: data.temporaryPassword });
        setCopied(false);
      } else {
        setOpen(false);
      }
    } finally {
      setPending(false);
    }
  }

  async function copyCredential() {
    if (!credential?.temporaryPassword) return;
    const text = `E-mail: ${credential.email ?? ""}\nSenha temporária: ${credential.temporaryPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // ignore
    }
  }

  // Painel com a senha temporária recém-criada.
  if (credential) {
    return (
      <Card className="w-full max-w-md p-5">
        <p className="text-sm font-medium text-foreground">Desenvolvedor criado! 🎉</p>
        <p className="mt-1 text-sm text-foreground-muted">
          Repasse estes dados para o dev acessar. A senha só aparece agora.
        </p>
        <div className="mt-4 space-y-1 rounded-lg bg-surface-muted p-3 text-sm">
          <p>
            <span className="text-foreground-muted">E-mail:</span>{" "}
            <span className="font-medium text-foreground">{credential.email}</span>
          </p>
          <p>
            <span className="text-foreground-muted">Senha temporária:</span>{" "}
            <span className="font-mono font-medium text-foreground">{credential.temporaryPassword}</span>
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={copyCredential}>
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setCredential(null);
              setOpen(false);
            }}
          >
            Fechar
          </Button>
        </div>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Adicionar desenvolvedor
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" placeholder="Ex: Ana Souza" required autoFocus />
        </div>
        <div>
          <Label htmlFor="role">Função (opcional)</Label>
          <Input id="role" name="role" placeholder="Ex: Backend, Frontend, QA" />
        </div>
        <div>
          <Label htmlFor="email">E-mail do dev</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Necessário para o dev logar e preencher o próprio check-in"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
