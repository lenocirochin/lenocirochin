// Plantilla del correo de contacto. La usan api/contacto.js y scripts/preview-correo.js.
// El guion bajo inicial evita que Vercel la publique como función.
// Los colores son los de assets/css/tokens.css en hex: los clientes de correo no leen
// variables CSS. Estilos en línea y maquetación con tablas, sin imágenes externas.

const COLOR_PRIMARIO = '#173248';
const COLOR_SECUNDARIO = '#54595F';
const COLOR_ACENTO = '#FF914D';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_TEXTO = '#212529';
const COLOR_FONDO_SUAVE = '#F4F4F4';
const COLOR_LINEA = '#E6E6E6';
const FUENTE = 'Arial, Helvetica, sans-serif';

const escapar = (valor) => valor
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const conSaltos = (valor) => escapar(valor).replace(/\n/g, '<br>');

const formatoFecha = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  dateStyle: 'long',
  timeStyle: 'short',
});

// datos: campos ya validados (el teléfono llega con +52). fecha: momento del envío.
function armarCorreo({ nombre, correo, telefono, mensaje, medio }, fecha = new Date()) {
  const enviado = `${formatoFecha.format(fecha)} (hora de Ciudad de México)`;
  // Correo y teléfono llevan enlace: mailto: y WhatsApp con el número de la persona
  const campos = [
    ['Nombre', nombre],
    ['Correo electrónico', correo, `mailto:${correo}`],
    ['Teléfono', telefono, `https://wa.me/${telefono.replace(/\D/g, '')}`],
    ['Cómo se enteró', medio],
  ];

  const subject = `Nueva solicitud de contacto — ${nombre}`;

  const text = [
    'Lenoci & Rochin Abogados',
    'Nueva solicitud de contacto',
    '',
    ...campos.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
    '',
    'Mensaje:',
    mensaje,
    '',
    '—',
    `Enviado el ${enviado} desde el formulario de lenocirochin.com.`,
  ].join('\n');

  const valorHtml = (valor, enlace) => (enlace
    ? `<a href="${escapar(enlace)}" style="color:${COLOR_PRIMARIO};text-decoration:underline;">${escapar(valor)}</a>`
    : conSaltos(valor));

  const filas = campos.map(([etiqueta, valor, enlace], indice) => `
              <tr>
                <td style="width:38%;padding:12px 16px;${indice ? `border-top:1px solid ${COLOR_LINEA};` : ''}font-family:${FUENTE};font-size:14px;line-height:20px;color:${COLOR_SECUNDARIO};vertical-align:top;">${etiqueta}</td>
                <td style="padding:12px 16px;${indice ? `border-top:1px solid ${COLOR_LINEA};` : ''}font-family:${FUENTE};font-size:15px;line-height:20px;color:${COLOR_TEXTO};vertical-align:top;">${valorHtml(valor, enlace)}</td>
              </tr>`).join('');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapar(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_FONDO_SUAVE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR_FONDO_SUAVE};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${COLOR_BLANCO};border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background-color:${COLOR_PRIMARIO};border-bottom:3px solid ${COLOR_ACENTO};font-family:${FUENTE};font-size:22px;line-height:28px;font-weight:bold;letter-spacing:0.5px;color:${COLOR_BLANCO};">Lenoci &amp; Rochin Abogados</td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0 0 20px;font-family:${FUENTE};font-size:20px;line-height:26px;font-weight:bold;color:${COLOR_PRIMARIO};">Nueva solicitud de contacto</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${COLOR_LINEA};border-radius:6px;border-collapse:separate;">${filas}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;">
              <p style="margin:0 0 8px;font-family:${FUENTE};font-size:14px;line-height:20px;color:${COLOR_SECUNDARIO};">Mensaje</p>
              <div style="padding:16px;background-color:${COLOR_FONDO_SUAVE};border-left:3px solid ${COLOR_PRIMARIO};border-radius:4px;font-family:${FUENTE};font-size:15px;line-height:24px;color:${COLOR_TEXTO};">${conSaltos(mensaje)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${COLOR_LINEA};font-family:${FUENTE};font-size:12px;line-height:18px;color:${COLOR_SECUNDARIO};">Enviado el ${escapar(enviado)} desde el formulario de lenocirochin.com.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, text, html };
}

module.exports = { armarCorreo };
