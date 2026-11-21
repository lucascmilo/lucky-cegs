import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const sessao = await auth.api.getSession({ headers: await headers() });
  if (sessao?.user.role !== "admin") {
    return Response.json({ erro: "Só a GOM pode enviar fotos." }, { status: 403 });
  }

  const { paramsToSign } = await request.json();
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);
  return Response.json({ signature });
}