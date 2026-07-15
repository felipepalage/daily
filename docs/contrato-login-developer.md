# Contrato — Login de Developer (backend .NET)

Especificação do que o **backend .NET** precisa implementar para o novo fluxo em que
o **developer também loga** (além do gestor/ScrumMaster) e preenche o próprio check-in,
que cai no painel do gestor do time.

O **link público** `/checkin/[token]` (sem login) **continua existindo** em paralelo — não muda.

O frontend já foi implementado contra este contrato. Enquanto o backend não expuser estes
endpoints/claims, as telas de developer ficam prontas mas não funcionam.

---

## 1. Modelo de dados

`Developer` ganha:

- `passwordHash` (nullable) — só preenchido quando o dev tem acesso por login.
- `email` (já existe) — passa a ser **obrigatório e único** para devs com login
  (é a chave do login). Único considerando também os e-mails de `ScrumMaster`.

Opcional (recomendado): `mustChangePassword` (bool) para forçar troca da senha temporária.

---

## 2. Autenticação

### `POST /auth/login`  (anônimo)

Request: `{ "email": string, "password": string }`

O backend checa **ScrumMaster E Developer** (nessa ordem ou por unicidade do e-mail).

Response: `{ "token": string }` — JWT contendo os claims:

| claim    | tipo   | descrição                                         |
|----------|--------|---------------------------------------------------|
| `id`     | string | id do ScrumMaster ou do Developer                 |
| `role`   | string | `"scrumMaster"` ou `"developer"`                  |
| `name`   | string | nome                                              |
| `email`  | string | e-mail                                            |
| `teamId` | string | **só quando `role = developer`**: id do time      |
| `exp`    | number | expiração (padrão)                                |

> O frontend **decodifica** o JWT no middleware (sem verificar assinatura) só para ler
> `role`/`exp` e decidir o redirecionamento. A validação real continua na API a cada request.

### `GET /auth/me`  (Bearer)

Response:
```json
{ "id": "...", "name": "...", "email": "...", "role": "scrumMaster" | "developer", "teamId": "..." }
```
`teamId` só quando `role = developer`.

---

## 3. Gestor cria developer com senha temporária

### `POST /developers`  (Bearer, role = scrumMaster) — **alteração**

Request (igual ao atual): `{ "name": string, "role": string|null, "email": string|null, "teamId": string }`

Comportamento novo: quando vier `email`, o backend **provisiona login**:
gera uma senha temporária, salva o hash (bcrypt) e marca `mustChangePassword = true`.

Response — **retorna a senha temporária em texto UMA única vez**:
```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "temporaryPassword": "abc123XY"   // null se o dev foi criado sem e-mail/login
}
```
O gestor copia essa senha e repassa pro dev. O backend não guarda a senha em texto.

> Hash: use **bcrypt** (`$2a$`/`$2b$`), compatível com o resto do app.

---

## 4. Endpoints com escopo do developer logado  (Bearer, role = developer)

O `developerId` vem **do token**, nunca do body.

### `GET /me`
```json
{
  "id": "...",
  "name": "...",
  "role": "Backend",
  "team": {
    "id": "...",
    "name": "...",
    "scrumMaster": {
      "questionDoingLabel": "...",
      "questionBlockedLabel": "...",
      "questionImproveLabel": "..."
    }
  }
}
```

### `GET /me/entry?date=YYYY-MM-DD`
Retorna o check-in do próprio dev naquela data, ou **404** se não existir.
```json
{
  "id": "...", "developerId": "...", "date": "...",
  "doing": "...", "blocked": "...", "improve": "...",
  "mood": "...|null", "scrumNote": "...|null",
  "featureNumber": "...|null", "blockerNumber": "...|null",
  "epicNumber": "...|null", "taskNumber": "...|null"
}
```

### `POST /me/checkin`
Request:
```json
{
  "doing": string, "blocked": string, "improve": string,
  "mood": string|null,
  "featureNumber": string|null, "blockerNumber": string|null,
  "epicNumber": string|null, "taskNumber": string|null
}
```
Faz upsert do check-in de **hoje** do próprio dev (mesma regra do `/entries`, mas
com o id vindo do token). Response: 200/204.

### `PUT /me/password`
Request: `{ "currentPassword": string, "newPassword": string }`
Troca a senha do próprio dev; limpa `mustChangePassword`. Response: 200/204.

---

## 5. Resumo do que o frontend já faz (contra este contrato)

- Middleware roteia por `role`: dev cai em `/meu-checkin`, gestor em `/dashboard`.
- `/meu-checkin` (logado): busca `/me` + `/me/entry`, mostra o formulário e posta em `/me/checkin`.
- Ao criar dev, o gestor vê a `temporaryPassword` retornada, com botão de copiar.
- Dev troca a senha via `/me/password`.
- `/checkin/[token]` público segue inalterado.
