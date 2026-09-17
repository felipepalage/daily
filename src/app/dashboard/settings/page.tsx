import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getActiveTeam } from "@/lib/team";
import { Card } from "@/components/ui/card";
import { QuestionLabelsForm } from "@/components/dashboard/question-labels-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { RedmineConfigForm } from "@/components/dashboard/redmine-config-form";
import { AddDeveloperForm } from "@/components/dashboard/add-developer-form";
import { DeleteDeveloperButton } from "@/components/dashboard/delete-developer-button";

export const runtime = "edge";

type ScrumMasterDto = {
  id: string;
  name: string;
  email: string;
  questionDoingLabel: string;
  questionBlockedLabel: string;
  questionImproveLabel: string;
  redmineUrl: string | null;
  redmineApiKey: string | null;
};

type DeveloperDto = {
  id: string;
  name: string;
  role: string | null;
};

export default async function SettingsPage() {
  const session = await requireSession();
  const { activeTeam } = await getActiveTeam();

  // Busca dados do scrum master e developers via API
  let scrumMaster: ScrumMasterDto | null = null;
  let developers: DeveloperDto[] = [];

  try {
    scrumMaster = await apiFetch<ScrumMasterDto>("/auth/me");
  } catch {
    // fallback: usa dados da sessão
  }

  if (activeTeam) {
    try {
      developers = await apiFetch<DeveloperDto[]>(`/teams/${activeTeam.id}/developers`);
    } catch {
      developers = [];
    }
  }

  const questionLabels = {
    doing: scrumMaster?.questionDoingLabel ?? "O que está sendo feito?",
    blocked: scrumMaster?.questionBlockedLabel ?? "Tem algum impedimento?",
    improve: scrumMaster?.questionImproveLabel ?? "O que pode melhorar?",
  };

  return (
    <div className="max-w-lg space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Gerencie sua conta, integrações e o time.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Conta
        </h2>
        <Card className="p-6">
          <ChangePasswordForm />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Integração Redmine
        </h2>
        <Card className="p-6">
          <RedmineConfigForm
            initial={{
              redmineUrl: scrumMaster?.redmineUrl ?? "",
              redmineApiKey: scrumMaster?.redmineApiKey ?? "",
            }}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Perguntas do check-in
        </h2>
        <Card className="p-6">
          <QuestionLabelsForm initialLabels={questionLabels} />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Desenvolvedores do time &ldquo;{activeTeam?.name ?? ""}&rdquo;
        </h2>
        <Card className="p-6">
          <div className="mb-4">
            <AddDeveloperForm teamId={activeTeam?.id ?? ""} />
          </div>
          {developers.length === 0 ? (
            <p className="text-sm text-foreground-muted">Nenhum desenvolvedor no time ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {developers.map((developer) => (
                <li key={developer.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/dashboard/developers/${developer.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {developer.name}
                    {developer.role && (
                      <span className="ml-2 text-xs font-normal text-foreground-muted">
                        {developer.role}
                      </span>
                    )}
                  </Link>
                  <DeleteDeveloperButton id={developer.id} name={developer.name} variant="text" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}