import {
  pgTable, pgEnum, serial, integer, text, numeric, boolean, timestamp, date, unique, index,
} from "drizzle-orm/pg-core";
import { user } from "../auth-schema";

// === Seção: Enums ===
// Situação do item (6 etapas)
export const situacao = pgEnum("situacao", ["esperando", "comprado", "warehouse", "otw", "brasil", "casa_gom"]);
// Situação da caixa (4 etapas)
export const situacaoCaixa = pgEnum("situacao_caixa", ["warehouse", "otw", "brasil", "casa_gom"]);
export const tipoRegistro = pgEnum("tipo_registro", ["individual", "set"]);
export const statusClaim = pgEnum("status_claim", ["pedido", "aceito", "recusado"]);

// === Seção: Caixa ===
export const caixa = pgTable("caixa", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  origem: text("origem"),
  warehouse: text("warehouse"),
  situacao: situacaoCaixa("situacao").notNull().default("warehouse"),
  // Atualizar junto com "situacao"
  situacaoAtualizadaEm: timestamp("situacao_atualizada_em").notNull().defaultNow(),
  abertura: date("abertura"),
  observacao: text("observacao"),
  criadaEm: timestamp("criada_em").notNull().defaultNow(),
});

// === Seção: Lote ===
export const lote = pgTable("lote", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  venda: numeric("venda", { precision: 10, scale: 2 }).notNull(),
});

// === Seção: Registro (item da caixa) ===
export const registro = pgTable("registro", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  loteId: integer("lote_id").references(() => lote.id),
  tipo: tipoRegistro("tipo").notNull().default("individual"),
  situacao: situacao("situacao").notNull().default("esperando"),
  // Atualizar junto com "situacao"
  situacaoAtualizadaEm: timestamp("situacao_atualizada_em").notNull().defaultNow(),
  nome: text("nome").notNull(),
  grupo: text("grupo"),
  // Membro do grupo, para itens sem dono (nas partes fica em parte.membro)
  membro: text("membro"),
  pesoKg: numeric("peso_kg", { precision: 7, scale: 3 }),
  qtdPc: integer("qtd_pc").notNull().default(0),
  qtdPostcard: integer("qtd_postcard").notNull().default(0),
  qtdSmini: integer("qtd_smini").notNull().default(0),
  qtdAlbum: integer("qtd_album").notNull().default(0),
  qtdItens: integer("qtd_itens").notNull().default(0),
  compra: numeric("compra", { precision: 10, scale: 2 }),
  fotoId: text("foto_id"),
  proofWhId: text("proof_wh_id"),
  semDono: boolean("sem_dono").notNull().default(false),
  precoSemDono: numeric("preco_sem_dono", { precision: 10, scale: 2 }),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  // Última vez que a GOM salvou o item (aparece na janela "Editar item")
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// === Seção: Parte (o que cada joiner tem de um registro) ===
export const parte = pgTable("parte", {
  id: serial("id").primaryKey(),
  registroId: integer("registro_id").notNull().references(() => registro.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  // Membro do grupo (ex.: Harua Maki)
  membro: text("membro"),
  venda: numeric("venda", { precision: 10, scale: 2 }),
  // Inter e taxa vazios = "a definir"
  inter: numeric("inter", { precision: 10, scale: 2 }),
  taxa: numeric("taxa", { precision: 10, scale: 2 }),
  vendaPago: boolean("venda_pago").notNull().default(false),
  interPago: boolean("inter_pago").notNull().default(false),
  taxaPago: boolean("taxa_pago").notNull().default(false),
  // Quanto do registro fica com essa pessoa (num set de 7 PCs, uma pode ter 5 e outra 2)
  qtdPc: integer("qtd_pc").notNull().default(0),
  qtdPostcard: integer("qtd_postcard").notNull().default(0),
  qtdSmini: integer("qtd_smini").notNull().default(0),
  qtdAlbum: integer("qtd_album").notNull().default(0),
  qtdItens: integer("qtd_itens").notNull().default(0),
});

// === Seção: Proof da GOM (foto dos itens do joiner) ===
export const proofGom = pgTable("proof_gom", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  userId: text("user_id").notNull().references(() => user.id),
  fotoId: text("foto_id").notNull(),
  criadaEm: timestamp("criada_em").notNull().defaultNow(),
}, (t) => [unique().on(t.caixaId, t.userId)]);

// === Seção: Claim ===
export const claim = pgTable("claim", {
  id: serial("id").primaryKey(),
  registroId: integer("registro_id").notNull().references(() => registro.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  status: statusClaim("status").notNull().default("pedido"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// === Seção: Histórico de etapas do item ===
// Uma linha por mudança de etapa (as telas da GOM gravam junto com registro.situacao)
export const historicoEtapa = pgTable("historico_etapa", {
  id: serial("id").primaryKey(),
  registroId: integer("registro_id").notNull().references(() => registro.id, { onDelete: "cascade" }),
  situacao: situacao("situacao").notNull(),
  data: timestamp("data").notNull().defaultNow(),
});

// === Seção: Notificações ===
// "claim_pedido" vai só para a GOM; os outros tipos vão para os joiners
export const tipoNotificacao = pgEnum("tipo_notificacao", [
  "claim_pedido",
  "claim_aceito",
  "claim_recusado",
  "proof",
  "taxa",
  "frete",
  "etapa_caixa",
  // Item excluído ou joiner tirado de um set
  "item",
  // Aviso escrito pela GOM para os joiners de uma caixa
  "aviso",
]);

export const notificacao = pgTable("notificacao", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  tipo: tipoNotificacao("tipo").notNull(),
  texto: text("texto").notNull(),
  // Página que abre ao clicar
  link: text("link"),
  lida: boolean("lida").notNull().default(false),
  criadaEm: timestamp("criada_em").notNull().defaultNow(),
}, (t) => [index("notificacao_user_idx").on(t.userId, t.criadaEm)]);

// === Seção: Avisos da GOM para os joiners de uma caixa ===
// Um registro por envio (o histórico da janela "Aviso da caixa"); as notificações saem uma por joiner
export const avisoCaixa = pgTable("aviso_caixa", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  // User do joiner; vazio = todos os joiners da caixa
  para: text("para"),
  enviados: integer("enviados").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
}, (t) => [index("aviso_caixa_idx").on(t.caixaId, t.criadoEm)]);
