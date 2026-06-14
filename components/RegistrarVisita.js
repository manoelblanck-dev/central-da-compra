"use client";

import { useEffect } from "react";
import { registrarVisto } from "@/components/VistosRecentemente";

// Componente invisível: ao abrir a página do produto, guarda o id dele
// na lista de "vistos recentemente" (no navegador da pessoa).
export default function RegistrarVisita({ id }) {
  useEffect(() => {
    registrarVisto(id);
  }, [id]);

  return null;
}
