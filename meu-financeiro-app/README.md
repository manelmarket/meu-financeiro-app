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

## Versão 1.0.9 — microfone grande no Jarvis

- Tela do Jarvis com um botão grande e redondo de áudio no centro ("Toque para falar"); ouvindo, fica vermelho com ondas pulsando
- O campo de texto continua logo abaixo, para escrever quando preferir

## Versão 1.0.10 — telas no jeito da prévia

Nos estilos Banco digital e Vidro:
- **Novo lançamento**: valor grande no centro com teclado numérico, abas Gasto/Receita/Transferência no topo, categorias em botões (com "+ Nova"), botão do Jarvis no topo e a frase falada/escrita num toque
- **Cartões**: o cartão desenhado (com as cores do banco quando reconhece o nome), limite usado com barra, botões grandes Pagar fatura / Próximas faturas / Nova compra e a lista "Nesta fatura"
- **Extrato**: busca, filtros em botões, entradas e saídas do mês e lançamentos agrupados por dia
- O estilo Clássico continua como antes

## Versão 1.0.11 — mês em detalhe

- No Início, os cards **Saldo do mês**, **Receita** e **Despesas** abrem a tela "mês em detalhe", já na aba do card tocado e no mês escolhido
- Receitas: total e todas as receitas do mês
- Despesas: total, de onde vieram (lançamentos, faturas de cartão, contas fixas), por categoria e a lista de cada parte (fatura abre o cartão; conta abre Contas fixas)
- Saldo: a conta receitas − despesas e a comparação com o mês anterior
- Saldo negativo legível (vermelho) nos estilos Banco digital e Vidro

## Versão 1.0.12 — importar planilha

- Menu ⋮ → **Importar planilha**: envie um Excel (.xlsx) ou um extrato .csv
- O app acha a aba com os lançamentos, pula títulos e linhas de total, e entende as colunas pelo nome (data, descrição, valor, entrada/saída, tipo, categoria, forma de pagamento, cartão, parcelas, banco); com a IA do Assistente, a IA ajuda a entender colunas e categorias
- Separa gastos, receitas e compras no cartão (com parcelas, no cartão de mesmo nome); categorias da planilha vão para a parecida do app ou viram categorias novas
- Marca linhas repetidas (que já existem no app) e com problema; você confere, desmarca o que não quer e importa; dá para desfazer
- Por padrão não mexe no saldo dos bancos (para importar histórico)
- Leitura de .xlsx com a biblioteca read-excel-file (MIT); .xls antigo: salvar como .xlsx

## Versão 1.1.0 — pacote de melhorias

- **Editar lançamentos**: no Extrato, toque no lançamento para mudar descrição, valor, data, categoria, observação e foto do comprovante
- **Observação e comprovante** em qualquer lançamento (também no Novo lançamento)
- **Receitas fixas** (salário etc.): entram sozinhas no dia ou com "Recebi / Não veio" no Início
- **Previsão**: "Sobram R$ X até o fim do mês" no Início e aba Previsão no mês em detalhe
- **Assinaturas**: gastos que se repetem todo mês, com custo por ano
- **Resumo da semana** no Início (com "ouvir") e aviso de gasto fora do padrão no sino
- **Esconder valores** no app todo (olho do Início e menu ⋮)
- **Relatório do mês** em Excel (.xlsx) e PDF (impressão)
- App mais rápido para abrir (telas carregadas sob demanda)
- **Testes automáticos** (`npm test`, Vitest) rodando no GitHub a cada pedido de junção

## Versão 1.1.1 — período no Histórico

- Histórico/Extrato com filtro de período: Hoje, Ontem, Esta semana (de segunda até hoje), Este mês (padrão), Outro mês (com seletor de mês) e Tudo
- Os totais de entradas e gastos acompanham o período escolhido

## Versão 1.1.2 — revisão geral

- Histórico/Extrato mostra também as compras no cartão (tocar abre o cartão)
- Proteção contra contar a fatura duas vezes: aviso no Novo lançamento; na importação, pagamento de fatura e conta fixa vêm desmarcados; o Jarvis trata "paguei a fatura" como pagamento
- Importação aceita data no formato mês/dia
- Contraste melhor em todo o app (padrão de acessibilidade WCAG AA) e textos longos não saem da tela
- Bibliotecas atualizadas: 0 alertas de segurança no npm audit

## Versão 1.2.0 — acabamento profissional

- Janelas de confirmação e avisos com o visual do app (no lugar das caixas do navegador), com Desfazer ao excluir e vibração curta
- Ícones de traço no lugar de emojis; nomes padronizados (Extrato em todo lugar)
- Fonte Inter embutida, com números alinhados
- Esqueleto pulsando no carregamento; telas vazias com explicação e botão; boas-vindas em 3 passos para conta nova
- Extrato: arraste o lançamento para o lado para Editar ou Excluir
- Números curtos em gráficos e no topo ("R$ 1,2 mil"; o exato ao tocar)
- Ícone novo e tela de abertura na cor do tema

## Versão 1.2.1 — revisão

- Botões vermelhos (Excluir) com contraste certo no modo escuro
- Boas-vindas e lançamento automático das receitas fixas esperam a nuvem responder (num celular novo, os dados chegam alguns segundos depois de entrar)
- Avisos e janelas não saem na impressão do relatório

## Próximos passos

- Relatórios e gráficos
- Orçamento mensal
- Parcelamentos
- Login e banco online
- PWA
- GitHub + Cloudflare Pages
# update deploy
# deploy refresh
