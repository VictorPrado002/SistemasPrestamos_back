//routes.

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../models/dataBase");

// Configurar una ruta básica
router.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
  });
  // Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'Administrador') {
      return res.status(403).send("Acceso denegado");
    }
    next();
  };
  
  // Ruta para registrar un usuario
  router.post('/register', async (req, res) => {
    try {
      const { nombres, apellido_paterno, apellido_materno, rfc, edad, estado_civil, telefono, correo, rol, password } = req.body;
  
      if (!password) {
        return res.status(400).json({ error: 'La contraseña es requerida.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña
  
      const [result] = await db.execute(
        `INSERT INTO Usuario (nombres, apellido_paterno, apellido_materno, rfc, edad, estado_civil, telefono, correo, fecha_alta, rol, password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [nombres, apellido_paterno, apellido_materno, rfc, edad, estado_civil, telefono, correo, rol, hashedPassword]
      );
  
      res.status(201).send(`Usuario registrado con ID: ${result.insertId}`);
    } catch (error) {
      console.error('Error al registrar usuario:', error.message);
      res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
    }
  });
  
  // Ruta para el login
  router.post('/login', async (req, res) => {
    const { correo, password } = req.body;
  
    try {
      const [rows] = await db.execute('SELECT * FROM Usuario WHERE correo = ?', [correo]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send("Correo o contraseña incorrectos");
      }
      // Guarda información del usuario en req.user
      req.user = user;
      res.status(200).send("Inicio de sesión exitoso");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Rutas de acceso a las tablas
  router.get('/usuarios', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM Usuario');
      res.json(rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  router.get('/bancos', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM Banco');
      res.json(rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  router.get('/historial', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM Historial');
      res.json(rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  router.get('/cotizaciones', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM Cotizacion');
      res.json(rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Rutas para altas, bajas y cambios solo para el administrador
  
  // Crear un nuevo banco (solo administrador)
  router.post('/banco', isAdmin, async (req, res) => {
    const { nombre, tasa_interes } = req.body;
    try {
      const [result] = await db.execute(
        `INSERT INTO Banco (nombre, tasa_interes) VALUES (?, ?)`,
        [nombre, tasa_interes]
      );
      res.status(201).send(`Banco creado con ID: ${result.insertId}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Eliminar un usuario (solo administrador)
  router.delete('/usuario/:id', isAdmin, async (req, res) => {
    try {
      const [result] = await db.execute(`DELETE FROM Usuario WHERE id_usuario = ?`, [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.send("Usuario eliminado exitosamente");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Actualizar un banco (solo administrador)
  router.put('/banco/:id', isAdmin, async (req, res) => {
    const { nombre, tasa_interes } = req.body;
    try {
      const [result] = await db.execute(
        `UPDATE Banco SET nombre = ?, tasa_interes = ? WHERE id_banco = ?`,
        [nombre, tasa_interes, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).send("Banco no encontrado");
      }
      res.send("Banco actualizado exitosamente");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
module.exports = router;
