import { createClient } from "@supabase/supabase-js";

// Cliente público — usa a "anon key", que pode ficar visível no navegador.
// Serve para LER produtos (a leitura é liberada pela política do banco).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
