// === Seção: Envio de fotos para o Cloudinary (navegador) ===
// O servidor assina o envio (só a GOM consegue) e a foto vai direto do navegador para o Cloudinary.
// Devolve o public_id, que é o que o banco guarda.

const TAMANHO_MAXIMO_FOTO = 15 * 1024 * 1024;

// Confere o arquivo antes de enviar; devolve a mensagem de erro, se tiver
export function conferirFoto(arquivo: File) {
  if (!arquivo.type.startsWith("image/")) return "Escolha uma imagem (JPG, PNG ou WEBP).";
  if (arquivo.size > TAMANHO_MAXIMO_FOTO) return "A foto passa de 15 MB. Escolha uma menor.";
  return null;
}

export async function enviarFoto(arquivo: File, pasta: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const assinatura = await fetch("/api/sign-cloudinary-params", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign: { folder: pasta, timestamp } }),
  });
  if (!assinatura.ok) throw new Error("Não foi possível autorizar o envio. Entre de novo e tente outra vez.");
  const { signature } = await assinatura.json();

  const dados = new FormData();
  dados.append("file", arquivo);
  dados.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? "");
  dados.append("timestamp", String(timestamp));
  dados.append("folder", pasta);
  dados.append("signature", signature);

  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: dados },
  );
  if (!resposta.ok) throw new Error("A foto não subiu. Confira a internet e tente de novo.");
  const { public_id } = await resposta.json();
  return public_id as string;
}
