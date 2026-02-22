-- Migração: Adicionar colunas de perfil na tabela profiles
-- Execute este SQL no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ixcpxbeeydtbiivpjjir/sql

ALTER TABLE public.profiles
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
  ADD COLUMN IF NOT EXISTS distance integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Habilitar RLS (Row Level Security) se ainda não estiver
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem) e recriar
DROP POLICY IF EXISTS "Perfis públicos visíveis" ON public.profiles;
DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuário insere próprio perfil" ON public.profiles;

-- Policy: qualquer um pode ler todos os perfis
CREATE POLICY "Perfis públicos visíveis" ON public.profiles
  FOR SELECT USING (true);

-- Policy: qualquer um pode atualizar perfis (simplificado para dev)
CREATE POLICY "Usuário atualiza próprio perfil" ON public.profiles
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Policy: qualquer um pode inserir perfis (upsert)
CREATE POLICY "Usuário insere próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (true);
