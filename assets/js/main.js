// Menú a pantalla completa
const menu = document.querySelector('[data-menu]');
const botonesAbrir = document.querySelectorAll('[data-menu-abrir]');

function cambiarMenu(abierto) {
  menu.classList.toggle('esta-abierto', abierto);
  botonesAbrir.forEach((boton) => boton.setAttribute('aria-expanded', String(abierto)));
}

if (menu) {
  botonesAbrir.forEach((boton) => boton.addEventListener('click', () => cambiarMenu(true)));
  menu.querySelector('[data-menu-cerrar]').addEventListener('click', () => cambiarMenu(false));
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cambiarMenu(false);
  });
}

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

  const paso = () => pista.children[1].offsetLeft - pista.children[0].offsetLeft;

  const mover = (animado = true) => {
    pista.classList.toggle('sin-transicion', !animado);
    pista.style.transform = `translateX(${-indice * paso()}px)`;
  };

  const avanzar = (sentido) => {
    indice += sentido;
    mover();
  };

  pista.addEventListener('transitionend', (evento) => {
    if (evento.target !== pista) return;
    if (indice >= total * 2) indice -= total;
    if (indice < total) indice += total;
    mover(false);
  });

  const iniciar = () => {
    clearInterval(temporizador);
    temporizador = setInterval(() => avanzar(1), intervalo);
  };
  const detener = () => clearInterval(temporizador);

  carrusel.addEventListener('mouseenter', detener);
  carrusel.addEventListener('mouseleave', iniciar);

  // Arrastre con el dedo o el ratón
  let inicioX = null;
  carrusel.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType === 'mouse') evento.preventDefault();
    inicioX = evento.clientX;
    detener();
  });
  carrusel.addEventListener('pointerup', (evento) => {
    if (inicioX === null) return;
    const distancia = evento.clientX - inicioX;
    if (Math.abs(distancia) > paso() / 4) avanzar(distancia < 0 ? 1 : -1);
    inicioX = null;
    iniciar();
  });

  window.addEventListener('resize', () => mover(false));
  mover(false);
  iniciar();
}

document.querySelectorAll('[data-carrusel]').forEach(iniciarCarrusel);
