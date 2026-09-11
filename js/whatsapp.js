// Solicitud por WhatsApp: junta los servicios marcados y la hora,
// arma el mensaje y lo pone en el enlace wa.me.
// La web no envía nada: la persona aprieta "enviar" en su WhatsApp.
(function () {
  var NUMERO = '56963725631';

  var casillas = document.querySelectorAll('input[name="servicio"]');
  var tipos = document.querySelectorAll('input[name="tipo"]');
  var receptores = document.getElementById('receptores');
  var panelTipos = document.getElementById('tipos-receptor');
  var hora = document.getElementById('hora');
  var vista = document.getElementById('vista-previa');
  var boton = document.getElementById('enviar-wsp');
  if (!boton || !casillas.length) return;

  // "a", "a y b", "a, b y c"
  function unir(lista) {
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
  }

  function armarMensaje() {
    var elegidos = [];
    casillas.forEach(function (c) {
      if (!c.checked) return;
      var texto = c.value;
      if (c === receptores) {
        var t = [];
        tipos.forEach(function (x) { if (x.checked) t.push(x.value); });
        if (t.length) texto += ' (' + unir(t) + ')';   // receptores de reseñas (NFC y QR)
      }
      elegidos.push(texto);
    });
    if (!elegidos.length) return null;

    var mensaje = 'Hola, estoy interesado en ' + unir(elegidos) + '. ';
    if (hora.value) {
      var articulo = hora.value.indexOf('01:') === 0 ? 'a la ' : 'a las ';
      mensaje += 'Me gustaría que me devolvieras un llamado ' + articulo + hora.value + '.';
    } else {
      mensaje += 'Me gustaría que me devolvieras un llamado cuando puedas.';
    }
    return mensaje;
  }

  function actualizar() {
    // El menú de tipos solo aparece con "Receptores de reseñas" marcado
    panelTipos.hidden = !receptores.checked;
    receptores.setAttribute('aria-expanded', String(receptores.checked));
    if (!receptores.checked) tipos.forEach(function (x) { x.checked = false; });

    var texto = armarMensaje();
    if (texto) {
      vista.textContent = texto;
      boton.href = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto);
      boton.removeAttribute('aria-disabled');
    } else {
      vista.textContent = 'Marca al menos un servicio para armar tu mensaje.';
      boton.href = 'https://wa.me/' + NUMERO;
      boton.setAttribute('aria-disabled', 'true');
    }
  }

  boton.addEventListener('click', function (e) {
    if (boton.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      casillas[0].focus();
    }
  });

  casillas.forEach(function (c) { c.addEventListener('change', actualizar); });
  tipos.forEach(function (c) { c.addEventListener('change', actualizar); });
  hora.addEventListener('input', actualizar);
  actualizar();
})();
