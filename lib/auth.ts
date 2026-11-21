import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@/db";
import { DOMINIO_EMAIL_INTERNO, PADRAO_USER, TAMANHO_MINIMO_SENHA, TAMANHO_USER } from "@/lib/configuracoes";

// === Seção: Configuração do Better Auth ===
// Login com @ (username) + senha. Papéis do plugin admin: "admin" = GOM, "user" = joiner.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: TAMANHO_MINIMO_SENHA },
  plugins: [
    admin(),
    username({
      minUsernameLength: TAMANHO_USER.minimo,
      maxUsernameLength: TAMANHO_USER.maximo,
      usernameValidator: (valor) => PADRAO_USER.test(valor),
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        // E-mail sempre interno, definido no servidor (ninguém escolhe e-mail pela API).
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
