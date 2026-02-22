// Script para executar migração via Supabase Management API
// Requer SUPABASE_ACCESS_TOKEN (Personal Access Token da sua conta)
// Gere em: https://supabase.com/dashboard/account/tokens

const https = require('https');

const PROJECT_REF = 'ixcpxbeeydtbiivpjjir';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

if (!ACCESS_TOKEN) {
    console.error('ERRO: Defina a variavel de ambiente SUPABASE_ACCESS_TOKEN');
    console.error('Gere seu token em: https://supabase.com/dashboard/account/tokens');
    console.error('Exemplo: $env:SUPABASE_ACCESS_TOKEN="sbp_xxxx..." ; node scripts/run-migration-mgmt.js');
    process.exit(1);
}

const sql = `
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS orientation text,
  ADD COLUMN IF NOT EXISTS hide_age boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_city boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sign text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS family text,
  ADD COLUMN IF NOT EXISTS communication text,
  ADD COLUMN IF NOT EXISTS love_language text,
  ADD COLUMN IF NOT EXISTS musical_style text,
  ADD COLUMN IF NOT EXISTS pets text,
  ADD COLUMN IF NOT EXISTS drink text,
  ADD COLUMN IF NOT EXISTS smoke text,
  ADD COLUMN IF NOT EXISTS exercise text,
  ADD COLUMN IF NOT EXISTS social text,
  ADD COLUMN IF NOT EXISTS interests text,
  ADD COLUMN IF NOT EXISTS intention text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
`;

const body = JSON.stringify({ query: sql });

const req = https.request({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Resposta:', d.substring(0, 500));
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('\n✓ Migração executada com sucesso!');
        } else {
            console.log('\n✗ Falha na migração. Verifique o SQL Editor do Dashboard manualmente.');
        }
    });
});
req.on('error', e => console.error(e.message));
req.write(body);
req.end();
