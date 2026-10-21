// Cabecera fija: aparece al pasar 500px de desplazamiento
const cabeceraFija = document.querySelector('[data-cabecera-fija]');
const DESPLAZAMIENTO_CABECERA = 500;

if (cabeceraFija) {
  const actualizarCabecera = () => {
    cabeceraFija.classList.toggle('esta-visible', window.scrollY > DESPLAZAMIENTO_CABECERA);
  };
  window.addEventListener('scroll', actualizarCabecera, { passive: true });
  actualizarCabecera();
}

// Carruseles infinitos con avance automático. Se clona el juego completo de
// diapositivas antes y después; al salir del juego central se salta sin transición.
// Con "reducir movimiento" no avanza solo ni desliza.
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

function iniciarCarrusel(carrusel) {
  const pista = carrusel.querySelector('.carrusel__pista');
  const originales = [...pista.children];
  const total = originales.length;
  const intervalo = Number(carrusel.dataset.intervalo);
  let indice = total;
  let temporizador;

  const clonar = (diapositiva) => {
    const clon = diapositiva.cloneNode(true);
    clon.setAttribute('aria-hidden', 'true');
    return clon;
  };
  pista.prepend(...originales.map(clonar));
  pista.append(...originales.map(clonar));

  // Con decimales: offsetLeft redondea y el error se acumula diapositiva a diapositiva
  const paso = () => pista.children[1].getBoundingClientRect().left - pista.children[0].getBoundingClientRect().left;

  const mover = (animado = true) => {
    pista.classList.toggle('sin-transicion', !animado);
    pista.style.transform = `translateX(${-indice * paso()}px)`;
  };

  // Vuelve al juego central sin transición
  const normalizar = () => {
    if (indice >= total * 2) indice -= total;
    if (indice < total) indice += total;
    mover(false);
  };

  const irA = (nuevo) => {
    indice = nuevo;
    if (sinMovimiento.matches) normalizar();
    else mover();
  };

  pista.addEventListener('transitionend', (evento) => {
    if (evento.target === pista) normalizar();
  });

  const iniciar = () => {
    clearInterval(temporizador);
    if (!sinMovimiento.matches) temporizador = setInterval(() => irA(indice + 1), intervalo);
  };
  const detener = () => clearInterval(temporizador);

  // Pausa con el ratón encima o el foco dentro
  carrusel.addEventListener('mouseenter', detener);
  carrusel.addEventListener('mouseleave', iniciar);
  carrusel.addEventListener('focusin', detener);
  carrusel.addEventListener('focusout', (evento) => {
    if (!carrusel.contains(evento.relatedTarget)) iniciar();
  });

  // Arrastre con el dedo o el ratón; al tocar se pausa y al soltar se reanuda
  let inicioX = null;
  carrusel.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType === 'mouse') evento.preventDefault();
    inicioX = evento.clientX;
    detener();
  });
  carrusel.addEventListener('pointerup', (evento) => {
    if (inicioX === null) return;
    const distancia = evento.clientX - inicioX;
    if (Math.abs(distancia) > paso() / 4) irA(indice + (distancia < 0 ? 1 : -1));
    inicioX = null;
    iniciar();
  });

  window.addEventListener('resize', () => mover(false));
  sinMovimiento.addEventListener('change', iniciar);
  mover(false);
  iniciar();
}

document.querySelectorAll('[data-carrusel]').forEach(iniciarCarrusel);

// Video del hero: con "reducir movimiento" no se reproduce y se ve solo el póster
const videoHero = document.querySelector('.hero__video');

if (videoHero) {
  const ajustarVideo = () => {
    if (sinMovimiento.matches) {
      videoHero.removeAttribute('autoplay');
      videoHero.load();
    } else {
      videoHero.autoplay = true;
      videoHero.play();
    }
  };
  sinMovimiento.addEventListener('change', ajustarVideo);
  if (sinMovimiento.matches) ajustarVideo();
}

// Desplazamiento suave con inercia (Lenis) para la rueda del ratón y el trackpad.
// En pantallas táctiles el desplazamiento sigue siendo nativo; con "reducir
// movimiento" Lenis no se activa.
const DURACION_DESPLAZAMIENTO = 1.1; // segundos
const CURVA_DESPLAZAMIENTO = (t) => 1 - (1 - t) ** 4; // salida suave

const lenis = sinMovimiento.matches || !window.Lenis ? null : new Lenis({
  duration: DURACION_DESPLAZAMIENTO,
  easing: CURVA_DESPLAZAMIENTO,
  syncTouch: false,
  autoRaf: true,
});

// Enlaces a secciones: Lenis descuenta el scroll-margin-top de la sección, el mismo
// desfase de la cabecera fija que usa el salto nativo. El resto de anclas (el
// enlace para saltar al contenido) sigue con el comportamiento nativo.
if (lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    const destino = document.getElementById(enlace.hash.slice(1));
    if (!destino?.matches('section')) return;
    enlace.addEventListener('click', (evento) => {
      evento.preventDefault();
      lenis.scrollTo(destino);
      history.pushState(null, '', enlace.hash);
    });
  });
}

// Popups: los abre cualquier botón con data-abrir-popup="<id del dialog>". Se cierran con su
// botón, con Escape (nativo de <dialog>) o con un clic fuera del contenido; al cerrar, el foco
// vuelve al botón que los abrió. Mientras están abiertos Lenis se detiene y la página
// no se mueve; la columna del formulario lleva data-lenis-prevent para desplazarse
// de forma nativa.
document.querySelectorAll('[data-abrir-popup]').forEach((boton) => {
  const popup = document.getElementById(boton.dataset.abrirPopup);
  boton.addEventListener('click', () => {
    popup.showModal();
    lenis?.stop();
    popup.addEventListener('close', () => boton.focus(), { once: true });
  });
});

