import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@/db";
import { DOMINIO_EMAIL_INTERNO, PADRAO_USER, TAMANHO_MINIMO_SENHA } from "@/lib/configuracoes";

// === Seção: Configuração do Better Auth ===
// Login com @ (username) + senha. Papéis do plugin admin: "admin" = GOM, "user" = joiner.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: TAMANHO_MINIMO_SENHA },
  plugins: [
    admin(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 15,
      usernameValidator: (valor) => PADRAO_USER.test(valor),
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        // O e-mail é sempre interno (<username>@lucky-cegs.local) e definido aqui no servidor,
        // para ninguém cadastrar um e-mail qualquer chamando a API direto.
        // Cadastros sem username são recusados.
        before: async (usuario) => {
          if (typeof usuario.username !== "string" || !usuario.username) {
            return false;
          }
          return {
            data: {
              ...usuario,
              email: `${usuario.username.toLowerCase()}@${DOMINIO_EMAIL_INTERNO}`,
            },
          };
        },
      },
    },
  },
});
