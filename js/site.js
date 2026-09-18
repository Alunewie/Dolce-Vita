// Estado da tela: categoria atual, sacola e produto aberto nos detalhes.
let categoriaAtual = "Lançamentos";
let sacola = carregarSacola();
let produtoSelecionado = null;
let temporizadorAviso;

const campoBusca = document.getElementById("busca");
const janelaDetalhes = document.getElementById("detalhes");
const janelaSacola = document.getElementById("sacola");

function atualizarPagina(nome, limparBusca = true) {
  const pagina = nome;
  document.querySelectorAll(".pagina").forEach(function (secao) {
    secao.hidden = secao.id !== pagina;
  });
  document.querySelectorAll("nav [data-pagina]").forEach(function (botao) {
    const ativo = botao.dataset.pagina === nome;
    botao.classList.toggle("current", ativo);
    if (ativo) botao.setAttribute("aria-current", "page");
    else botao.removeAttribute("aria-current");
  });
  if (limparBusca) campoBusca.value = "";
  if (pagina === "cardapio") mostrarProdutos();
}

// A troca espera a saída terminar; cliques rápidos sempre usam o último destino.
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
let trocaPagina = 0;
let animacaoPagina = null;

async function mostrarPagina(nome, limparBusca = true) {
  const trocaAtual = ++trocaPagina;
  const destino = document.getElementById(nome);
  const atual = document.querySelector(".pagina:not([hidden])");
  if (!destino) return;
  if (animacaoPagina) animacaoPagina.cancel();

  if (atual === destino || reduzirMovimento.matches || !destino.animate) {
    atualizarPagina(nome, limparBusca);
    return;
  }

  if (atual) {
    animacaoPagina = atual.animate([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-5px)" }
    ], { duration: 160, easing: "ease-in", fill: "forwards" });
    try { await animacaoPagina.finished; } catch { return; }
    if (trocaAtual !== trocaPagina) return;
    animacaoPagina.cancel();
  }

  atualizarPagina(nome, limparBusca);
  animacaoPagina = destino.animate([
    { opacity: 0, transform: "translateY(8px)" },
    { opacity: 1, transform: "translateY(0)" }
  ], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
}

// O dialog só fecha depois da animação, mantendo o foco e o fundo modal.
const fechamentos = new WeakMap();
function abrirJanela(janela) {
  clearTimeout(fechamentos.get(janela));
  fechamentos.delete(janela);
  janela.classList.remove("fechando");
  if (!janela.open) janela.showModal();
}

function fecharJanela(janela) {
  if (!janela.open || fechamentos.has(janela)) return;
  if (reduzirMovimento.matches) {
    janela.close();
    return;
  }
  janela.classList.add("fechando");
  const temporizador = setTimeout(function () {
    janela.close();
    janela.classList.remove("fechando");
    fechamentos.delete(janela);
  }, 240);
  fechamentos.set(janela, temporizador);
}

[janelaDetalhes, janelaSacola].forEach(function (janela) {
  janela.addEventListener("cancel", function (evento) {
    evento.preventDefault();
    fecharJanela(janela);
  });
});

