const https = require('https');

const SUPABASE_URL = 'ixcpxbeeydtbiivpjjir.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3B4YmVleWR0YmlpdnBqamlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDY1OTksImV4cCI6MjA4NzI4MjU5OX0.LikZqgteC1AYM3KscFaKOIwYasV0T8k5-yKJTc1WLFw';

// SQL para adicionar as colunas que faltam
const sql = `
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS gender text,
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
  ADD COLUMN IF NOT EXISTS distance integer DEFAULT 10;
`;

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: SUPABASE_URL,
            path,
            method,
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
            }
        };
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function main() {
    console.log('Verificando colunas existentes...');

    // Verificar colunas atuais
    const check = await makeRequest('GET', '/rest/v1/profiles?limit=1&select=*');
    console.log('Status:', check.status);
    if (check.status === 200) {
        const rows = JSON.parse(check.body);
        if (rows[0]) {
            console.log('Colunas existentes:', Object.keys(rows[0]).join(', '));
        } else {
            console.log('Tabela vazia, mas existe.');
        }
    } else {
        console.log('Resposta:', check.body);
    }

    // Executar migração via RPC
    console.log('\nExecutando ALTER TABLE via /rpc/exec_sql...');
    const migrate = await makeRequest('POST', '/rest/v1/rpc/exec_sql', { sql });
    console.log('Status migração:', migrate.status);
    console.log('Resposta migração:', migrate.body);
}

main().catch(console.error);
