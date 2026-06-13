"use client";

// Imagem com fallback para a logo caso o link da foto esteja quebrado.
// Fica num componente "client" porque usa onError (não permitido em
// componentes de servidor, como a página do produto).
export default function ImagemProduto({ src, alt, className }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/logo.png"}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/logo.png";
      }}
      className={className}
    />
  );
}
