# FitFolio

Gerenciador de treinos com rotinas, exercícios e sessões ao vivo. Visual inspirado no portfolio espresso/papel. Auth e sync via Supabase.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + shadcn base-nova
- Supabase Auth + Postgres (RLS)

## Setup

```bash
bun install
cp .env.local.example .env.local   # ou use o .env.local já configurado
bun dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### Banco de dados

1. Abra o [Supabase SQL Editor](https://supabase.com/dashboard/project/yvcxzluefovfndtthued/sql)
2. Execute, nesta ordem:
   - [`supabase/migrations/001_fitfolio.sql`](supabase/migrations/001_fitfolio.sql)
   - [`supabase/migrations/002_session_exercises.sql`](supabase/migrations/002_session_exercises.sql)
   - [`supabase/migrations/003_history_import.sql`](supabase/migrations/003_history_import.sql)
   - [`supabase/migrations/004_stats.sql`](supabase/migrations/004_stats.sql)
   - [`supabase/migrations/005_backfill_muscle_groups.sql`](supabase/migrations/005_backfill_muscle_groups.sql) (preenche grupo muscular dos exercícios do Hevy)
   - [`supabase/migrations/006_translate_exercises_pt.sql`](supabase/migrations/006_translate_exercises_pt.sql) (renomeia exercícios do Hevy para português)
3. Em **Authentication → Providers**, confirme que Email está habilitado

## Deploy (GitHub Actions → Vercel)

Push em `main` faz deploy de produção; PR faz preview. O Git integration da Vercel está desligado em `vercel.json` para não duplicar build.

1. No terminal (uma vez):

```bash
bunx vercel login
bunx vercel link          # escolhe o projeto fitfolio
cat .vercel/project.json  # copia orgId e projectId
bunx vercel tokens        # ou cria um token em vercel.com/account/tokens
```

2. No GitHub → **Settings → Secrets and variables → Actions**, cria:

| Secret | Valor |
|--------|--------|
| `VERCEL_TOKEN` | token da conta ([vercel.com/account/tokens](https://vercel.com/account/tokens)) |
| `VERCEL_ORG_ID` | `team_…` (no teu caso: `team_mOfczQY6zibwpDJgCzIeLUes`) |
| `VERCEL_PROJECT_ID` | `prj_…` (no teu caso: `prj_htoxaWyI4DeF2gjo9kuFHK5a0wg2`) |

Confere no dashboard do projeto: se aparecer **No Production Deployment**, o Action não promoveu para production — o domínio `*.vercel.app` fica 404 até existir um deploy Production.

3. No projeto Vercel → **Settings → Environment Variables**, confere (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

4. Commit + push em `main` (ou rode o workflow manualmente em **Actions**).

## Uso

1. Crie uma conta em `/cadastro`
2. Cadastre exercícios em **Exercícios**
3. Em **Treinos**, comece um **Treino vazio** ou abra uma rotina e toque em **Iniciar**
4. Na sessão: preencha kg/reps, marque ✓ em cada série (dispara o timer de descanso) e veja a coluna **Anterior** com os valores da última vez
5. **Concluir** salva o treino (séries não marcadas são descartadas)

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login`, `/cadastro` | Auth |
| `/treinos` | Treino vazio, treino em andamento e rotinas |
| `/treinos/novo` | Nova rotina |
| `/treinos/[id]` | Editar rotina + iniciar |
| `/historico` | Treinos concluídos, por mês |
| `/importar` | Importar CSV de treinos do Hevy |
| `/estatisticas` | Duração, volume, séries por músculo, distribuição, ranking e progressão |
| `/sessao/[id]` | Logger ao vivo (ou resumo, se concluído) |
| `/exercicios` | Biblioteca de exercícios |
