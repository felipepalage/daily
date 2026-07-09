// Cookies só podem ser "Secure" quando o app é servido via HTTPS de fato —
// caso contrário o navegador aceita o cookie mas descarta ele nas navegações
// seguintes. Ver AUTH_URL no .env.example.
export function isSecureCookieContext() {
  return process.env.APP_URL?.startsWith("https://") ?? false;
}
