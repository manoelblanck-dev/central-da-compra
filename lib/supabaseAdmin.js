import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN — usa a "service_role key", que é SECRETA.
// Ela ignora as travas de segurança do banco, então só pode ser usada
// no servidor (rotas /api). NUNCA importe este arquivo num componente
// que roda no navegador ("use client").
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
