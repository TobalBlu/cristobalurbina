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

const estadoPedido = {
  recargas: CONFIG.MINIMO_RECARGAS,
  bidones: 0,
  direccion: "",
  modo: "pronto",   // "pronto" | "agendar"
  dia: null,        // objeto Date
  bloque: null      // id del bloque elegido
};

/* ---------- Cantidad y total ---------- */

function calcularTotal() {
  const recargas = estadoPedido.recargas * CONFIG.PRECIO_RECARGA;
  const bidones = CONFIG.VENDE_BIDON
    ? estadoPedido.bidones * CONFIG.PRECIO_BIDON
    : 0;
  return { recargas, bidones, total: recargas + bidones };
}

function plural(n, singular, plural_) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

function pintarPedido() {
  // Un bidón nuevo llega lleno: nunca puede haber más bidones que recargas.
  estadoPedido.bidones = Math.min(estadoPedido.bidones, estadoPedido.recargas);

  const { recargas, bidones, total } = calcularTotal();

  // Contador
  $("#cantidad-valor").textContent = estadoPedido.recargas;
  $("#menos").disabled = estadoPedido.recargas <= CONFIG.MINIMO_RECARGAS;
  $("#mas").disabled = estadoPedido.recargas >= CONFIG.MAXIMO_RECARGAS;

  // Ayuda bajo el contador: solo aparece cuando explica un tope
  let ayuda = "";
  if (estadoPedido.recargas <= CONFIG.MINIMO_RECARGAS && CONFIG.MINIMO_RECARGAS > 1) {
    ayuda = `El pedido mínimo es de ${CONFIG.MINIMO_RECARGAS} recargas.`;
  } else if (estadoPedido.recargas >= CONFIG.MAXIMO_RECARGAS) {
    ayuda = "¿Necesitas más? Escríbenos por WhatsApp y lo coordinamos.";
  }
  $("#ayuda-cantidad").textContent = ayuda;

  // Contador de bidones
  if (CONFIG.VENDE_BIDON) {
    $("#bidones-valor").textContent = estadoPedido.bidones;
    $("#menos-bidon").disabled = estadoPedido.bidones <= 0;
    $("#mas-bidon").disabled = estadoPedido.bidones >= estadoPedido.recargas;

    let ayudaBidon;
    if (estadoPedido.bidones === 0) {
      ayudaBidon = `Déjalo en 0 si tienes tus envases para intercambiar. Cada bidón nuevo cuesta ${pesos(CONFIG.PRECIO_BIDON)}.`;
    } else if (estadoPedido.bidones >= estadoPedido.recargas) {
      ayudaBidon = "Ya son todos nuevos: no puedes pedir más bidones que recargas.";
    } else {
      ayudaBidon = `${pesos(CONFIG.PRECIO_BIDON)} cada uno, más el agua que trae adentro.`;
    }
    $("#ayuda-bidon").textContent = ayudaBidon;
  }

  // Línea de recargas
  $("#detalle-recargas").textContent =
    `${plural(estadoPedido.recargas, "recarga", "recargas")} × ${pesos(CONFIG.PRECIO_RECARGA)}`;
  $("#monto-recargas").textContent = pesos(recargas);

  // Línea de bidones
  const lineaBidones = $("#linea-bidones");
  lineaBidones.hidden = bidones === 0;
  if (bidones > 0) {
    $("#detalle-bidones").textContent =
      `${plural(estadoPedido.bidones, "bidón nuevo", "bidones nuevos")} × ${pesos(CONFIG.PRECIO_BIDON)}`;
    $("#monto-bidones").textContent = pesos(bidones);
  }

  $("#total").textContent = pesos(total);
}

