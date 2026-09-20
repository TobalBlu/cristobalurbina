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

document.addEventListener("DOMContentLoaded", aplicarConfig);
