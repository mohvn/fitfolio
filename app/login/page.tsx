import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col justify-center gap-section px-5 py-10 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-medium">FitFolio</h1>
        <p className="text-muted-foreground">Entre para continuar seus treinos.</p>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
