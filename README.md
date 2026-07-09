# Daily

Aplicação para o scrum master acompanhar o dia a dia do time. Cada desenvolvedor
preenche o próprio check-in por um link individual (sem precisar de login),
respondendo três perguntas por dia (customizáveis) — o que está fazendo, o que
está travado e o que pode melhorar — e o scrum master consegue ver um resumo
semanal consolidado, exportável em PDF ou CSV.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) com TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) para o visual
- [Prisma 7](https://www.prisma.io) + SQLite como banco de dados (arquivo local, sem depender de serviço externo)
- Autenticação própria (sessão em cookie assinado com [jose](https://github.com/panva/jose) + senha com `bcryptjs`), sem serviços externos
- [jsPDF](https://github.com/parallax/jsPDF) para gerar o resumo semanal em PDF
- [Nodemailer](https://nodemailer.com) para recuperação de senha e lembretes por e-mail (opcional, via SMTP)

Front-end e back-end vivem no mesmo projeto: as páginas em `src/app` chamam
Server Actions em `src/lib/actions`, que acessam o banco via Prisma.

## Como rodar

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite local (dev.db) a partir do schema
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Na primeira vez, crie uma
conta de scrum master em `/register`. Um "Time principal" é criado automaticamente
na primeira visita ao dashboard — dá pra criar mais times pelo seletor na sidebar.

## Estrutura

- `prisma/schema.prisma` — modelos `ScrumMaster`, `Team`, `Developer`,
  `DailyEntry`, `PasswordResetToken` e `AppSetting` (marca da última semana resetada).
- `src/proxy.ts` — protege as rotas do dashboard, redirecionando para `/login`
  quando não há sessão válida (equivalente ao middleware, renomeado no Next 16).
- `src/lib/auth.ts` — criação/verificação de sessão e hash de senha.
- `src/lib/team.ts` — resolve o time ativo do scrum master (cria um padrão se não existir).
- `src/lib/email.ts` — envio de e-mail via SMTP, com fallback para log no console em dev.
- `src/lib/blocked-streak.ts` — calcula há quantos check-ins seguidos um dev está travado.
- `src/lib/actions/` — Server Actions de autenticação, times, desenvolvedores, check-ins,
  configurações e recuperação de senha.
- `src/lib/weekly-reset.ts` — apaga os check-ins da semana anterior automaticamente.
- `src/app/dashboard` — visão geral do time, página de cada desenvolvedor
  (check-in diário + histórico editável), configurações e o resumo semanal.
- `src/app/checkin/[token]` — página pública (sem login) onde o próprio dev
  preenche o check-in de hoje, usando o link individual gerado para ele.
- `src/app/api/cron/reminder` — endpoint para lembrete diário por e-mail (ver abaixo).

## Funcionalidades

- **Check-in por link individual** — cada dev tem uma URL própria
  (`/checkin/<token>`, sem senha nem login) onde preenche só o check-in dele.
  O scrum master gera/copia esse link na página do desenvolvedor. O scrum
  master continua podendo preencher/editar por ele também, se precisar.
- **Múltiplos times** — um scrum master pode ter vários times; o seletor na
  sidebar troca o time ativo (guardado num cookie).
- **Editar/excluir check-ins passados** — cada item do histórico tem "Editar" e
  "Excluir", reaproveitando o mesmo formulário do check-in de hoje.
- **Humor do dia** — cada check-in tem um seletor de humor (emoji), exibido no
  histórico, no resumo semanal e no PDF.
- **Nota do scrum master** — um comentário livre que o scrum master pode deixar
  em qualquer check-in do histórico (independente das respostas do dev).
- **Alerta de bloqueio recorrente** — se um dev reporta "travado" em 2+
  check-ins seguidos, um aviso aparece no card dele na visão geral.
- **Perguntas customizáveis** — em Configurações, o scrum master pode reescrever
  o texto das três perguntas do check-in diário.
- **Esqueci minha senha** — fluxo completo de recuperação por e-mail (link
  expira em 1h). Sem SMTP configurado, o link é só impresso no log do servidor.
- **Exportar semanal em PDF ou CSV** — botões na tela de resumo semanal.
- **Lembrete diário por e-mail** — endpoint `POST /api/cron/reminder` que, de
  segunda a sexta, avisa cada dev (com e-mail cadastrado) com o próprio link de
  check-in, e avisa o scrum master com o resumo de quem falta preencher (ver
  seção abaixo para agendar).

## Reset semanal automático

O time e os logins nunca são apagados — só o histórico de check-ins
(`DailyEntry`). Toda vez que alguém abre o dashboard, o app compara a semana
atual com a última semana registrada em `AppSetting`; se mudou (nova
segunda-feira), apaga todos os check-ins antigos antes de mostrar a tela.

Não depende de nenhum cron externo nem de o DevOps agendar nada — o reset
acontece sozinho no primeiro acesso após virar a semana. A única coisa que
precisa sobreviver é o arquivo do SQLite entre um acesso e outro (por isso o
aviso de disco persistente na seção de deploy abaixo); reinícios do servidor
no meio da semana não apagam nada, só a virada de segunda-feira apaga.

## Lembrete diário por e-mail (opcional)

Diferente do reset semanal, o lembrete de check-in pendente precisa de um
gatilho externo de verdade (não faz sentido esperar alguém abrir o app para
avisar que ninguém abriu o app). Configure um cron/scheduler do seu provedor
para chamar, todo dia (o endpoint já ignora sábado/domingo sozinho):

```bash
curl -X POST https://seu-dominio.com/api/cron/reminder \
  -H "Authorization: Bearer $CRON_SECRET"
```

Sem `CRON_SECRET` configurado nas variáveis de ambiente, o endpoint sempre
responde 401. Sem SMTP configurado, os e-mails são só impressos no log. Sem
e-mail cadastrado num dev, ele não recebe lembrete (mas o scrum master ainda
recebe o resumo de quem falta).

## Deploy em produção

Variáveis de ambiente necessárias (veja `.env.example` para a lista completa):

- `DATABASE_URL` — caminho do arquivo SQLite. **Importante:** aponte para um
  disco/volume persistente. Se o deploy for em container ou serverless sem
  volume persistente, o banco é perdido a cada novo deploy/restart — nesse
  caso, avise para trocarmos o Prisma para um banco hospedado (ex: Turso,
  Postgres) antes de ir para produção.
- `AUTH_SECRET` — gere um valor novo e secreto só para produção (não reutilize
  o do `.env` de desenvolvimento). Comando sugerido:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `SMTP_*` / `EMAIL_FROM` — opcionais, mas necessários para "esqueci minha
  senha" e o lembrete diário realmente enviarem e-mail (sem isso, só logam no console).
- `CRON_SECRET` — necessário só se for usar o lembrete diário por e-mail.

Comandos de build e start (Node 20+):

```bash
npm install
npx prisma migrate deploy   # aplica as migrations no banco de produção
npm run build
npm run start                # sobe em produção na porta 3000 (ou $PORT)
```

O app é 100% Node.js — não depende de nenhum serviço externo obrigatório além
do próprio arquivo do banco, então roda bem atrás de um Nginx/reverse proxy comum.

## Fluxo de uso

1. O scrum master cria uma conta; um time principal é criado automaticamente
   (dá pra adicionar mais times pelo seletor na sidebar).
2. Adiciona os desenvolvedores do time (com e-mail, se quiser lembrete automático).
3. Copia o link individual de cada dev (na página dele) e envia por WhatsApp,
   Slack, e-mail etc. Cada dev acessa o próprio link todo dia e preenche as
   três perguntas — sem precisar de login.
4. Na aba "Resumo semanal", o scrum master navega entre semanas e vê o
   consolidado de cada desenvolvedor, com opção de exportar em PDF ou CSV.
