import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinaryServidor";

// === Seção: Assinatura dos envios ao Cloudinary ===
// Só a GOM pode enviar fotos.
export async function POST(request: Request) {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (sessao?.user.role !== "admin") {
    return Response.json({ erro: "Só a GOM pode enviar fotos." }, { status: 403 });
  }

  const { paramsToSign } = await request.json();
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);
  return Response.json({ signature });
}
