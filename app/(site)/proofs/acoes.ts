"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { caixa, parte, proofGom, registro } from "@/db/schema";
import { cloudinary } from "@/lib/cloudinaryServidor";
import { notificar } from "@/lib/notificacoes";
import { obterUsuarioAtual } from "@/lib/sessao";

type Resultado = { ok: true } | { ok: false; erro: string };

const PASTA_PROOFS = "proofs/";

// === Seção: Conferências comuns ===
// Só a GOM, só caixas na casa da GOM e só joiners com itens nessa caixa
async function conferir(caixaId: number, userId: string): Promise<string | null> {
  const usuario = await obterUsuarioAtual();
  if (usuario?.papel !== "admin") return "Só a GOM pode mexer nas proofs.";
  if (!Number.isInteger(caixaId) || !userId) return "Caixa ou joiner inválido.";

  const [encontrado] = await db
    .select({ id: parte.id })
    .from(parte)
    .innerJoin(registro, eq(parte.registroId, registro.id))
    .innerJoin(caixa, eq(registro.caixaId, caixa.id))
    .where(and(eq(caixa.id, caixaId), eq(caixa.situacao, "casa_gom"), eq(parte.userId, userId)))
    .limit(1);
  return encontrado ? null : "Esse joiner não tem itens nessa caixa.";
}

// Apaga a foto antiga do Cloudinary; se falhar, a proof nova continua valendo
async function apagarFoto(fotoId: string) {
  try {
    await cloudinary.uploader.destroy(fotoId);
  } catch {}
}

// === Seção: Salvar (ou trocar) a proof de um joiner ===
export async function salvarProof(caixaId: number, userId: string, fotoId: string): Promise<Resultado> {
  const erro = await conferir(caixaId, userId);
  if (erro) return { ok: false, erro };
  if (!fotoId.startsWith(PASTA_PROOFS)) return { ok: false, erro: "Foto inválida." };

  const [anterior] = await db
    .select({ fotoId: proofGom.fotoId })
    .from(proofGom)
    .where(and(eq(proofGom.caixaId, caixaId), eq(proofGom.userId, userId)));

  await db
    .insert(proofGom)
    .values({ caixaId, userId, fotoId })
    .onConflictDoUpdate({ target: [proofGom.caixaId, proofGom.userId], set: { fotoId, criadaEm: new Date() } });

  if (anterior && anterior.fotoId !== fotoId) await apagarFoto(anterior.fotoId);

  const [dados] = await db.select({ nome: caixa.nome }).from(caixa).where(eq(caixa.id, caixaId));
  await notificar([
    {
      userId,
      tipo: "proof",
      texto: anterior
        ? `A proof da ${dados?.nome ?? "caixa"} foi trocada por uma foto nova.`
        : `A proof da ${dados?.nome ?? "caixa"} chegou. Seus itens estão na casa da GOM.`,
      link: `/casa-da-gom?caixa=${caixaId}`,
    },
  ]);
  refresh();
  return { ok: true };
}

// === Seção: Remover a proof de um joiner ===
export async function removerProof(caixaId: number, userId: string): Promise<Resultado> {
  const erro = await conferir(caixaId, userId);
  if (erro) return { ok: false, erro };

  const [removida] = await db
    .delete(proofGom)
    .where(and(eq(proofGom.caixaId, caixaId), eq(proofGom.userId, userId)))
    .returning({ fotoId: proofGom.fotoId });

  if (removida) await apagarFoto(removida.fotoId);
  refresh();
  return { ok: true };
}
