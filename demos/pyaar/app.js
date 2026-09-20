/* =========================================================
   PYAAR — lógica del sitio
   Los datos del negocio NO se editan acá: están en config.js
   ========================================================= */

/* ---------- Utilidades ---------- */

const pesos = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(n);

const $ = (sel) => document.querySelector(sel);

/* ---------- Pintar la configuración en la página ---------- */

function aplicarConfig() {
  // Cualquier elemento con data-cfg="CLAVE" toma su texto de CONFIG.
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const valor = CONFIG[el.dataset.cfg];
    if (valor !== undefined && valor !== "") el.textContent = valor;
  });

  $("#precio-recarga").textContent = pesos(CONFIG.PRECIO_RECARGA);

  const minimo = $("#texto-minimo");
  minimo.textContent =
    CONFIG.MINIMO_RECARGAS > 1
      ? `Pedido mínimo: ${CONFIG.MINIMO_RECARGAS} recargas.`
      : "";

  const lista = $("#confianza");
  lista.innerHTML = "";
  CONFIG.CONFIANZA.forEach((texto) => {
    const li = document.createElement("li");
    li.textContent = texto;
    lista.appendChild(li);
  });

  $("#anio").textContent = new Date().getFullYear();
}

/* ---------- Estado del pedido ---------- */

const pedido = {
  recargas: CONFIG.MINIMO_RECARGAS,
  necesitaBidon: false
};

/* ---------- Cantidad y total ---------- */

function calcularTotal() {
  const recargas = pedido.recargas * CONFIG.PRECIO_RECARGA;
  const bidones =
    pedido.necesitaBidon && CONFIG.VENDE_BIDON
      ? pedido.recargas * CONFIG.PRECIO_BIDON
      : 0;
  return { recargas, bidones, total: recargas + bidones };
}

function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

function pintarPedido() {
  const { recargas, bidones, total } = calcularTotal();

  // Contador
  $("#cantidad-valor").textContent = pedido.recargas;
  $("#menos").disabled = pedido.recargas <= CONFIG.MINIMO_RECARGAS;
  $("#mas").disabled = pedido.recargas >= CONFIG.MAXIMO_RECARGAS;

  // Ayuda bajo el contador: solo aparece cuando explica un tope
  let ayuda = "";
  if (pedido.recargas <= CONFIG.MINIMO_RECARGAS && CONFIG.MINIMO_RECARGAS > 1) {
    ayuda = `El pedido mínimo es de ${CONFIG.MINIMO_RECARGAS} recargas.`;
  } else if (pedido.recargas >= CONFIG.MAXIMO_RECARGAS) {
    ayuda = "¿Necesitas más? Escríbenos por WhatsApp y lo coordinamos.";
  }
  $("#ayuda-cantidad").textContent = ayuda;

  // Línea de recargas
  $("#detalle-recargas").textContent =
    `${plural(pedido.recargas, "recarga", "recargas")} × ${pesos(CONFIG.PRECIO_RECARGA)}`;
  $("#monto-recargas").textContent = pesos(recargas);

  // Línea de bidones
  const lineaBidones = $("#linea-bidones");
  lineaBidones.hidden = bidones === 0;
  if (bidones > 0) {
    $("#detalle-bidones").textContent =
      `${plural(pedido.recargas, "bidón nuevo", "bidones nuevos")} × ${pesos(CONFIG.PRECIO_BIDON)}`;
    $("#monto-bidones").textContent = pesos(bidones);
  }

  $("#total").textContent = pesos(total);
}

function activarFormulario() {
  // La casilla del bidón solo existe si el negocio lo vende
  if (CONFIG.VENDE_BIDON) {
    $("#campo-bidon").hidden = false;
    $("#ayuda-bidon").textContent =
      `Te llevamos uno por cada recarga: ${pesos(CONFIG.PRECIO_BIDON)} cada uno.`;
  }

  $("#menos").addEventListener("click", () => {
    pedido.recargas = Math.max(CONFIG.MINIMO_RECARGAS, pedido.recargas - 1);
    pintarPedido();
  });

  $("#mas").addEventListener("click", () => {
    pedido.recargas = Math.min(CONFIG.MAXIMO_RECARGAS, pedido.recargas + 1);
    pintarPedido();
  });

  $("#necesita-bidon").addEventListener("change", (e) => {
    pedido.necesitaBidon = e.target.checked;
    pintarPedido();
  });

  pintarPedido();
}

document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  activarFormulario();
});
