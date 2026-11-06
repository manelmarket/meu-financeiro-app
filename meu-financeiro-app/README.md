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

## Versão 1.0.5 — atalho do Jarvis

- Atalho "Falar com o Jarvis": segure o ícone do app (app instalado pelo Chrome) ou abra o endereço com `?ouvir=1` — o app abre no Jarvis já ouvindo
- Opção "Abrir o app aqui" na tela do Jarvis: toda vez que abrir o app, ele vem direto para o Jarvis com o microfone ligado

## Versão 1.0.6 — Jarvis do Android com IA

- O link do Jarvis do Android (`?jarvis=frase`) passa pela IA do Assistente quando ela está ligada:
  - com a chave do Jarvis: lançamentos são gravados sozinhos (entendidos pela IA) e perguntas são respondidas no aviso
  - correções, exclusões, pagamentos etc. (ou sem a chave): abre a tela Jarvis, que pede confirmação
  - sem IA, ou se a IA falhar: funciona como antes

## Versão 1.0.7 — estilos e temas novos

- Temas → **Estilo do app**: Clássico (o original), **Banco digital** (saldo dos bancos em destaque no topo do Início, com olho para esconder valores, botões redondos Lançar/Transferir/Pagar/Jarvis e barra de baixo com o + no meio) e **Vidro** (glassmorfismo: cartões de vidro fosco sobre fundo colorido)
- Cor nova: Violeta Elétrico
- **Temas prontos**: Banco digital Violeta, Verde e Azul; Vidro Aurora (escuro) e Vidro Céu (claro)
- Na barra nova: Início, Extrato, +, Cartões e Jarvis (Bancos fica no saldo do Início; Metas no menu ⋮)

## Versão 1.0.8 — animações

- Troca de tela deslizando (para frente vem da direita, voltando vem da esquerda)
- Cartões e listas aparecendo em cascata, barras crescendo, mensagens do Jarvis surgindo, janelas e avisos suaves
- Botões que afundam de leve ao toque; o ícone da aba escolhida dá um pulinho
- Troca de tema com as cores se misturando
- Temas → Animações liga/desliga; com "reduzir movimento" do celular ficam desligadas

## Próximos passos

- Relatórios e gráficos
- Orçamento mensal
- Parcelamentos
- Login e banco online
- PWA
- GitHub + Cloudflare Pages
# update deploy
# deploy refresh