function selecionarCategoria(categoria) {
  const mudou = categoriaAtual !== categoria;
  categoriaAtual = categoria;
  mostrarPagina("cardapio");
  const lista = document.getElementById("lista-produtos");
  if (mudou && !reduzirMovimento.matches && lista.animate) {
    lista.getAnimations().forEach(function (animacao) { animacao.cancel(); });
    lista.animate([{ opacity: .25, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" }],
      { duration: 360, easing: "cubic-bezier(.22,1,.36,1)" });
  }
  document.querySelectorAll("[data-categoria]").forEach(function (botao) {
    botao.setAttribute("aria-pressed", String(botao.dataset.categoria === categoria));
  });
}

function normalizarBusca(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function mostrarProdutos() {
  const busca = normalizarBusca(campoBusca.value);
  const encontrados = produtos.filter(function (produto) {
    if (busca) return normalizarBusca(produto.nome + " " + produto.categoria).includes(busca);
    return produto.categoria === categoriaAtual;
  });

  document.getElementById("titulo-categoria").textContent = busca ? "Resultados da busca" : categoriaAtual;
  document.getElementById("quantidade-produtos").textContent = encontrados.length + " opções para você";
  document.getElementById("busca-vazia").hidden = encontrados.length > 0;
  document.getElementById("lista-produtos").innerHTML = encontrados.map(function (produto) {
    const quantidade = sacola[produto.id] || 0;
    return `
      <article class="product">
        <button class="product-image-button" data-detalhes="${produto.id}" aria-label="Ver detalhes de ${escaparTexto(produto.nome)}">
          <img class="product-art" src="${produto.imagem}" alt="${escaparTexto(produto.nome)} — ${formatarPreco(produto.preco)}" width="279" height="384">
        </button>
        <div class="product-accessible"><h2>${escaparTexto(produto.nome)}</h2><p>${formatarPreco(produto.preco)}</p></div>
        <div class="product-action">
          <button class="details-button" data-detalhes="${produto.id}">Ver detalhes</button>
          <button class="add" data-adicionar="${produto.id}" ${quantidade >= 20 ? "disabled" : ""}>
            + ${quantidade ? "Adicionar mais (" + quantidade + ")" : "Adicionar à sacola"}
          </button>
        </div>
      </article>`;
  }).join("");
  atualizarBotoesProdutos();
}

// Feedback curto de confirmação, sem reconstruir os cartões a cada clique.
const avisosAdicao = new Map();

function atualizarBotoesProdutos() {
  document.querySelectorAll("[data-adicionar]").forEach(function (botao) {
    const id = botao.dataset.adicionar;
    const quantidade = sacola[id] || 0;
    const confirmado = avisosAdicao.has(id);
    botao.disabled = quantidade >= 20;
    botao.classList.toggle("adicionado", confirmado);
    botao.textContent = confirmado ? "Adicionado ✓" :
      quantidade >= 20 ? "Limite de 20 itens" :
      quantidade ? "+ Adicionar mais (" + quantidade + ")" : "+ Adicionar à sacola";
  });
}

function confirmarAdicaoVisual(id) {
  clearTimeout(avisosAdicao.get(id));
  avisosAdicao.set(id, setTimeout(function () {
    avisosAdicao.delete(id);
    atualizarBotoesProdutos();
  }, 1300));
  atualizarBotoesProdutos();
  const contador = document.getElementById("contador-sacola");
  if (!reduzirMovimento.matches && contador.animate) {
    contador.getAnimations().forEach(function (animacao) { animacao.cancel(); });
    contador.animate([{ transform:"scale(1)" }, { transform:"scale(1.2)" },
      { transform:"scale(1)" }], { duration:360, easing:"ease-out" });
  }
  const produto = produtos.find(function (item) { return item.id === id; });
  mostrarAviso(produto.nome + " adicionado à sacola.");
}

function mostrarAviso(texto) {
  const aviso = document.getElementById("aviso-sacola");
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove("visible");
  }, 2800);
}

function obterItensSacola() {
  const itens = [];
  for (const produto of produtos) {
    if (sacola[produto.id]) {
      itens.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        quantidade: sacola[produto.id]
      });
    }
  }
  return itens;
}

function atualizarIndicadores() {
  const itens = obterItensSacola();
  let quantidade = 0;
  for (const item of itens) quantidade += item.quantidade;
  document.getElementById("contador-sacola").textContent = quantidade;
  const botaoCelular = document.getElementById("sacola-celular");
  botaoCelular.hidden = quantidade === 0;
  botaoCelular.textContent = "Ver sacola · " + quantidade + (quantidade === 1 ? " item · " : " itens · ") + formatarPreco(calcularTotal(itens));
  document.querySelector(".bag").setAttribute("aria-label", "Abrir sacola, " + quantidade + (quantidade === 1 ? " item" : " itens"));
}

