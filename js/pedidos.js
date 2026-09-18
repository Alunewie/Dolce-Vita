// Fluxo: sacola → dados do cliente → revisão → confirmação.
let dadosCliente = null;
let ultimoPedido = null;
let confirmando = false;
const formularioPedido = document.getElementById("formulario-pedido");

function mostrarEtapa(etapa) {
  for (const nome of ["itens", "dados", "revisao", "sucesso"]) {
    document.getElementById("etapa-" + nome).hidden = nome !== etapa;
  }
  document.getElementById("etapas").hidden = etapa === "sucesso";
  document.querySelectorAll("[data-etapa]").forEach(function (item) {
    if (item.dataset.etapa === etapa) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  const painel = document.getElementById("etapa-" + etapa);
  if (janelaSacola.open && !reduzirMovimento.matches && painel.animate) {
    painel.getAnimations().forEach(function (animacao) { animacao.cancel(); });
    painel.animate([{ opacity:0, transform:"translateY(6px)" },
      { opacity:1, transform:"translateY(0)" }],
      { duration:300, easing:"ease-out" });
  }
  janelaSacola.scrollTop = 0;
  const primeiroControle = document.querySelector("#etapa-" + etapa + " button:not(:disabled)");
  if (janelaSacola.open && primeiroControle) primeiroControle.focus({ preventScroll: true });
}

function abrirSacola() {
  mostrarItensSacola();
  mostrarEtapa("itens");
  abrirJanela(janelaSacola);
}

function mostrarItensSacola() {
  const itens = obterItensSacola();
  const lista = document.getElementById("itens-sacola");
  lista.innerHTML = itens.map(function (item) {
    return `
      <div class="cart-row">
        <img src="${item.imagem}" alt="${escaparTexto(item.nome)}">
        <div>
          <strong>${escaparTexto(item.nome)}</strong>
          <span>${formatarPreco(item.preco)} cada</span>
          <div class="quantity">
            <button data-quantidade="${item.id}" data-diferenca="-1" aria-label="Diminuir ${escaparTexto(item.nome)}">−</button>
            <output>${item.quantidade}</output>
            <button data-quantidade="${item.id}" data-diferenca="1" aria-label="Aumentar ${escaparTexto(item.nome)}" ${item.quantidade >= 20 ? "disabled" : ""}>+</button>
            <button data-remover="${item.id}" aria-label="Remover ${escaparTexto(item.nome)}">×</button>
          </div>
        </div>
        <b>${formatarPreco(item.preco * item.quantidade)}</b>
      </div>`;
  }).join("");
  if (itens.length === 0) lista.innerHTML = '<div class="empty"><img class="mascot-empty" src="./images/coelhinho-cookie.png?v=5" width="120" height="120" alt=""><h2>Seu doce momento começa aqui.</h2><p>A sacola está vazia. Escolha um favorito no cardápio.</p></div>';
  document.getElementById("total-sacola").textContent = formatarPreco(calcularTotal(itens));
  document.getElementById("continuar-pedido").disabled = itens.length === 0;
}

function atualizarEndereco() {
  const entrega = formularioPedido.elements.recebimento.value === "entrega";
  document.getElementById("campo-endereco").hidden = !entrega;
  formularioPedido.elements.endereco.required = entrega;
  formularioPedido.elements.endereco.disabled = !entrega;
}

function validarCliente(cliente) {
  if (cliente.nome.trim().length < 2) return "Informe um nome com pelo menos duas letras.";
  if (!/^\d{10,11}$/.test(cliente.telefone)) return "Informe um celular com DDD (10 ou 11 números).";
  if (!["retirada", "entrega"].includes(cliente.recebimento)) return "Escolha retirada ou entrega.";
  if (cliente.recebimento === "entrega" && cliente.endereco.trim().length < 10) return "Informe o endereço completo.";
  return "";
}

function montarLinhasPedido(itens) {
  return itens.map(function (item) {
    return `<li><span>${item.quantidade} × ${escaparTexto(item.nome)}</span><strong>${formatarPreco(item.preco * item.quantidade)}</strong></li>`;
  }).join("");
}

function mostrarRevisao() {
  const itens = obterItensSacola();
  const cliente = dadosCliente;
  let resumo = cliente.nome + "\n" + cliente.telefone;
  resumo += cliente.recebimento === "entrega" ? "\nEntrega: " + cliente.endereco : "\nRetirada na loja";
  if (cliente.observacoes) resumo += "\nObservações: " + cliente.observacoes;
  document.getElementById("resumo-cliente").textContent = resumo;
  document.getElementById("resumo-itens").innerHTML = montarLinhasPedido(itens);
  document.getElementById("total-revisao").textContent = formatarPreco(calcularTotal(itens));
  document.getElementById("erro-pedido").textContent = "";
  mostrarEtapa("revisao");
}

function confirmarPedido() {
  if (confirmando || !dadosCliente) return;
  const itens = obterItensSacola();
  if (itens.length === 0) return;
  confirmando = true;
  const botao = document.getElementById("confirmar-pedido");
  botao.disabled = true;

  try {
    const erro = validarCliente(dadosCliente);
    if (erro) throw new Error(erro);
    const pedido = {
      codigo: crypto.randomUUID(),
      telefone: dadosCliente.telefone,
      recebimento: dadosCliente.recebimento,
      itens: itens,
      total: calcularTotal(itens),
      data: new Date().toISOString(),
      status: "Recebido"
    };
    const pedidos = carregarPedidos();
    pedidos.push(pedido);
    // Só mostramos sucesso depois de salvar. Nome e endereço não são guardados.
    salvarDados(chavePedidos, pedidos);
    ultimoPedido = pedido;
  } catch {
    document.getElementById("erro-pedido").textContent = "Não foi possível salvar a simulação. Confira os dados e permita o armazenamento local no navegador.";
    confirmando = false;
    botao.disabled = false;
    return;
  }

  sacola = {};
  try {
    salvarDados(chaveSacola, sacola);
  } catch {
    // O pedido já foi salvo; uma falha ao limpar a sacola não deve duplicá-lo.
    mostrarAviso("Pedido salvo. A sacola antiga pode reaparecer ao recarregar a página.");
  }
  atualizarIndicadores();
  mostrarProdutos();
  document.getElementById("codigo-gerado").textContent = ultimoPedido.codigo;
  document.getElementById("total-confirmado").textContent = formatarPreco(ultimoPedido.total);
  document.getElementById("aviso-copia").textContent = "";
  formularioPedido.reset();
  atualizarEndereco();
  dadosCliente = null;
  mostrarEtapa("sucesso");
  confirmando = false;
  botao.disabled = false;
}

function consultarPedido(evento) {
  evento.preventDefault();
  const codigo = document.getElementById("codigo-consulta").value.trim();
  const telefone = limparTelefone(document.getElementById("telefone-consulta").value);
  const resultado = document.getElementById("resultado-pedido");
  const aviso = document.getElementById("erro-consulta");
  aviso.textContent = "";
  resultado.replaceChildren();
  try {
    const pedido = carregarPedidos().find(function (item) {
      return item.codigo === codigo && item.telefone === telefone;
    });
    if (!pedido) {
      aviso.textContent = "Pedido não encontrado neste navegador. Confira o código e o celular da simulação.";
      return;
    }
    resultado.innerHTML = `
      <div class="tracking-status"><div><span>Pedido simulado</span><h2>Recebido</h2></div></div>
      <p class="order-date">${escaparTexto(new Date(pedido.data).toLocaleString("pt-BR"))} · ${pedido.recebimento === "entrega" ? "Entrega" : "Retirada"}</p>
      <ul class="order-lines">${montarLinhasPedido(pedido.itens)}</ul>
      <div class="total"><span>Total</span><strong>${formatarPreco(pedido.total)}</strong></div>
      <p class="demo-note">O status permanece como recebido. Não há preparo, entrega ou cobrança real.</p>`;
  } catch {
    aviso.textContent = "Não foi possível ler os pedidos salvos neste navegador.";
  }
}

document.addEventListener("click", function (evento) {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.dataset.quantidade) alterarQuantidade(botao.dataset.quantidade, Number(botao.dataset.diferenca));
  if (botao.dataset.remover) alterarQuantidade(botao.dataset.remover, -20);
  if (botao.dataset.voltar) mostrarEtapa(botao.dataset.voltar);
});

document.getElementById("continuar-pedido").addEventListener("click", function () {
  mostrarEtapa("dados");
});

document.getElementById("continuar-comprando").addEventListener("click", function () {
  fecharJanela(janelaSacola);
  mostrarPagina("cardapio");
});

formularioPedido.addEventListener("change", atualizarEndereco);

document.getElementById("preencher-exemplo").addEventListener("click", function () {
  formularioPedido.elements.nome.value = "Cliente de demonstração";
  formularioPedido.elements.telefone.value = "(14) 99999-9999";
  formularioPedido.elements.endereco.value = "Rua de Exemplo, 100, Centro, Cidade Exemplo";
  formularioPedido.elements.observacoes.value = "Pedido para apresentação acadêmica";
});

formularioPedido.addEventListener("submit", function (evento) {
  evento.preventDefault();
  dadosCliente = {
    nome: formularioPedido.elements.nome.value.trim(),
    telefone: limparTelefone(formularioPedido.elements.telefone.value),
    recebimento: formularioPedido.elements.recebimento.value,
    endereco: formularioPedido.elements.endereco.value.trim(),
    observacoes: formularioPedido.elements.observacoes.value.trim()
  };
  const erro = validarCliente(dadosCliente);
  document.getElementById("erro-dados").textContent = erro;
  if (!erro) mostrarRevisao();
});

document.getElementById("confirmar-pedido").addEventListener("click", confirmarPedido);
document.getElementById("formulario-consulta").addEventListener("submit", consultarPedido);

document.getElementById("copiar-codigo").addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(ultimoPedido.codigo);
    document.getElementById("aviso-copia").textContent = "Código copiado!";
  } catch {
    document.getElementById("aviso-copia").textContent = "Selecione o código acima e copie manualmente.";
  }
});

document.getElementById("acompanhar-pedido").addEventListener("click", function () {
  fecharJanela(janelaSacola);
  mostrarPagina("pedidos");
  document.getElementById("codigo-consulta").value = ultimoPedido.codigo;
  document.getElementById("telefone-consulta").value = ultimoPedido.telefone;
  document.getElementById("formulario-consulta").requestSubmit();
});

atualizarEndereco();
