import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col items-start justify-center gap-4 px-5 sm:px-8">
      <h1 className="font-medium">Não encontrado</h1>
      <p className="text-[13px] text-muted-foreground">
        Essa página ou recurso não existe.
      </p>
      <Button render={<Link href="/treinos" />} className="squircle">
        Ir para treinos
      </Button>
    </main>
  );
}
