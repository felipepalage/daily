import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { QuestionLabelsForm } from "@/components/dashboard/question-labels-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const scrumMaster = await prisma.scrumMaster.findUniqueOrThrow({
    where: { id: session.scrumMasterId },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Personalize as perguntas do check-in diário do seu time.
        </p>
      </header>

      <Card className="max-w-lg p-6">
        <QuestionLabelsForm
          initialLabels={{
            doing: scrumMaster.questionDoingLabel,
            blocked: scrumMaster.questionBlockedLabel,
            improve: scrumMaster.questionImproveLabel,
          }}
        />
      </Card>
    </div>
  );
}
