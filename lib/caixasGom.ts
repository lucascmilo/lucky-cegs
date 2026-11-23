import { asc, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { avisoCaixa, caixa, parte, registro } from "@/db/schema";
import { formatarMomento } from "@/lib/formatacao";
import type { AvisoEnviado, CaixaGom, JoinerOpcao, RegistroGom } from "@/lib/planilhaCaixa";

// Tudo aqui é só para a GOM: quem chama precisa ter conferido o papel de admin.

function paraNumero(valor: string | null) {
  return valor === null ? null : Number(valor);
}

// === Seção: Caixas, da mais antiga para a mais recente ===
export async function obterCaixasGom(): Promise<CaixaGom[]> {
  return db
    .select({
      id: caixa.id,
      nome: caixa.nome,
      situacao: caixa.situacao,
      origem: caixa.origem,
      abertura: caixa.abertura,
      observacao: caixa.observacao,
    })
    .from(caixa)
    .orderBy(asc(caixa.criadaEm), asc(caixa.id));
}

export async function obterCaixaMaisRecente() {
  const [recente] = await db.select({ id: caixa.id }).from(caixa).orderBy(desc(caixa.criadaEm), desc(caixa.id)).limit(1);
  return recente?.id ?? null;
}

// === Seção: Contas dos joiners (para o campo Joiner) ===
export async function obterJoiners(): Promise<JoinerOpcao[]> {
  const contas = await db
    .select({ id: user.id, user: user.username, nome: user.name })
    .from(user)
    .where(or(isNull(user.role), ne(user.role, "admin")))
    .orderBy(asc(user.username));
  return contas.map((conta) => ({ id: conta.id, user: conta.user ?? "", nome: conta.nome.toLowerCase() }));
}

// === Seção: Registros da caixa com todas as partes e valores ===
export async function obterRegistrosGom(caixaId: number): Promise<RegistroGom[]> {
  const registros = await db.select().from(registro).where(eq(registro.caixaId, caixaId)).orderBy(asc(registro.id));
  if (registros.length === 0) return [];

  const partes = await db
    .select({ parte, user: user.username })
    .from(parte)
    .innerJoin(user, eq(parte.userId, user.id))
    .where(
      inArray(
        parte.registroId,
        registros.map((r) => r.id),
      ),
    )
    .orderBy(asc(parte.id));

  return registros.map((r) => ({
    id: r.id,
    tipo: r.tipo,
    nome: r.nome,
    grupo: r.grupo,
    membro: r.membro,
    situacao: r.situacao,
    pesoKg: paraNumero(r.pesoKg),
    compra: paraNumero(r.compra),
    fotoId: r.fotoId,
    proofWhId: r.proofWhId,
    semDono: r.semDono,
    precoSemDono: paraNumero(r.precoSemDono),
    quantidades: { pc: r.qtdPc, postcard: r.qtdPostcard, smini: r.qtdSmini, album: r.qtdAlbum, itens: r.qtdItens },
    atualizadoEm: r.atualizadoEm,
    partes: partes
      .filter(({ parte: p }) => p.registroId === r.id)
      .map(({ parte: p, user: username }) => ({
        id: p.id,
        user: username ?? "",
        membro: p.membro,
        venda: paraNumero(p.venda),
        inter: paraNumero(p.inter),
        taxa: paraNumero(p.taxa),
        vendaPago: p.vendaPago,
        interPago: p.interPago,
        taxaPago: p.taxaPago,
        quantidades: { pc: p.qtdPc, postcard: p.qtdPostcard, smini: p.qtdSmini, album: p.qtdAlbum, itens: p.qtdItens },
      })),
  }));
}

// === Seção: Últimos avisos enviados para os joiners da caixa ===
export async function obterAvisosCaixa(caixaId: number): Promise<AvisoEnviado[]> {
  const avisos = await db
    .select()
    .from(avisoCaixa)
    .where(eq(avisoCaixa.caixaId, caixaId))
    .orderBy(desc(avisoCaixa.criadoEm))
    .limit(5);
  const agora = new Date();
  return avisos.map((aviso) => ({
    id: aviso.id,
    texto: aviso.texto,
    para: aviso.para,
    enviados: aviso.enviados,
    quando: formatarMomento(aviso.criadoEm, agora),
  }));
}
