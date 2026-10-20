// Cabecera fija: aparece al pasar 500px de desplazamiento, como en el tema original
// (JupiterX añade la clase jupiterx-header-sticked con ese mismo umbral)
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
// Controles opcionales en un elemento con data-controles-de="<id del carrusel>":
// botones data-anterior, data-siguiente y un data-indicador por diapositiva.
// Con "reducir movimiento" no avanza solo ni desliza.
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

function iniciarCarrusel(carrusel) {
  const pista = carrusel.querySelector('.carrusel__pista');
  const originales = [...pista.children];
  const total = originales.length;
  const intervalo = Number(carrusel.dataset.intervalo);
  const controles = carrusel.id ? document.querySelector(`[data-controles-de="${carrusel.id}"]`) : null;
  const indicadores = controles ? [...controles.querySelectorAll('[data-indicador]')] : [];
  let indice = total;
  let temporizador;

  const clonar = (diapositiva) => {
    const clon = diapositiva.cloneNode(true);
    clon.setAttribute('aria-hidden', 'true');
    return clon;
  };
  pista.prepend(...originales.map(clonar));
  pista.append(...originales.map(clonar));

  const paso = () => pista.children[1].offsetLeft - pista.children[0].offsetLeft;

  const marcarIndicador = () => {
    const activo = (((indice - total) % total) + total) % total;
    indicadores.forEach((punto, i) => punto.setAttribute('aria-current', String(i === activo)));
  };

  const mover = (animado = true) => {
    pista.classList.toggle('sin-transicion', !animado);
    pista.style.transform = `translateX(${-indice * paso()}px)`;
    marcarIndicador();
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

  // Pausa con el ratón encima o el foco dentro (del carrusel o de sus controles)
  [carrusel, controles].filter(Boolean).forEach((zona) => {
    zona.addEventListener('mouseenter', detener);
    zona.addEventListener('mouseleave', iniciar);
    zona.addEventListener('focusin', detener);
    zona.addEventListener('focusout', (evento) => {
      if (!zona.contains(evento.relatedTarget)) iniciar();
    });
  });

  if (controles) {
    controles.querySelector('[data-anterior]')?.addEventListener('click', () => irA(indice - 1));
    controles.querySelector('[data-siguiente]')?.addEventListener('click', () => irA(indice + 1));
    indicadores.forEach((punto, i) => punto.addEventListener('click', () => irA(total + i)));
  }

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

// Popups: los abre cualquier botón con data-abrir-popup="<id del dialog>". Se cierran con su
// botón, con Escape (nativo de <dialog>) o con un clic fuera del contenido; al cerrar, el foco
// vuelve al botón que los abrió.
document.querySelectorAll('[data-abrir-popup]').forEach((boton) => {
  const popup = document.getElementById(boton.dataset.abrirPopup);
  boton.addEventListener('click', () => {
    popup.showModal();
    popup.addEventListener('close', () => boton.focus(), { once: true });
  });
});

document.querySelectorAll('[data-popup]').forEach((popup) => {
  popup.addEventListener('click', (evento) => {
    if (evento.target === popup || evento.target.closest('[data-cerrar-popup]')) popup.close();
  });
});

// TODO: definir a dónde llegan los datos del formulario de contacto.
const ENDPOINT_FORMULARIO = '';

// Envío del formulario de contacto. Mientras no haya destino, avisa en el popup y no envía nada.
async function enviarFormulario(formulario) {
  const mensaje = formulario.querySelector('[data-mensaje]');
  if (!ENDPOINT_FORMULARIO) {
    mensaje.textContent = 'El envío del formulario aún no está configurado. Tus datos no se han enviado.';
    mensaje.hidden = false;
    return;
  }
  await fetch(ENDPOINT_FORMULARIO, { method: 'POST', body: new FormData(formulario) });
}

// Máscara de entrada, como en el original: cada 9 de la máscara es un dígito
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

// Formulario por pasos: "Siguiente" se activa cuando los campos del paso son válidos, como en el original
function iniciarFormulario(formulario) {
  const pasos = [...formulario.querySelectorAll('[data-paso]')];
  let actual = 0;

  const esValido = () => [...pasos[actual].querySelectorAll('input, textarea, select')].every((campo) => campo.checkValidity());
  const actualizarBotones = () => {
    pasos[actual].querySelectorAll('[data-siguiente]').forEach((boton) => { boton.disabled = !esValido(); });
  };
  const mostrar = (indice) => {
    pasos[actual].hidden = true;
    actual = indice;
    pasos[actual].hidden = false;
    actualizarBotones();
    pasos[actual].querySelector('input, textarea, select, button')?.focus();
  };

  formulario.addEventListener('input', actualizarBotones);
  formulario.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-siguiente]')) mostrar(actual + 1);
    if (evento.target.closest('[data-anterior]')) mostrar(actual - 1);
  });
  // Solo se envía desde el último paso
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (actual === pasos.length - 1) enviarFormulario(formulario);
  });
  actualizarBotones();
}

document.querySelectorAll('[data-formulario]').forEach(iniciarFormulario);
