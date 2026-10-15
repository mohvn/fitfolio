import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RoutineCreateForm } from "@/components/routines/routine-create-form";
import { Button } from "@/components/ui/button";

export default function NovaRotinaPage() {
  return (
    <AppShell active="treinos">
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Nova rotina</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Defina o nome; depois adicione os exercícios.
            </p>
          </div>
          <Button
            render={<Link href="/treinos" />}
            variant="ghost"
            size="sm"
            className="squircle"
          >
            Voltar
          </Button>
        </div>
        <RoutineCreateForm />
      </section>
    </AppShell>
  );
}
