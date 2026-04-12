# Melhorias do Projeto e Checklist

Documento de acompanhamento das evoluções do sistema de finanças pessoais.

## 1) Melhorias já entregues

- [x] Base web responsiva em React + TypeScript.
- [x] Integração com Supabase (auth e banco).
- [x] Autenticação por e-mail e senha.
- [x] CRUD de lançamentos (receitas e despesas).
- [x] CRUD de categorias.
- [x] CRUD de metas com barra de progresso.
- [x] Estrutura SQL com RLS por usuário.
- [x] Título da aba atualizado para "Minhas Finanças".
- [x] Redesign parcial inicial com paleta, cards e badges visuais.
- [x] Módulo de recorrências com:
  - [x] Cadastro de despesas/receitas recorrentes.
  - [x] Pausar/ativar recorrência.
  - [x] Exclusão de recorrência.
  - [x] Geração mensal de lançamentos sem duplicar o mesmo mês.

## 2) Backlog priorizado (próximas melhorias)

### Relatórios e gráficos

- [ ] Gráfico de pizza por categoria (mês atual).
- [ ] Gráfico de barras por mês (receitas x despesas).
- [ ] Resumo comparativo do mês atual vs mês anterior.
- [ ] Filtro de período (mês, trimestre, ano).

### Produtividade no lançamento

- [ ] Filtro e busca por descrição.
- [ ] Ordenação de lançamentos por data/valor.
- [ ] Duplicar lançamento com um clique.
- [ ] Atalhos de categoria mais usada.

### Melhorias de recorrência

- [ ] Recorrência semanal (além da mensal).
- [ ] Lembrete de contas próximas do vencimento.
- [ ] Opção de geração automática ao abrir o app no mês.
- [ ] Edição em lote de recorrências.

### UX e visual

- [ ] Refinar microinterações (hover, foco, loading).
- [ ] Ícones por categoria.
- [ ] Modo escuro.
- [ ] Melhorias de acessibilidade (contraste e navegação por teclado).

### Plataforma e produto

- [ ] PWA para iPhone (instalar na tela inicial).
- [ ] Exportação CSV dos lançamentos.
- [ ] Backup/restauração simplificada.
- [ ] Página de configurações (preferências do usuário).

## 3) Checklist operacional por entrega

Use esta lista a cada nova iteração:

- [ ] Confirmar escopo da iteração (1 melhoria por vez).
- [ ] Validar impacto no banco (schema + RLS).
- [ ] Implementar frontend modular.
- [ ] Revisar segurança (sem segredos no código).
- [ ] Atualizar `.env.example` quando necessário.
- [ ] Atualizar este checklist com status real.
- [ ] Rodar `npm run build`.
- [ ] Verificar diagnósticos do editor (TypeScript/ESLint).
- [ ] Validar manualmente no fluxo principal.
