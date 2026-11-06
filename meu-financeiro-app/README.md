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

## Versão 1.0.3 — Jarvis conversa

- Nova tela **Jarvis** (Início → "Fale com o Jarvis", ou menu ⋮): fale ou escreva do seu jeito, até com palavras soltas ("mercado 80 ontem nubank", "o uber era 25", "paguei a luz", "quanto gastei de mercado?")
- Usa a IA do Assistente (Gemini gratuito ou Claude) para entender; sem IA, entende lançamentos simples
- Faz: lançar gasto/receita/transferência, corrigir e apagar lançamentos e compras no cartão, pagar fatura e conta fixa, criar/editar contas fixas, metas e orçamentos, ajustar saldo de banco, mudar nome/apelido, tema e abrir telas; responde perguntas sobre os seus números
- Nada é gravado sem confirmação (toque em Confirmar ou diga "sim"); depois dá para Desfazer
- Lê as respostas em voz alta e tem modo "mãos livres" (volta a ouvir sozinho)

## Próximos passos

- Relatórios e gráficos
- Orçamento mensal
- Parcelamentos
- Login e banco online
- PWA
- GitHub + Cloudflare Pages
# update deploy
# deploy refresh
