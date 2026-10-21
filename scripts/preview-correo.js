// Genera preview/correo-contacto.html con la misma plantilla que envía api/contacto.js.
// Uso: node scripts/preview-correo.js

const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { armarCorreo } = require('../api/_correo');

const correo = armarCorreo({
  nombre: 'Juan Pérez',
  correo: 'juan@ejemplo.com',
  telefono: '+52 55 1234 5678', // 5512345678 tal como lo deja api/contacto.js
  mensaje: 'Necesito asesoría para revisar un contrato de arrendamiento.\n¿Podrían llamarme por la tarde?',
  medio: 'Google',
});

const destino = path.join(__dirname, '..', 'preview', 'correo-contacto.html');
mkdirSync(path.dirname(destino), { recursive: true });
writeFileSync(destino, correo.html);

console.log(`Asunto: ${correo.subject}\n\n${correo.text}\n\nHTML: ${destino}`);
