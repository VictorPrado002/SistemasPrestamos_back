const express = require("express");
const router = express.Router();

const { body, param, validationResult } = require("express-validator");


// Configurar una ruta básica
app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
  });
  
// . Obtener Datos del Cuerpo de la Solicitud
app.post('/crear-usuario', (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    res.send(`Usuario creado con nombre: ${nombre} y email: ${email}`);
  });
  
module.exports = router;
