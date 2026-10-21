# Reglas de trabajo

## Proyecto
- Copia fiel en HTML de https://lenocirochin.com/ (firma de abogados en CDMX). El sitio
  publicado está hecho con WordPress, Elementor y JupiterX; aquí se reconstruye en HTML,
  CSS y JavaScript puros, sin framework ni paso de build.
- Se despliega como sitio estático en Vercel, en la cuenta del cliente.
- Es una sola página (landing): index.html. La navegación lleva a secciones de la misma
  página. Las URLs antiguas (/nosotros/, /servicios/, /contacto/) redirigen con 301 desde
  vercel.json.

## Git
- No ejecutes `git add`, `git commit`, `git push` ni ningún comando de git.
- No despliegues a producción bajo ninguna circunstancia, ni con aprobación verbal.
- Al terminar una tarea, deja los cambios en el working directory y lista los archivos
  que tocaste. El commit y el push los hace el equipo manualmente desde terminal.

## Flujo de trabajo
- Ejecuta directamente. No entregues plan previo ni esperes aprobación,
  salvo que la tarea sea ambigua o que ejecutarla implique una decisión
  que no está en la instrucción.
- Si durante la ejecución encuentras algo que la instrucción no contemplaba,
  detente y repórtalo antes de improvisar una solución.
- No repitas contexto ya establecido en el proyecto.

## Sistema de diseño
- El proyecto NO usa Tailwind. Se evaluó y se descartó: sin clases de utilidad,
  lo único que aportaba era un reset que preferimos escribir nosotros. No lo
  reintroduzcas ni escribas clases de utilidad.
- Todo el estilo es CSS propio, organizado en capas:
    assets/css/tokens.css         los valores de diseño, única fuente de verdad
    assets/css/base.css           el reset y los estilos de elemento, únicos
    assets/css/patrones.css       el vocabulario compartido, clases sp-*
    assets/css/interacciones.css  las clases que consulta el JavaScript
  Lo propio de la página va en assets/css/paginas/inicio.css. No hay ni debe
  haber hojas globales de página: el orden de capas (base, patrones, e inicio.css
  fuera de toda capa) hace que inicio.css siempre pueda ajustar un patrón con una
  regla normal, sin !important ni selectores inflados.
  El orden de capas se declara una sola vez, al inicio de tokens.css
  (`@layer base, patrones;`), y base.css y patrones.css envuelven su contenido en
  su capa. index.html enlaza tokens, base, patrones, interacciones e inicio.css,
  en ese orden.
- Un estilo sube a patrones.css cuando lo usan dos o más componentes o secciones;
  lo que solo usa una sección se queda en inicio.css.
- No inventes valores fuera del sistema: usa los tokens de tokens.css. Si un
  valor no está, no lo escribas suelto: decide si toca añadirlo al sistema.
- Si un cambio toca un patrón compartido y afectaría a otras secciones, no lo
  toques: aplica el override acotado a la sección y repórtalo.

## Imágenes
- Toda foto o ilustración va como <img> con object-fit. Nada de fondos CSS para
  fotos o ilustraciones.

## Alcance
- Haz solo lo que se pide. No agregues elementos, secciones ni mejoras no solicitadas.
- Si algo se ve duplicado, mal escrito o mejorable fuera del alcance, repórtalo.
  No lo corrijas.

## Verificación
- En cambios de diseño, toma una sola ronda de capturas de la sección tocada
  (390, 768 y 1440px), evalúalas contra el brief y haz como máximo una pasada de
  corrección. Después reporta, aunque quede algo por pulir: dilo en el reporte.
- No hagas más rondas de capturas ni ciclos de validación por tu cuenta.
  La revisión final la hace el equipo.
- Para diagnosticar un fallo reportado, sí levanta el servidor y mide en el
  navegador. No deduzcas la causa leyendo el CSS: repróducela.
- Si detectas un error real que impide que la tarea funcione, repórtalo.
