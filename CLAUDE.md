# Reglas de trabajo

## Proyecto
- Copia fiel en HTML de https://lenocirochin.com/ (firma de abogados en CDMX). El sitio
  publicado está hecho con WordPress, Elementor y JupiterX; aquí se reconstruye en HTML,
  CSS y JavaScript puros, sin framework ni paso de build.
- Se despliega como sitio estático en Vercel, en la cuenta del cliente.
- Páginas: /, /nosotros/, /servicios/ y /contacto/, cada una en su carpeta con index.html.

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
  Lo propio de una página va en su hoja dentro de assets/css/paginas/
  (inicio.css, nosotros.css, servicios.css, contacto.css), enlazada solo desde
  esa página. No hay ni debe haber hojas globales de página: el orden de capas
  (base, patrones, y las hojas de página fuera de toda capa) hace que una hoja de
  página siempre pueda ajustar un patrón con una regla normal, sin !important ni
  selectores inflados.
  El orden de capas se declara una sola vez, al inicio de tokens.css
  (`@layer base, patrones;`), y base.css y patrones.css envuelven su contenido en
  su capa. Cada página enlaza tokens, base, patrones, interacciones y su propia
  hoja, en ese orden.
- Un patrón sube a patrones.css cuando lo piden dos páginas, no antes. Lo que
  solo usa una se queda en su hoja de página por evidente que parezca.
- No inventes valores fuera del sistema: usa los tokens de tokens.css. Si un
  valor no está, no lo escribas suelto: decide si toca añadirlo al sistema.
- Si un cambio toca un patrón compartido y afectaría a otras páginas, no lo
  toques: aplica el override acotado a la sección y repórtalo.

## Imágenes
- Toda foto o ilustración va como <img> con object-fit. Nada de fondos CSS para
  fotos o ilustraciones.

## Alcance
- Haz solo lo que se pide. No agregues elementos, secciones ni mejoras no solicitadas.
- Si algo se ve duplicado, mal escrito o mejorable fuera del alcance, repórtalo.
  No lo corrijas.

## Verificación
- No hagas comprobaciones repetidas ni ciclos de validación por tu cuenta.
  Ejecuta la tarea una vez y reporta.
- Para cambios visuales, la revisión la hace el equipo. No abras el navegador
  para valorar cómo se ve algo.
- Para diagnosticar un fallo reportado, sí levanta el servidor y mide en el
  navegador. No deduzcas la causa leyendo el CSS: repróducela.
- Si detectas un error real que impide que la tarea funcione, repórtalo.