function activarFormulario() {
  // La casilla del bidón solo existe si el negocio lo vende
  if (CONFIG.VENDE_BIDON) {
    $("#campo-bidon").hidden = false;

    $("#menos-bidon").addEventListener("click", () => {
      estadoPedido.bidones = Math.max(0, estadoPedido.bidones - 1);
      pintarPedido();
    });

    $("#mas-bidon").addEventListener("click", () => {
      estadoPedido.bidones = Math.min(estadoPedido.recargas, estadoPedido.bidones + 1);
      pintarPedido();
    });
  }

  $("#menos").addEventListener("click", () => {
    estadoPedido.recargas = Math.max(CONFIG.MINIMO_RECARGAS, estadoPedido.recargas - 1);
    pintarPedido();
  });

  $("#mas").addEventListener("click", () => {
    estadoPedido.recargas = Math.min(CONFIG.MAXIMO_RECARGAS, estadoPedido.recargas + 1);
    pintarPedido();
  });

  pintarPedido();
}

/* ---------- Dirección (memoria del dispositivo) ---------- */

/* Se guarda solo en el teléfono de la persona. No viaja a ningún servidor:
   esta página no tiene backend. */

const LLAVE_DIRECCION = "pyaar.direccion";

function leerDireccionGuardada() {
  try {
    return localStorage.getItem(LLAVE_DIRECCION) || "";
  } catch {
    return ""; // modo incógnito o almacenamiento bloqueado
  }
}

function guardarDireccion(valor) {
  try {
    if (valor) localStorage.setItem(LLAVE_DIRECCION, valor);
    else localStorage.removeItem(LLAVE_DIRECCION);
  } catch {
    /* sin memoria disponible: el pedido funciona igual */
  }
}

function activarDireccion() {
  const campo = $("#direccion");
  const aviso = $("#ayuda-direccion");

  $("#entrada-comuna").textContent = CONFIG.COBERTURA;

  const guardada = leerDireccionGuardada();
  if (guardada) {
    campo.value = guardada;
    estadoPedido.direccion = guardada;
    aviso.hidden = false;
  }

  campo.addEventListener("input", () => {
    estadoPedido.direccion = campo.value.trim();
    guardarDireccion(estadoPedido.direccion);
    aviso.hidden = true; // ya no es "la del último pedido", es la que está escribiendo
  });

  $("#olvidar-direccion").addEventListener("click", () => {
    campo.value = "";
    estadoPedido.direccion = "";
    guardarDireccion("");
    aviso.hidden = true;
    campo.focus();
  });
}

/* ---------- Horario ---------- */

/* Un día se ofrece solo si le queda al menos un bloque por delante.
   Por eso "hoy" desaparece solo cuando se hace tarde, sin tocar nada. */

const NOMBRE_DIA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function mismoDia(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function bloquesDeEseDia(fecha) {
  const ahora = new Date();
  if (!mismoDia(fecha, ahora)) return CONFIG.BLOQUES;
  const limite = ahora.getHours() + CONFIG.ANTICIPACION_HORAS;
  return CONFIG.BLOQUES.filter((b) => limite < b.hasta);
}

function diasOfrecidos() {
  const dias = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < CONFIG.DIAS_VISIBLES; i++) {
    const f = new Date(base);
    f.setDate(base.getDate() + i);
    if (bloquesDeEseDia(f).length) dias.push(f);
  }
  return dias;
}

function etiquetaDia(fecha) {
  const hoy = new Date();
  const mañana = new Date();
  mañana.setDate(hoy.getDate() + 1);
  if (mismoDia(fecha, hoy)) return "Hoy";
  if (mismoDia(fecha, mañana)) return "Mañana";
  return NOMBRE_DIA[fecha.getDay()];
}

function fechaLarga(fecha) {
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function pintarDias() {
  const cont = $("#dias");
  cont.innerHTML = "";

  diasOfrecidos().forEach((fecha) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dia";
    b.innerHTML =
      `<span class="dia__nombre">${etiquetaDia(fecha)}</span>` +
      `<span class="dia__numero">${fecha.getDate()}</span>`;

    if (estadoPedido.dia && mismoDia(fecha, estadoPedido.dia)) {
      b.classList.add("es-activo");
      b.setAttribute("aria-pressed", "true");
    } else {
      b.setAttribute("aria-pressed", "false");
    }

    b.addEventListener("click", () => {
      estadoPedido.dia = fecha;
      // si el bloque elegido no existe en el día nuevo, se suelta
      const validos = bloquesDeEseDia(fecha).map((x) => x.id);
      if (!validos.includes(estadoPedido.bloque)) estadoPedido.bloque = null;
      pintarDias();
      pintarBloques();
    });

    cont.appendChild(b);
  });
}

