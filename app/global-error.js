"use client";

// Barreira de erro de último recurso: cobre falhas que aconteçam no próprio
// layout raiz (raras). Precisa renderizar seu próprio <html>/<body> e não pode
// depender do CSS do site, por isso usa estilos inline simples.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#16130f",
          textAlign: "center",
          padding: "5rem 1.5rem",
          margin: 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "2.5rem", color: "#FFBC4B" }}>CC</div>
        <h1 style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 600 }}>Algo deu errado</h1>
        <p style={{ marginTop: "0.5rem", color: "#6b6358", fontSize: "0.95rem" }}>
          Tente recarregar a página — geralmente resolve.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            background: "#FFBC4B",
            border: 0,
            padding: "0.7rem 1.6rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
