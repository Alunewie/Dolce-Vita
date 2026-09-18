# Dolce Vita Online

Projeto de extensão desenvolvido no Bootcamp de **Desenvolvimento Web Responsivo** (UNISAGRADO), em parceria com a **Confeitaria Dolce Vita** (Bauru-SP).

>  Status atual: **Site Desenvolvido e Pronto**

##  Descrição do projeto

A Confeitaria Dolce Vita não possui um canal digital centralizado para apresentar seus produtos, dependendo de redes sociais, aplicativos de delivery e mensagens diretas para atender clientes. Isso dificulta a busca por informações e gera um atendimento pouco organizado.

Este projeto propõe o desenvolvimento de um **cardápio digital em formato de site web**, responsivo, para que os clientes da Dolce Vita possam consultar produtos e informações de forma simples, rápida e acessível em qualquer dispositivo (computador, tablet ou smartphone).

**Cliente:** Confeitaria Dolce Vita
**Responsável pela instituição:** Dawis de Almeida Gimenes
**Período do projeto:** 06/08/2026 a 24/09/2026
**Disciplina:** Desenvolvimento Web Responsivo — Prof. Vinicius Santos Andrade

##  Objetivo

Desenvolver um site de cardápio digital que centralize produtos, preços e informações da confeitaria, oferecendo uma experiência de navegação intuitiva, moderna e responsiva para o cliente final.


## Arquivos e seus locais

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura, textos, formulários e janelas |
| `css/estilo.css` | Cores, fontes, tamanhos, animações e ajustes para celular |
| `js/produtos.js` | Nomes, categorias, preços, imagens e descrições |
| `js/armazenamento.js` | Leitura e gravação local, preços e funções auxiliares |
| `js/site.js` | Navegação, busca, cartões, detalhes e quantidade na sacola |
| `js/pedidos.js` | Dados do cliente, revisão, confirmação e consulta |
| `images` | Imagens locais da doceria |
| `fonts` | Fontes locais |

**Atenção:** as imagens recebidas já contêm textos e preços desenhados. Ao trocar o preço ou nome no cadastro, também será necessário atualizar a imagem para manter o cartão consistente. Esse detalhe vem das referências visuais do projeto.

## Como funciona

1. A lista de produtos fica em um array de objetos.
2. A busca filtra esse array por nome ou categoria, ignorando acentos.
3. A sacola é um objeto que associa o identificador do produto à quantidade.
4. Os botões alteram as quantidades e atualizam os elementos da página.
5. O formulário usa validações do HTML e confere telefone/endereço no JavaScript.
6. A revisão apresenta os itens e o total antes da confirmação.
7. Ao confirmar, um código é gerado e a simulação é salva no `localStorage`.
8. A consulta procura o código e o telefone no armazenamento do mesmo navegador.

Os textos digitados nos formulários são exibidos com `textContent`. Os textos colocados em modelos HTML passam por `escaparTexto`, para não serem interpretados como marcação.
Os elementos `dialog` do HTML substituem bibliotecas de janelas: fornecem fechamento por Esc e gerenciamento de foco.


## Limitações

Use dados fictícios. Os pedidos ficam somente no navegador e neste endereço do site. Nome, endereço e observações são usados na revisão, mas não são gravados no histórico. O telefone fictício é salvo para a consulta.
O status permanece como Recebido. Não há preparo, entrega, banco de dados remoto, autenticação ou pagamento. Limpar os dados do site apaga o histórico; navegação privada pode apagá-lo ao encerrar a sessão.

## Tecnologias, referências e autoria

- HTML: estrutura semântica, formulários e dialog.
- CSS: Flexbox, Grid, variáveis, media queries e animações.
- JavaScript: eventos, manipulação do DOM, arrays e objetos.
- APIs nativas do navegador: localStorage, crypto.randomUUID e Clipboard.
- Fontes: DM Sans e Fraunces, distribuídas localmente com o projeto.
- Referência visual: imagens e design da doceria fornecidos para o trabalho e pela equipe de design.
- **VS Code** — ambiente de desenvolvimento
- **Git & GitHub** — controle de versão
- **GitHub Pages** — hospedagem do site

Documentação para estudo:

- HTML: https://developer.mozilla.org/pt-BR/docs/Web/HTML
- CSS: https://developer.mozilla.org/pt-BR/docs/Web/CSS
- JavaScript: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript
- DOM: https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model
- localStorage: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage
- dialog: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dialog
- UUID: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
- Clipboard: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site


## Acabamento visual e interações

O site continua em HTML, CSS e JavaScript com arquivos locais e sem etapa de compilação.
A página inicial apresenta a confeitaria e permite entrar no cardápio por categoria.

- `js/abertura.js`: controla o tempo da abertura e permite pular com clique ou tecla.
- `js/site.js`: também apresenta a confirmação temporária no botão e o pulso do contador.
- `js/pedidos.js`: anima a passagem entre as etapas da simulação.
- `css/estilo.css`: estilos da página inicial, cartões, formulário, mascote e versões para celular.

Os efeitos respeitam a preferência de movimento reduzido do sistema.

##  Integrantes

| Nome | Curso | Função no projeto |
|---|---|---|
| Ana Laura Trindade Sanches | Ciência da Computação | Documentação |
| Luciana Macedo Eugenio da Silva | Análise e Desenvolvimento de Sistemas | Programação |
| Marcelo Henrique Rocha | Ciência da Computação | Documentação / Apresentação |
| Maria Cláudia Francisco Dias | Análise e Desenvolvimento de Sistemas | Documentação / Apresentação |
| Mayra Raquel Aguiar Giacoboni | Análise e Desenvolvimento de Sistemas | Design |
| Natan Costa Soares | Análise e Desenvolvimento de Sistemas | Documentação / Design |
| Sofia Tanuma Grotti | Análise e Desenvolvimento de Sistemas | Design |
| Thiago da Silva Gimenes | Ciência da Computação | Documentação / Programação |
| Victor Hugo Pierini Pereira | Ciência da Computação | Programação |
| William Carlos Guedes | Análise e Desenvolvimento de Sistemas | Documentação |

**Orientador:** Prof. Vinicius Santos Andrade
