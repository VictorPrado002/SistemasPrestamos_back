const express = require("express");
const router = express.Router();

//const { body, param, validationResult } = require("express-validator");


// Configurar una ruta básica
router.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
  });
  
// Obtener Datos del Cuerpo de la Solicitud
router.post('/register', (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    res.send(`Usuario creado con nombre: ${nombre} y email: ${email}`);
  });
  
module.exports = router;
