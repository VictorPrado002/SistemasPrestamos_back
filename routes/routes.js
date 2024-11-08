//routes.

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../models/dataBase");

// Configurar una ruta básica
router.get("/", (req, res) => {
  res.send("¡Hola, mundo!");
});
// Middleware para verificar si el usuario es administrador
// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== "Administrador") {
    return res.status(403).send("Acceso denegado");
  }
  next();
};


// Ruta para registrar un usuario
router.post("/register", async (req, res) => {
  try {
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      rfc,
      edad,
      estado_civil,
      telefono,
      correo,
      rol,
      password,
    } = req.body;

    if (!password) {
      return res.status(400).json({ error: "La contraseña es requerida." });
    }
    // Verificar si el correo ya está registrado
    const [
      existingUser,
    ] = await db.execute(`SELECT * FROM Usuario WHERE correo = ?`, [correo]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña

    const [result] = await db.execute(
      `INSERT INTO Usuario (nombres, apellido_paterno, apellido_materno, rfc, edad, estado_civil, telefono, correo, fecha_alta, rol, password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        nombres,
        apellido_paterno,
        apellido_materno,
        rfc,
        edad,
        estado_civil,
        telefono,
        correo,
        rol,
        hashedPassword,
      ]
    );

    res.status(201).send(`Usuario registrado con ID: ${result.insertId}`);
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al registrar el usuario" });
  }
});

// Ruta para el login
router.post("/login", async (req, res) => {
  const { correo, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM Usuario WHERE correo = ?", [
      correo,
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Correo o contraseña incorrectos");
    }
    // Guarda información del usuario en req.user
    req.user = user;
    res.status(200).send({ id_usuario: user.id_usuario, rol: user.rol});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rutas de acceso a las tablas
router.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Usuario");
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/bancos", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Banco");
    const formattedRows = rows.map((row) => ({
      ...row,
      years: row.years.split(",").map(Number), // Convierte "years" en un arreglo de números
      tasa_interes: parseFloat(row.tasa_interes.toFixed(1)),
      enganche: parseFloat(row.enganche.toFixed(1)),
    }));

    res.json(formattedRows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/historial", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Historial");
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// routes.js
router.post("/savecotizacion", async (req, res) => {
  const {
    monto_casa,
    monto_credito,
    mensualidad,
    tipo_cotizacion,
    monto_total,
    sueldo_mensual,
    year, // o plazo, dependiendo de tu esquema de base de datos
    id_banco,
    id_usuario,
  } = req.body;

  try {
    // Paso 1: Insertar en la tabla historial
    const [
      historialResult,
    ] = await db.execute(
      `INSERT INTO historial (fecha_creacion, id_usuario) VALUES (NOW(), ?)`,
      [id_usuario]
    );

    const id_historial = historialResult.insertId; // Obtener el id_historial generado

    // Paso 2: Insertar en la tabla cotizacion
    const [cotizacionResult] = await db.execute(
      `INSERT INTO cotizacion (monto_casa, monto_credito, mensualidad, tipo_cotizacion, monto_total, sueldo_mensual, year, id_banco, id_historial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        monto_casa,
        monto_credito,
        mensualidad,
        tipo_cotizacion,
        monto_total,
        sueldo_mensual || null, // Asegurarse de que sea nulo si no se proporciona
        year,
        id_banco,
        id_historial,
      ]
    );

    res
      .status(201)
      .json({
        message: "Cotización guardada exitosamente",
        id_cotizacion: cotizacionResult.insertId,
      });
  } catch (error) {
    console.error("Error al guardar la cotización:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al guardar la cotización" });
  }
});

