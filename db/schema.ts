import {
  pgTable, pgEnum, serial, integer, text, numeric, boolean, timestamp, date, unique,
} from "drizzle-orm/pg-core";
import { user } from "../auth-schema";

// situação do item (6 etapas)
export const situacao = pgEnum("situacao", ["esperando", "comprado", "warehouse", "otw", "brasil", "casa_gom"]);
// situação da caixa (5 etapas)
export const situacaoCaixa = pgEnum("situacao_caixa", ["warehouse", "otw", "brasil", "esperando_taxa", "casa_gom"]);
export const tipoRegistro = pgEnum("tipo_registro", ["individual", "set"]);
export const statusClaim = pgEnum("status_claim", ["pedido", "aceito", "recusado"]);

// CAIXA
export const caixa = pgTable("caixa", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),                
  origem: text("origem"),                         
  warehouse: text("warehouse"),
  situacao: situacaoCaixa("situacao").notNull().default("warehouse"),
  // quando a caixa mudou de etapa pela última vez (atualizar junto com "situacao")
  situacaoAtualizadaEm: timestamp("situacao_atualizada_em").notNull().defaultNow(),
  abertura: date("abertura"),
  observacao: text("observacao"),
  criadaEm: timestamp("criada_em").notNull().defaultNow(),
});

// LOTE
export const lote = pgTable("lote", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  venda: numeric("venda", { precision: 10, scale: 2 }).notNull(),
});

// REGISTRO
export const registro = pgTable("registro", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  loteId: integer("lote_id").references(() => lote.id),
  tipo: tipoRegistro("tipo").notNull().default("individual"),
  nome: text("nome").notNull(),                   
  grupo: text("grupo"),                           
  pesoKg: numeric("peso_kg", { precision: 7, scale: 3 }),   
  qtdPc: integer("qtd_pc").notNull().default(0),
  qtdPostcard: integer("qtd_postcard").notNull().default(0),
  qtdAlbum: integer("qtd_album").notNull().default(0),
  qtdItens: integer("qtd_itens").notNull().default(0),
  compra: numeric("compra", { precision: 10, scale: 2 }),    
  fotoId: text("foto_id"),                        
  proofWhId: text("proof_wh_id"),                 
  semDono: boolean("sem_dono").notNull().default(false),
  precoSemDono: numeric("preco_sem_dono", { precision: 10, scale: 2 }),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// PARTE
export const parte = pgTable("parte", {
  id: serial("id").primaryKey(),
  registroId: integer("registro_id").notNull().references(() => registro.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  membro: text("membro"),                         // ex.: Harua Maki
  venda: numeric("venda", { precision: 10, scale: 2 }),     // vazio quando é lote
  inter: numeric("inter", { precision: 10, scale: 2 }),     // vazio = "a definir"
  taxa: numeric("taxa", { precision: 10, scale: 2 }),       // vazio = "a definir"
  vendaPago: boolean("venda_pago").notNull().default(false),
  interPago: boolean("inter_pago").notNull().default(false),
  taxaPago: boolean("taxa_pago").notNull().default(false),
});

// PROOF DA GOM
export const proofGom = pgTable("proof_gom", {
  id: serial("id").primaryKey(),
  caixaId: integer("caixa_id").notNull().references(() => caixa.id),
  userId: text("user_id").notNull().references(() => user.id),
  fotoId: text("foto_id").notNull(),
  criadaEm: timestamp("criada_em").notNull().defaultNow(),
}, (t) => [unique().on(t.caixaId, t.userId)]);

// CLAIM
export const claim = pgTable("claim", {
  id: serial("id").primaryKey(),
  registroId: integer("registro_id").notNull().references(() => registro.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  status: statusClaim("status").notNull().default("pedido"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});