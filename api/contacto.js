// Función serverless de Vercel: recibe el formulario de contacto en JSON y lo envía
// por correo con Resend. Valida los mismos campos y reglas que el formulario del sitio.

const { armarCorreo } = require('./_correo');

const MEDIOS = ['Eventos', 'Redes sociales', 'Google', 'Recomendación'];
// Misma expresión que usan los navegadores para validar type="email"
const CORREO = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// Devuelve los campos limpios o null si alguno no cumple las reglas
function validar(cuerpo) {
  const nombre = texto(cuerpo.nombre);
  const correo = texto(cuerpo.correo);
  const digitos = texto(cuerpo.telefono).replace(/\D/g, '');
  const mensaje = texto(cuerpo.mensaje);
  const medio = texto(cuerpo.medio);
  if (!nombre || !CORREO.test(correo) || digitos.length !== 10 || !mensaje || !MEDIOS.includes(medio)) return null;
  const telefono = `+52 ${digitos.slice(0, 2)} ${digitos.slice(2, 6)} ${digitos.slice(6)}`;
  return { nombre, correo, telefono, mensaje, medio };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const { RESEND_API_KEY, CONTACTO_DESTINO, CONTACTO_REMITENTE } = process.env;
  const faltantes = Object.entries({ RESEND_API_KEY, CONTACTO_DESTINO, CONTACTO_REMITENTE })
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);
  if (faltantes.length) {
    console.error(`api/contacto: faltan variables de entorno: ${faltantes.join(', ')}`);
    return res.status(500).json({ ok: false });
  }

  const cuerpo = req.body && typeof req.body === 'object' ? req.body : {};

  // Campo trampa: si un bot lo llenó, se responde como si se hubiera enviado
  if (texto(cuerpo.sitio)) return res.status(200).json({ ok: true });

  const datos = validar(cuerpo);
  if (!datos) return res.status(400).json({ ok: false });

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACTO_REMITENTE,
      to: CONTACTO_DESTINO.split(',').map((destino) => destino.trim()),
      reply_to: datos.correo,
      ...armarCorreo(datos),
    }),
  }).catch((error) => {
    console.error('api/contacto: no se pudo conectar con Resend', error);
    return null;
  });

  if (!respuesta?.ok) {
    if (respuesta) console.error(`api/contacto: Resend respondió ${respuesta.status}`, await respuesta.text());
    return res.status(502).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
};
