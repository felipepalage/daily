# Como colocar o Daily no ar para o time

O time inteiro acessa o Daily pelo navegador, por um link tipo
`http://IP-DO-SERVIDOR:3000`. Ninguém precisa instalar nada — só a máquina
que vai **hospedar** o app precisa de setup. Esta máquina precisa:

- Estar **ligada** (idealmente um servidor/PC que fica sempre ligado);
- Estar na **mesma rede/VPN** que alcança o servidor do banco de dados;
- Ter o **Docker** instalado ([Docker Desktop no Windows](https://www.docker.com/products/docker-desktop/)).

---

## Passo a passo (na máquina que vai hospedar)

### 1. Baixar o código

```bash
git clone https://github.com/felipepalage/daily.git
cd daily
```

### 2. Criar o arquivo `.env`

Copie o exemplo e preencha:

```bash
cp .env.example .env
```

Abra o `.env` e ajuste:

```env
# Conexão com o banco (peça os dados reais para quem administra o banco).
# HOST, USUARIO e SENHA são os mesmos que já usamos no ambiente atual.
DATABASE_URL="sqlserver://HOST:1433;database=NOME_DO_BANCO;user=USUARIO;password=SENHA;encrypt=true;trustServerCertificate=true"

# Chave de sessão — gere UMA vez e não mude mais (senão desloga todo mundo).
# Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="cole-uma-chave-aleatoria-aqui"

# URL pública do app na rede (troque pelo IP da máquina que hospeda).
# Usada nos links de e-mail (check-in e recuperação de senha).
APP_URL="http://IP-DO-SERVIDOR:3000"
```

> ⚠️ O `.env` guarda a senha do banco, por isso **não vai para o GitHub**.
> Ele fica só nesta máquina.

### 3. Subir o app

```bash
docker compose up -d --build
```

Pronto. O app está rodando. Para ver os logs:

```bash
docker compose logs -f
```

### 4. Descobrir o IP e compartilhar com o time

Descubra o IP da máquina na rede (no Windows: `ipconfig`, procure o
"Endereço IPv4", algo como `10.20.x.x`). O time acessa em:

```
http://IP-DO-SERVIDOR:3000
```

> Se o Firewall do Windows perguntar, **permita** o Docker/porta 3000 na rede.

---

## Atualizar o app depois de mudanças no código

```bash
git pull
docker compose up -d --build
```

## Parar o app

```bash
docker compose down
```

---

## Alternativa sem Docker (só com Node.js)

Se preferir não usar Docker, dá para rodar direto com o Node na máquina que
vai hospedar. Precisa do [Node.js 22+](https://nodejs.org) instalado.

```bash
git clone https://github.com/felipepalage/daily.git
cd daily
# crie o .env igual ao passo 2 acima
npm ci
npm run build
npm start
```

O app sobe em `http://IP-DO-SERVIDOR:3000`. A diferença é que, sem Docker,
o app não reinicia sozinho se a máquina reiniciar — você teria que rodar
`npm start` de novo (ou usar algo como o PM2 para manter no ar).

---

## Observações

- **Banco de dados:** as tabelas do Daily ficam isoladas no schema `daily`
  do banco e já foram criadas. Não é preciso rodar nada de migração para
  subir. Só se o schema mudar no futuro é que rodamos as migrations de novo.
- **Sem HTTPS:** na rede interna funciona por HTTP normalmente. Se um dia
  colocar um domínio com HTTPS, mude o `APP_URL` para começar com
  `https://` — isso ativa o cookie de sessão seguro automaticamente.
- **E-mails (lembretes / recuperar senha):** só funcionam se preencher as
  variáveis `SMTP_*` e `EMAIL_FROM` no `.env`. Sem elas, o app funciona
  normal, mas os e-mails só aparecem no log.