document.querySelectorAll('[data-popup]').forEach((popup) => {
  popup.addEventListener('close', () => lenis?.start());
  popup.addEventListener('click', (evento) => {
    if (evento.target === popup || evento.target.closest('[data-cerrar-popup]')) popup.close();
  });
});

const ENDPOINT_FORMULARIO = '/api/contacto';
const WHATSAPP = 'https://wa.me/525539726224';

// Envío del formulario de contacto. Mientras envía, el botón queda deshabilitado;
// el resultado se avisa en el popup y, si salió bien, el formulario vuelve al primer paso.
async function enviarFormulario(formulario) {
  const mensaje = formulario.querySelector('[data-mensaje]');
  const boton = formulario.querySelector('[type="submit"]');
  const textoBoton = boton.textContent;
  const datos = new FormData(formulario);
  mensaje.hidden = true;
  boton.disabled = true;
  boton.textContent = 'Enviando…';

  const respuesta = await fetch(ENDPOINT_FORMULARIO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: datos.get('Nombre'),
      correo: datos.get('Correo Electrónico'),
      telefono: datos.get('Teléfono'),
      mensaje: datos.get('Mensaje'),
      medio: datos.get('marketing'),
      sitio: datos.get('sitio'),
    }),
  }).catch(() => null);

  boton.textContent = textoBoton;
  boton.disabled = false;
  if (respuesta?.ok) {
    formulario.reset();
    mensaje.textContent = 'Gracias, recibimos tu solicitud. Te contactaremos pronto.';
  } else {
    const enlace = document.createElement('a');
    enlace.href = WHATSAPP;
    enlace.target = '_blank';
    enlace.textContent = 'WhatsApp';
    mensaje.replaceChildren('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por ', enlace, '.');
  }
  mensaje.classList.toggle('formulario__mensaje--exito', Boolean(respuesta?.ok));
  mensaje.hidden = false;
}

// Máscara de entrada: cada 9 de la máscara es un dígito
function aplicarMascara(campo) {
  const digitos = campo.value.replace(/\D/g, '');
  let valor = '';
  let i = 0;
  for (const caracter of campo.dataset.mascara) {
    if (i >= digitos.length) break;
    valor += caracter === '9' ? digitos[i++] : caracter;
  }
  campo.value = valor;
}

document.querySelectorAll('[data-mascara]').forEach((campo) => {
  campo.addEventListener('input', () => aplicarMascara(campo));
});

// Formulario por pasos: "Siguiente" se activa cuando los campos del paso son válidos.
// Muestra el progreso ("Paso X de N") y, al salir de un campo inválido, su mensaje de error debajo.
function iniciarFormulario(formulario) {
  const pasos = [...formulario.querySelectorAll('[data-paso]')];
  const progreso = formulario.parentElement.querySelector('[data-progreso]');
  let actual = 0;

  const esValido = () => [...pasos[actual].querySelectorAll('input, textarea')].every((campo) => campo.checkValidity());
  const actualizarBotones = () => {
    pasos[actual].querySelectorAll('[data-siguiente], [type="submit"]').forEach((boton) => { boton.disabled = !esValido(); });
  };
  const actualizarProgreso = () => {
    if (!progreso) return;
    progreso.querySelector('[data-progreso-texto]').textContent = `Paso ${actual + 1} de ${pasos.length}`;
    progreso.style.setProperty('--progreso', (actual + 1) / pasos.length);
  };
  // Cada campo (o grupo de opciones) lleva su texto de error en data-error-texto
  const mostrarError = (campo) => {
    const caja = campo.closest('[data-campo]');
    const error = caja?.querySelector('[data-error]');
    if (!error) return;
    const valido = campo.checkValidity();
    error.textContent = valido ? '' : (campo.dataset.errorTexto || caja.dataset.errorTexto);
    error.hidden = valido;
    campo.setAttribute('aria-invalid', String(!valido));
  };
  const mostrar = (indice) => {
    pasos[actual].hidden = true;
    actual = indice;
    pasos[actual].hidden = false;
    actualizarBotones();
    actualizarProgreso();
    (pasos[actual].querySelector('input:checked') || pasos[actual].querySelector('input, textarea, button'))?.focus();
  };

  formulario.addEventListener('input', (evento) => {
    if (evento.target.getAttribute('aria-invalid') === 'true') mostrarError(evento.target);
    actualizarBotones();
  });
  // Al elegir una opción se limpia el error del grupo
  formulario.addEventListener('change', (evento) => {
    if (evento.target.type === 'radio') {
      formulario.querySelectorAll(`[name="${evento.target.name}"]`).forEach((opcion) => opcion.removeAttribute('aria-invalid'));
      mostrarError(evento.target);
    }
  });
  // Al salir de un campo, o del grupo de opciones sin haber elegido ninguna
  formulario.addEventListener('focusout', (evento) => {
    const campo = evento.target;
    if (campo.matches('.formulario__control')) mostrarError(campo);
    if (campo.type === 'radio' && !campo.closest('[data-campo]').contains(evento.relatedTarget)) mostrarError(campo);
  });
  formulario.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-siguiente]')) mostrar(actual + 1);
    if (evento.target.closest('[data-anterior]')) mostrar(actual - 1);
  });
  // Al reiniciarse (tras un envío correcto) vuelve al primer paso; el evento llega
  // antes de que se borren los valores, por eso espera un turno
  formulario.addEventListener('reset', () => setTimeout(() => mostrar(0)));
  // Solo se envía desde el último paso
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (actual === pasos.length - 1) enviarFormulario(formulario);
  });
  actualizarBotones();
  actualizarProgreso();
}

document.querySelectorAll('[data-formulario]').forEach(iniciarFormulario);