function alterarQuantidade(id, diferenca) {
  if (!produtos.some(function (produto) { return produto.id === id; })) return;
  const quantidade = Math.max(0, Math.min(20, (sacola[id] || 0) + diferenca));
  if (quantidade === 0) delete sacola[id];
  else sacola[id] = quantidade;
  try {
    salvarDados(chaveSacola, sacola);
  } catch {
    mostrarAviso("A sacola funciona nesta sessão, mas o navegador não permitiu salvá-la.");
  }
  atualizarIndicadores();
  atualizarBotoesProdutos();
  if (janelaSacola.open) mostrarItensSacola();
}

function abrirDetalhes(id) {
  produtoSelecionado = produtos.find(function (produto) { return produto.id === id; });
  if (!produtoSelecionado) return;
  const produto = produtoSelecionado;
  const foto = document.getElementById("foto-produto");
  foto.src = produto.imagem;
  foto.alt = produto.nome;
  document.getElementById("nome-produto").textContent = produto.nome;
  document.getElementById("categoria-produto").textContent = produto.categoria;
  document.getElementById("descricao-produto").textContent = produto.descricao;
  document.getElementById("preco-produto").textContent = formatarPreco(produto.preco);
  const seletor = document.getElementById("quantidade-detalhes");
  seletor.replaceChildren();
  const disponivel = 20 - (sacola[id] || 0);
  for (let numero = 1; numero <= disponivel; numero++) {
    seletor.add(new Option(numero, numero));
  }
  document.getElementById("adicionar-detalhes").disabled = disponivel === 0;
  document.getElementById("adicionar-detalhes").textContent = disponivel ? "Adicionar à sacola" : "Limite de 20 na sacola";
  abrirJanela(janelaDetalhes);
}

// Eventos delegados também atendem aos cartões criados pelo JavaScript.
document.addEventListener("click", function (evento) {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.dataset.pagina) {
    mostrarPagina(botao.dataset.pagina);
    document.getElementById("conteudo").focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }
  if (botao.dataset.categoria) selecionarCategoria(botao.dataset.categoria);
  if (botao.dataset.detalhes) abrirDetalhes(botao.dataset.detalhes);
  if (botao.dataset.adicionar) {
    const id = botao.dataset.adicionar;
    if ((sacola[id] || 0) < 20) {
      alterarQuantidade(id, 1);
      confirmarAdicaoVisual(id);
    }
  }
  if (botao.hasAttribute("data-sacola")) abrirSacola();
  if (botao.dataset.fechar) fecharJanela(document.getElementById(botao.dataset.fechar));
});

campoBusca.addEventListener("input", function () {
  mostrarPagina("cardapio", false);
});

document.getElementById("adicionar-detalhes").addEventListener("click", function () {
  const quantidade = Number(document.getElementById("quantidade-detalhes").value);
  if (!produtoSelecionado || quantidade < 1) return;
  alterarQuantidade(produtoSelecionado.id, quantidade);
  fecharJanela(janelaDetalhes);
  confirmarAdicaoVisual(produtoSelecionado.id);
});

document.getElementById("formulario-contato").addEventListener("submit", function (evento) {
  evento.preventDefault();
  document.getElementById("aviso-contato").textContent = "Simulação concluída! Nenhuma mensagem foi enviada à loja.";
  evento.target.reset();
});

// Montagem inicial da navegação e do cardápio.
document.getElementById("categorias").innerHTML = categorias.map(function (categoria) {
  return `<button data-categoria="${categoria}" aria-pressed="${categoria === categoriaAtual}">${categoria}</button>`;
}).join("");

document.getElementById("atalhos-categorias").innerHTML = ["Lançamentos", "Salgados", "Cookies", "Brownies"].map(function (categoria, indice) {
  return `<button data-categoria="${categoria}"><img src="./images/categoria-${indice}.webp" alt="" loading="lazy"><span>${categoria}</span></button>`;
}).join("");

mostrarProdutos();
atualizarIndicadores();
