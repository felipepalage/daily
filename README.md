# Daily

Aplicação para o scrum master acompanhar o dia a dia do time. Cada desenvolvedor
preenche o próprio check-in por um link individual (sem precisar de login),
respondendo três perguntas por dia (customizáveis) — o que está fazendo, o que
está travado e o que pode melhorar — e o scrum master consegue ver um resumo
semanal consolidado, exportável em PDF ou CSV.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com TypeScript — só o front-end
- [Tailwind CSS 4](https://tailwindcss.com) para o visual
- Backend próprio em **.NET (`Daily.Api`)** — toda a persistência e regra de
  negócio ficam nele; este projeto não fala com banco de dados diretamente
- Autenticação via **JWT emitido pela API**, guardado num cookie httpOnly
- [jsPDF](https://github.com/parallax/jsPDF) para gerar o resumo semanal em PDF
- [Nodemailer](https://nodemailer.com) para recuperação de senha e lembretes por e-mail (opcional, via SMTP)

O front-end conversa com o backend .NET via Route Handlers em `src/app/api/*`
(que repassam para a API usando `apiFetch` em `src/lib/api.ts`). A URL da API vem
da variável `DAILY_API_URL`.

## Como rodar

```bash
npm install
npm run dev
```

Precisa do backend `Daily.Api` no ar e da variável `DAILY_API_URL` apontando para
ele (veja `.env.example`).

Acesse [http://localhost:3000](http://localhost:3000). Na primeira vez, crie uma
conta de scrum master em `/register` e depois crie um time pelo seletor na sidebar.

## Estrutura

- `src/middleware.ts` — protege as rotas do dashboard, redirecionando para
  `/login` quando não há cookie de sessão (a validação real do token é na API).
- `src/lib/api.ts` — `apiFetch`, o cliente HTTP que fala com o backend .NET.
- `src/lib/auth.ts` — sessão a partir do JWT da API (`getSession` chama `/auth/me`).
- `src/lib/team.ts` — resolve o time ativo do scrum master.
- `src/lib/email.ts` — envio de e-mail via SMTP, com fallback para log no console em dev.
- `src/lib/blocked-streak.ts` — calcula há quantos check-ins seguidos um dev está travado.
- `src/app/api/` — Route Handlers que repassam as chamadas para o backend .NET
  (autenticação, times, desenvolvedores, check-ins, configurações, recuperação de senha).
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

O time e os logins nunca são apagados — só o histórico de check-ins. A regra do
reset semanal vive no backend .NET: ao abrir o dashboard, se virou a semana (nova
segunda-feira), a API apaga os check-ins antigos antes de devolver os dados.

Não depende de nenhum cron externo nem de o DevOps agendar nada — o reset
acontece sozinho no primeiro acesso após virar a semana.

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

- `DAILY_API_URL` — URL do backend .NET (`Daily.Api`). **Obrigatória** — é onde
  ficam os dados e a autenticação. Sem isso o app não loga nem carrega nada.
- `APP_URL` — URL pública do app. Usada nos links de e-mail; quando começa com
  `https://`, ativa o cookie de sessão seguro automaticamente.
- `SMTP_*` / `EMAIL_FROM` — opcionais, mas necessários para "esqueci minha
  senha" e o lembrete diário realmente enviarem e-mail (sem isso, só logam no console).
- `CRON_SECRET` — necessário só se for usar o lembrete diário por e-mail.

Comandos de build e start (Node 22+):

```bash
npm install
npm run build
npm run start                # sobe em produção na porta 3000 (ou $PORT)
```

O deploy recomendado é via Docker (veja `DEPLOY.md`). O app roda bem atrás de um
Nginx/reverse proxy comum, desde que o backend `Daily.Api` esteja acessível.

## Fluxo de uso

1. O scrum master cria uma conta e adiciona um time pelo seletor na sidebar
   (dá pra ter vários times).
2. Adiciona os desenvolvedores do time (com e-mail, se quiser lembrete automático).
3. Copia o link individual de cada dev (na página dele) e envia por WhatsApp,
   Slack, e-mail etc. Cada dev acessa o próprio link todo dia e preenche as
   três perguntas — sem precisar de login.
4. Na aba "Resumo semanal", o scrum master navega entre semanas e vê o
   consolidado de cada desenvolvedor, com opção de exportar em PDF ou CSV.
