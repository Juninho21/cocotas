const https = require('https');
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3B4YmVleWR0YmlpdnBqamlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDY1OTksImV4cCI6MjA4NzI4MjU5OX0.LikZqgteC1AYM3KscFaKOIwYasV0T8k5-yKJTc1WLFw';

// Colunas a adicionar uma por uma (ADD COLUMN IF NOT EXISTS)
const alterStatements = [
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS orientation text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hide_age boolean DEFAULT false;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hide_city boolean DEFAULT false;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sign text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS communication text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS love_language text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS musical_style text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pets text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS drink text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smoke text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exercise text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intention text;",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();",
];

function post(path, bodyObj) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(bodyObj);
        const req = https.request({
            hostname: 'ixcpxbeeydtbiivpjjir.supabase.co',
            path,
            method: 'POST',
            headers: {
                'apikey': ANON,
                'Authorization': 'Bearer ' + ANON,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('Tentando adicionar colunas via RPC...\n');

    for (const sql of alterStatements) {
        const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || '?';
        try {
            // Tenta via RPC exec_sql
            const r = await post('/rest/v1/rpc/exec_sql', { sql });
            if (r.status === 200 || r.status === 204) {
                console.log(`  ✓ ${col}`);
            } else {
                console.log(`  ✗ ${col} (status ${r.status}): ${r.body.substring(0, 150)}`);
            }
        } catch (e) {
            console.log(`  ✗ ${col}: ${e.message}`);
        }
    }

    console.log('\nVerificando colunas atuais...');
    const check = await new Promise((resolve) => {
        const req = https.request({
            hostname: 'ixcpxbeeydtbiivpjjir.supabase.co',
            path: '/rest/v1/profiles?limit=1&select=*',
            headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        req.end();
    });

    try {
        const rows = JSON.parse(check.body);
        if (rows[0]) {
            const cols = Object.keys(rows[0]);
            console.log('Colunas existentes:', cols.join(', '));
        }
    } catch (e) {
        console.log('Resposta:', check.body.substring(0, 300));
    }
}

main().catch(console.error);