router.get("/cotizaciones/:id_usuario", async (req, res) => {
    const { id_usuario } = req.params;
  
    try {
      // Verificar si el usuario existe en la base de datos
      const [userResult] = await db.execute(
        `SELECT id_usuario FROM Usuario WHERE id_usuario = ?`,
        [id_usuario]
      );
  
      if (userResult.length === 0) {
        // Si el usuario no existe, retornar un error
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      // Consultar el historial, cotizaciones y datos del banco del usuario
      const [cotizacionesResult] = await db.execute(
        `SELECT h.fecha_creacion, c.*, b.nombre AS banco_nombre, b.tasa_interes, b.years, b.enganche
         FROM Historial h
         JOIN Cotizacion c ON h.id_historial = c.id_historial
         JOIN Banco b ON c.id_banco = b.id_banco
         WHERE h.id_usuario = ?
         ORDER BY h.fecha_creacion DESC`,
        [id_usuario]
      );
  
      // Formatear la respuesta para incluir fecha, cotizaciones y detalles del banco
      const formattedResponse = cotizacionesResult.reduce((acc, row) => {
        const fecha = row.fecha_creacion.toISOString().split("T")[0]; // Formatear la fecha en YYYY-MM-DD
        const cotizacion = {
          id_cotizacion: row.id_cotizacion,
          monto_casa: row.monto_casa,
          monto_credito: row.monto_credito,
          mensualidad: row.mensualidad,
          tipo_cotizacion: row.tipo_cotizacion,
          monto_total: row.monto_total,
          sueldo_mensual: row.sueldo_mensual,
          years: row.year, // Mostrar `years` como un valor único
          banco: {
            nombre: row.banco_nombre,
            tasa_interes: parseFloat(row.tasa_interes.toFixed(1)),
            enganche: parseFloat(row.enganche.toFixed(1))
          }
        };
  
        // Agrupar las cotizaciones por fecha
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(cotizacion);
  
        return acc;
      }, {});
  
      res.json(formattedResponse);
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error.message);
      res.status(500).json({ error: "Error en el servidor al obtener cotizaciones" });
    }
  });
  
// Rutas para altas, bajas y cambios solo para el administrador

// Eliminar un usuario (solo administrador)
router.delete("/usuario/:id", isAdmin, async (req, res) => {
  try {
    const [
      result,
    ] = await db.execute(`DELETE FROM usuario WHERE id_usuario = ?`, [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.send("Usuario eliminado exitosamente");
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Crear un nuevo banco (solo administrador)
router.post("/addbanco", isAdmin, async (req, res) => {
  const { nombre, tasa_interes } = req.body;
  try {
    const [
      result,
    ] = await db.execute(
      `INSERT INTO Banco (nombre, tasa_interes) VALUES (?, ?)`,
      [nombre, tasa_interes]
    );
    res.status(201).send(`Banco creado con ID: ${result.insertId}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Actualizar un banco (solo administrador)
router.put("/editbanco/:id", isAdmin, async (req, res) => {
  const { nombre, tasa_interes } = req.body;
  try {
    const [
      result,
    ] = await db.execute(
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
// Eliminar un banco (solo administrador)
router.delete("/deletebanco/:id", isAdmin, async (req, res) => {
  try {
    const [result] = await db.execute(`DELETE FROM Banco WHERE id_banco = ?`, [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).send("Banco no encontrado");
    }
    res.send("Banco eliminado exitosamente");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/cotizacion/:id_cotizacion", async (req, res) => {
  const { id_cotizacion } = req.params;

  try {
    // Primero, obtenemos el id_historial relacionado a la cotización
    const [cotizacionResult] = await db.execute(
      SELECT `id_historial FROM cotizacion WHERE id_cotizacion = ?`,
      [id_cotizacion]
    );

    if (cotizacionResult.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const id_historial = cotizacionResult[0].id_historial;

    // Eliminamos la entrada en historial, lo cual también eliminará la cotización
    await db.execute(DELETE `FROM historial WHERE id_historial = ?`, [id_historial]);

    res.status(200).json({ message: "Cotización y su historial eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la cotización:", error.message);
    res.status(500).json({ error: "Error en el servidor al eliminar la cotización" });
  }
});
module.exports = router;
