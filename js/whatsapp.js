// Solicitud por WhatsApp: junta los servicios marcados y la hora,
// arma el mensaje y lo pone en el enlace wa.me.
// La web no envía nada: la persona aprieta "enviar" en su WhatsApp.
(function () {
  var NUMERO = '56963725631';

  var casillas = document.querySelectorAll('input[name="servicio"]');
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
    casillas.forEach(function (c) { if (c.checked) elegidos.push(c.value); });
    if (!elegidos.length) return null;

    var texto = 'Hola, estoy interesado en ' + unir(elegidos) + '. ';
    if (hora.value) {
      // 01:xx se dice "a la 1"; el resto, "a las"
      var articulo = hora.value.indexOf('01:') === 0 ? 'a la ' : 'a las ';
      texto += 'Me gustaría que me devolvieras un llamado ' + articulo + hora.value + '.';
    } else {
      texto += 'Me gustaría que me devolvieras un llamado cuando puedas.';
    }
    return texto;
  }

  function actualizar() {
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

  // Sin servicios marcados, el botón no abre WhatsApp y señala qué falta
  boton.addEventListener('click', function (e) {
    if (boton.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      casillas[0].focus();
    }
  });

  casillas.forEach(function (c) { c.addEventListener('change', actualizar); });
  hora.addEventListener('input', actualizar);
  actualizar();
})();
