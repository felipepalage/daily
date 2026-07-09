# Daily

Aplicação para o scrum master acompanhar o dia a dia do time. Cada desenvolvedor
responde três perguntas por dia — o que está fazendo, o que está travado e o que
pode melhorar — e o scrum master consegue ver um resumo semanal consolidado,
exportável em PDF.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) com TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) para o visual
- [Prisma 7](https://www.prisma.io) + SQLite como banco de dados (arquivo local, sem depender de serviço externo)
- Autenticação própria (sessão em cookie assinado com [jose](https://github.com/panva/jose) + senha com `bcryptjs`), sem serviços externos
- [jsPDF](https://github.com/parallax/jsPDF) para gerar o resumo semanal em PDF

Front-end e back-end vivem no mesmo projeto: as páginas em `src/app` chamam
Server Actions em `src/lib/actions`, que acessam o banco via Prisma.

## Como rodar

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite local (dev.db) a partir do schema
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Na primeira vez, crie uma
conta de scrum master em `/register` — cada scrum master tem seu próprio time de
desenvolvedores, isolado dos demais.

## Estrutura

- `prisma/schema.prisma` — modelos `ScrumMaster`, `Developer` e `DailyEntry`.
- `src/proxy.ts` — protege as rotas do dashboard, redirecionando para `/login`
  quando não há sessão válida (equivalente ao middleware, renomeado no Next 16).
- `src/lib/auth.ts` — criação/verificação de sessão e hash de senha.
- `src/lib/actions/` — Server Actions de autenticação, desenvolvedores e check-ins.
- `src/app/dashboard` — visão geral do time, página de cada desenvolvedor
  (check-in diário + histórico) e o resumo semanal com exportação em PDF.

## Deploy em produção

Variáveis de ambiente necessárias (veja `.env.example`):

- `DATABASE_URL` — caminho do arquivo SQLite. **Importante:** aponte para um
  disco/volume persistente. Se o deploy for em container ou serverless sem
  volume persistente, o banco é perdido a cada novo deploy/restart — nesse
  caso, avise para trocarmos o Prisma para um banco hospedado (ex: Turso,
  Postgres) antes de ir para produção.
- `AUTH_SECRET` — gere um valor novo e secreto só para produção (não reutilize
  o do `.env` de desenvolvimento). Comando sugerido:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Comandos de build e start (Node 20+):

```bash
npm install
npx prisma migrate deploy   # aplica as migrations no banco de produção
npm run build
npm run start                # sobe em produção na porta 3000 (ou $PORT)
```

O app é 100% Node.js — não depende de nenhum serviço externo além do próprio
arquivo do banco, então roda bem atrás de um Nginx/reverse proxy comum.

## Fluxo de uso

1. O scrum master cria uma conta e adiciona os desenvolvedores do seu time.
2. Cada dia, o scrum master (ou o próprio dev, se compartilhar o acesso) preenche
   o check-in do desenvolvedor com as três perguntas.
3. Na aba "Resumo semanal", o scrum master navega entre semanas e vê o
   consolidado de cada desenvolvedor, com a opção de exportar tudo em PDF.
