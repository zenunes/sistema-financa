# Sistema de Finanças Pessoais (Web Responsivo)

Aplicação web em `React + TypeScript + Vite` com backend no `Supabase`.
Foco em uso individual, interface simples e responsiva para funcionar bem no navegador do iPhone e desktop.

## MVP implementado

- Autenticação com e-mail e senha.
- Lançamentos de receitas e despesas.
- Cadastro de categorias.
- Cadastro e acompanhamento de metas.
- Dashboard com saldo, totais e progresso.

## Estrutura de dados no Supabase

Execute o SQL em `supabase/schema.sql` no editor SQL do seu projeto Supabase.

Tabelas:

- `categories`
- `transactions`
- `goals`

O script já inclui:

- criação das tabelas;
- políticas de segurança (RLS) por usuário;
- índices para consultas comuns.
- suporte a recorrências mensais sem duplicação por mês.

## Gestão de melhorias

Use `docs/melhorias-checklist.md` como painel de evolução do projeto.

## Variáveis de ambiente

1. Copie `.env.example` para `.env`.
2. Preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Rodando localmente

```bash
npm install
npm run dev
```

## Próximos passos sugeridos

- Adicionar recorrência de lançamentos.
- Adicionar filtros por período.
- Transformar em PWA para experiência próxima de app no iPhone.
