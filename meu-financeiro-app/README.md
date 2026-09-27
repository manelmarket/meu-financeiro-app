# Meu Financeiro

Protótipo funcional mobile-first em React + Vite.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite no navegador.

## Recursos incluídos

- Dashboard com saldo, entradas e gastos
- Cadastro de despesas e receitas
- Persistência no localStorage
- Histórico com busca, filtros e exclusão
- Cadastro de cartões
- Cadastro de metas
- Layout responsivo mobile-first

## Versão 10

- Bancos: botões Transferir, Sacar e Depositar em cada card (não contam como gasto nem receita; a "Carteira" guarda o dinheiro em espécie)
- Novo lançamento: aba Transferência e a caixa "Fale ou escreva o lançamento" (microfone ou texto; sem IA entende frases simples, com a IA do Assistente entende qualquer frase)
- Categorias personalizadas com ícone e cor (menu ⋮ → Categorias, ou "Nova categoria…" direto no seletor)
- Histórico com filtro Transferências e ícones das categorias; Início e Orçamentos com ícone e cor por categoria

## Versão 10.1 — segurança

- Cabeçalhos de segurança no site (public/_headers): política de conteúdo (CSP) que só deixa rodar scripts do próprio site, proteção contra iframes, nosniff, HSTS, permissões (só microfone e câmera)
- Leitura segura de JSON (backup, nuvem, dados do navegador, resposta da IA): chaves perigosas são descartadas
- Limite de tamanho ao descompactar dados vindos da nuvem
- Regras do Firestore com validação de campos e tamanhos (família, convites) — precisa publicar no Firebase
- Vite atualizado (vulnerabilidades do servidor de desenvolvimento)

## Próximos passos

- Relatórios e gráficos
- Orçamento mensal
- Parcelamentos
- Login e banco online
- PWA
- GitHub + Cloudflare Pages
# update deploy
# deploy refresh
