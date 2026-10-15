import { AppShell } from "@/components/app-shell";
import { HevyImport } from "@/components/import/hevy-import";

export default function ImportarPage() {
  return (
    <AppShell active="historico">
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-medium">Importar do Hevy</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Selecione o CSV de treinos exportado do Hevy. Pode importar de novo depois: treinos
            que já existem são pulados.
          </p>
        </div>
        <HevyImport />
      </section>
    </AppShell>
  );
}
