import { v2 as cloudinary } from "cloudinary";

// === Seção: Cloudinary no servidor ===
// Só para o servidor: usa a chave secreta (assinar envios e apagar fotos)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
