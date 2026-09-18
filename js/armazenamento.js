// Cada repositório tem suas próprias simulações neste navegador.
const prefixo = "dolce-vita-simples:" + location.pathname.replace(/index\.html$/, "");
const chaveSacola = prefixo + ":sacola";
const chavePedidos = prefixo + ":pedidos";

function lerDados(chave, valorInicial) {
  const texto = localStorage.getItem(chave);
  if (texto === null) return valorInicial;
  return JSON.parse(texto);
}

function salvarDados(chave, dados) {
  // Quem chama esta função trata a falha e mostra uma mensagem na tela.
  localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarSacola() {
  const sacolaLimpa = {};
  try {
    const dados = lerDados(chaveSacola, {});
    for (const produto of produtos) {
      const quantidade = dados?.[produto.id];
      if (Number.isInteger(quantidade) && quantidade > 0 && quantidade <= 20) {
        sacolaLimpa[produto.id] = quantidade;
      }
    }
  } catch {
    // A navegação continua mesmo quando o navegador bloqueia o armazenamento.
  }
  return sacolaLimpa;
}

function carregarPedidos() {
  const pedidos = lerDados(chavePedidos, []);
  if (!Array.isArray(pedidos)) throw new Error("Os pedidos salvos não puderam ser lidos.");
  return pedidos;
}

function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function limparTelefone(telefone) {
  return telefone.replace(/\D/g, "");
}

function calcularTotal(itens) {
  let total = 0;
  for (const item of itens) {
    total += item.preco * item.quantidade;
  }
  return total;
}

// Protege os textos inseridos em modelos HTML. Dados dos formulários usam textContent.
function escaparTexto(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
