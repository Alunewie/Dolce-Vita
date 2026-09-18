// Pequena apresentação visual; não espera downloads nem bloqueia o site.
(function () {
  const abertura = document.getElementById("abertura");
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let encerrada = false;
  let temporizador;

  function encerrarAbertura() {
    if (encerrada) return;
    encerrada = true;
    clearTimeout(temporizador);
    abertura.classList.add("saindo");
    abertura.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", encerrarAbertura);
    document.removeEventListener("pointerdown", encerrarAbertura);
    setTimeout(function () { abertura.remove(); }, movimentoReduzido ? 0 : 470);
  }

  // Abertura de 2,35 segundos, seguida por 450 ms de saída suave.
  temporizador = setTimeout(encerrarAbertura, movimentoReduzido ? 350 : 2350);
  document.addEventListener("keydown", encerrarAbertura);
  document.addEventListener("pointerdown", encerrarAbertura);
  const imagem = abertura.querySelector("img");
  imagem.addEventListener("error", encerrarAbertura, { once:true });
  if (imagem.complete && imagem.naturalWidth === 0) encerrarAbertura();
})();
