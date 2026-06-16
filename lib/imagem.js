"use client";

// Reduz a imagem no próprio navegador (até 1200px no maior lado, qualidade 85%)
// e envia pro /api/upload. Devolve a URL hospedada. Lança erro com mensagem
// amigável se algo falhar. Usada pelo formulário individual e pelo de lote.
export async function reduzirEEnviarImagem(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPG, PNG, WEBP...).");
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não consegui ler esse arquivo."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Imagem inválida. Tente outra (JPG ou PNG)."));
    i.src = dataUrl;
  });

  const MAX = 1200; // maior lado da imagem, em pixels
  let { width, height } = img;
  if (width > MAX || height > MAX) {
    if (width >= height) {
      height = Math.round((height * MAX) / width);
      width = MAX;
    } else {
      width = Math.round((width * MAX) / height);
      height = MAX;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);

  const ehPng = file.type === "image/png";
  const tipoSaida = ehPng ? "image/png" : "image/jpeg";
  const ext = ehPng ? "png" : "jpg";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, tipoSaida, 0.85));
  if (!blob) throw new Error("Não consegui processar essa imagem. Tente outra.");

  const fd = new FormData();
  fd.append("file", blob, `produto.${ext}`);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data.erro || `Falha ao enviar a imagem (erro ${res.status}).`);
  return data.url;
}
