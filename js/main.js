// Navegación: menú móvil + sección activa. Sin dependencias.
(function () {
  var boton = document.querySelector('.menu-boton');
  var menu = document.getElementById('menu');
  var enlaces = menu.querySelectorAll('a');

  function cerrar() {
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('abierto');
  }

  boton.addEventListener('click', function () {
    var abierto = boton.getAttribute('aria-expanded') === 'true';
    boton.setAttribute('aria-expanded', String(!abierto));
    menu.classList.toggle('abierto', !abierto);
  });

  enlaces.forEach(function (a) { a.addEventListener('click', cerrar); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { cerrar(); boton.focus(); }
  });

  // Marca en el menú la sección que está en pantalla
  if (!('IntersectionObserver' in window)) return;
  var porId = {};
  enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (!en.isIntersecting) return;
      enlaces.forEach(function (a) { a.removeAttribute('aria-current'); });
      var activo = porId[en.target.id];
      if (activo) activo.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(function (s) { observador.observe(s); });
})();

// Imágenes opcionales: si el archivo no existe todavía, se quitan del
// documento para que no reserven espacio ni muestren un ícono roto.
(function () {
  function quitar(img) {
    var li = img.closest('li');
    (li || img).remove();
  }
  document.querySelectorAll('img[data-opcional]').forEach(function (img) {
    img.addEventListener('error', function () { quitar(img); });
    // Si ya falló antes de que corriera este script
    if (img.complete && img.naturalWidth === 0) quitar(img);
  });
})();
