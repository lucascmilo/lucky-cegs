// === Seção: Download de fotos do Cloudinary ===
// "fl_attachment" faz o navegador baixar a foto em vez de abrir
export function enderecoDownload(publicId: string) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`;
}
