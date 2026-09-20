/* =========================================================
   PYAAR — ZONA DE CONFIGURACIÓN
   Este es el único archivo que hay que editar cuando el
   cliente confirme sus datos. No tocar app.js ni styles.css.
   ========================================================= */

const CONFIG = {

  /* --- Negocio --------------------------------------- */
  NOMBRE: "PYAAR",
  BAJADA: "Agua purificada a domicilio",

  /* Número de WhatsApp en formato internacional, sin + ni espacios.
     PROVISORIO: confirmar con el cliente. */
  WHATSAPP: "56930931911",

  /* --- Precios (CLP) ---------------------------------- */
  /* PROVISORIOS: confirmar con el cliente. */
  PRECIO_RECARGA: 2500,   // recarga de bidón que el cliente ya tiene
  PRECIO_BIDON: 8000,     // bidón nuevo, para quien pide por primera vez
  VENDE_BIDON: true,      // false = la página solo ofrece recargas

  /* Pedido mínimo en recargas. 1 = sin mínimo. */
  MINIMO_RECARGAS: 2,

  /* Tope por pedido, para que nadie mande "99 recargas" sin hablar antes. */
  MAXIMO_RECARGAS: 20,

  /* --- Cobertura -------------------------------------- */
  COBERTURA: "Maipú",
  COBERTURA_DETALLE: "Entregamos en toda la comuna de Maipú.",

  /* --- Reseñas de Google ------------------------------ */
  /* Vacío = el bloque de reseñas no aparece.
     Cuando tengan Google Business, pegar acá el link de
     "Escribir una reseña" y el bloque se enciende solo. */
  GOOGLE_REVIEWS_URL: "",

  /* --- Agenda ----------------------------------------- */
  DIAS_VISIBLES: 7,       // cuántos días muestra el calendario
  BLOQUES: [
    { id: "mañana", etiqueta: "Mañana", horario: "9:00 a 13:00", desde: 9,  hasta: 13 },
    { id: "tarde",  etiqueta: "Tarde",  horario: "14:00 a 18:00", desde: 14, hasta: 18 },
    { id: "noche",  etiqueta: "Noche",  horario: "18:00 a 21:00", desde: 18, hasta: 21 }
  ],

  /* --- Razones para confiar (hero) --------------------- */
  /* PROVISORIAS: son las promesas que hace la página.
     Confirmar una por una con el cliente antes de publicar. */
  CONFIANZA: [
    "Agua purificada, envase sellado",
    "Entrega el mismo día en Maipú",
    "Pagas al recibir tu pedido"
  ]
};
