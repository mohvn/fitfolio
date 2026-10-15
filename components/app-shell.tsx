import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/treinos", label: "Treinos", key: "treinos" as const },
  { href: "/historico", label: "Histórico", key: "historico" as const },
  { href: "/estatisticas", label: "Estatísticas", key: "estatisticas" as const },
  { href: "/exercicios", label: "Exercícios", key: "exercicios" as const },
];

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "treinos" | "historico" | "estatisticas" | "exercicios" | "sessao";
}) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-8 pb-16 sm:px-8 md:pt-14">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/treinos" className="font-medium">
            FitFolio
          </Link>
          <nav className="flex items-center gap-3">
            {links.map((link) => {
              const isActive =
                active === link.key || (active === "sessao" && link.key === "treinos");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13px] transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground-secondary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="squircle"
            aria-label="Sair"
          >
            <LogOutIcon />
          </Button>
        </form>
      </header>

      {children}
    </main>
  );
}