function pintarBloques() {
  const cont = $("#bloques");
  cont.innerHTML = "";
  if (!estadoPedido.dia) return;

  bloquesDeEseDia(estadoPedido.dia).forEach((bloque) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bloque";
    b.innerHTML =
      `<span class="bloque__nombre">${bloque.etiqueta}</span>` +
      `<span class="bloque__horas">${bloque.horario}</span>`;

    const activo = estadoPedido.bloque === bloque.id;
    b.classList.toggle("es-activo", activo);
    b.setAttribute("aria-pressed", activo ? "true" : "false");

    b.addEventListener("click", () => {
      estadoPedido.bloque = bloque.id;
      pintarBloques();
      limpiarError();
    });

    cont.appendChild(b);
  });
}

function cambiarModo(modo) {
  estadoPedido.modo = modo;
  const agendar = modo === "agendar";

  $("#modo-pronto").classList.toggle("es-activo", !agendar);
  $("#modo-agendar").classList.toggle("es-activo", agendar);
  $("#modo-pronto").setAttribute("aria-pressed", String(!agendar));
  $("#modo-agendar").setAttribute("aria-pressed", String(agendar));

  $("#agenda").hidden = !agendar;
  $("#ayuda-horario").textContent = agendar
    ? ""
    : "Coordinamos la hora contigo al confirmar por WhatsApp.";

  if (agendar) {
    const dias = diasOfrecidos();
    if (!estadoPedido.dia && dias.length) estadoPedido.dia = dias[0];
    pintarDias();
    pintarBloques();
  } else {
    estadoPedido.dia = null;
    estadoPedido.bloque = null;
  }
  limpiarError();
}

function activarHorario() {
  $("#modo-pronto").addEventListener("click", () => cambiarModo("pronto"));
  $("#modo-agendar").addEventListener("click", () => cambiarModo("agendar"));
  cambiarModo("pronto");
}

/* ---------- Mensaje de WhatsApp ---------- */

function textoHorario() {
  if (estadoPedido.modo === "pronto") return "lo antes posible";
  const bloque = CONFIG.BLOQUES.find((b) => b.id === estadoPedido.bloque);
  return `${fechaLarga(estadoPedido.dia)}, ${bloque.etiqueta.toLowerCase()} (${bloque.horario})`;
}

function armarMensaje() {
  const { total } = calcularTotal();
  const lineas = [
    `Hola ${CONFIG.NOMBRE}, quiero ${plural(estadoPedido.recargas, "recarga", "recargas")} de agua (${pesos(total)}).`
  ];
  if (estadoPedido.bidones > 0 && CONFIG.VENDE_BIDON) {
    lineas.push(`Incluye ${plural(estadoPedido.bidones, "bidón nuevo", "bidones nuevos")}: no tengo envase para ${estadoPedido.bidones === 1 ? "ese" : "esos"}.`);
  }
  lineas.push(`Dirección: ${estadoPedido.direccion}, ${CONFIG.COBERTURA}.`);
  lineas.push(`Horario: ${textoHorario()}.`);
  return lineas.join("\n");
}

function mostrarError(mensaje, campo) {
  const caja = $("#error-envio");
  caja.textContent = mensaje;
  caja.hidden = false;
  if (campo) campo.focus({ preventScroll: false });
}

function limpiarError() {
  $("#error-envio").hidden = true;
}

function enviarPedido() {
  if (!estadoPedido.direccion) {
    mostrarError("Escribe tu dirección para poder llevarte el agua.", $("#direccion"));
    return;
  }
  if (estadoPedido.modo === "agendar" && !estadoPedido.bloque) {
    mostrarError("Elige un horario, o cambia a “lo antes posible”.");
    return;
  }

  limpiarError();
  const url = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(armarMensaje())}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  activarFormulario();
  activarDireccion();
  activarHorario();
  $("#enviar").addEventListener("click", enviarPedido);
});
