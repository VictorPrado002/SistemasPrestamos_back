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
const isAdmin = (req, res, next) => {
  if (req.user.rol !== "Administrador") {
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
    res.status(200).send({ id_usuario: user.id_usuario });
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

router.get("/cotizaciones", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Cotizacion");
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.post("/savecotizacion", async (req, res) => {
  const {
    monto_casa,
    monto_credito,
    mensualidad,
    tipo_cotizacion,
    monto_total,
    sueldo_mensual,
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
      `INSERT INTO cotizacion (monto_casa, monto_credito, mensualidad, tipo_cotizacion, monto_total, sueldo_mensual, id_banco, id_historial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        monto_casa,
        monto_credito,
        mensualidad,
        tipo_cotizacion,
        monto_total,
        sueldo_mensual,
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
    // Consulta para obtener las cotizaciones y la fecha de creación de cada historial asociado al usuario
    const [rows] = await db.execute(
      `SELECT h.fecha_creacion, 
                c.monto_casa, 
                c.monto_credito, 
                c.mensualidad, 
                c.tipo_cotizacion, 
                c.monto_total, 
                c.sueldo_mensual, 
                c.id_banco
         FROM cotizacion c
         JOIN historial h ON c.id_historial = h.id_historial
         WHERE h.id_usuario = ?
         ORDER BY h.fecha_creacion ASC`, // Ordenamos por fecha
      [id_usuario]
    );

    // Transformamos el resultado para que tenga el formato deseado
    const result = rows.reduce((acc, row) => {
      // Buscamos si ya existe un grupo para esta fecha
      const existingDateGroup = acc.find(
        (group) => group.fecha === row.fecha_creacion
      );

      const cotizacionData = {
        monto_casa: row.monto_casa,
        monto_credito: row.monto_credito,
        mensualidad: row.mensualidad,
        tipo_cotizacion: row.tipo_cotizacion,
        monto_total: row.monto_total,
        sueldo_mensual: row.sueldo_mensual,
        id_banco: row.id_banco,
      };

      if (existingDateGroup) {
        // Si ya existe la fecha, agregamos la cotización a ese grupo
        existingDateGroup.cotizaciones.push(cotizacionData);
      } else {
        // Si no existe, creamos un nuevo grupo de fecha
        acc.push({
          fecha: row.fecha_creacion,
          cotizaciones: [cotizacionData],
        });
      }

      return acc;
    }, []);

    res.json(result);
  } catch (error) {
    console.error("Error al obtener las cotizaciones:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al obtener las cotizaciones" });
  }
});

// Rutas para altas, bajas y cambios solo para el administrador

// Eliminar un usuario (solo administrador)
router.delete("/usuario/:id", isAdmin, async (req, res) => {
  try {
    const [
      result,
    ] = await db.execute(`DELETE FROM Usuario WHERE id_usuario = ?`, [
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
module.exports = router;
