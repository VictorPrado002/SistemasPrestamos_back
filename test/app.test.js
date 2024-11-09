const request = require("supertest");
const express = require("express");
const router = require("../routes/routes"); // Asegúrate de que la ruta al router sea correcta
const app = express();
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const db = require("../models/dataBase"); // Asegúrate de que la ruta a tu db sea correcta

// Usamos JSON en el body de las peticiones
app.use(express.json());
app.use("/api", router);

// Mock de la base de datos (puedes hacer que sea más específico)
const mockExecute = sinon.stub(db, "execute");

describe("Rutas de la API", function () {
  afterEach(function () {
    sinon.restore(); // Restaura cualquier stub o mock
  });

  // Test para la ruta GET /
  describe("GET /api/", function () {
    it("Debería devolver un mensaje de bienvenida", async function () {
      const res = await request(app).get("/api/");
      expect(res.status).to.equal(200);
      expect(res.text).to.equal("¡Hola, mundo!");
    });
  });

  // Test para la ruta POST /register
  describe("POST /api/register", function () {
    it("Debería registrar un usuario", async function () {
      const newUser = {
        nombres: "Juan",
        apellido_paterno: "Perez",
        apellido_materno: "Gomez",
        rfc: "JUAPG1234",
        edad: 30,
        estado_civil: "Soltero",
        telefono: "1234567890",
        correo: "juan.perez@example.com",
        rol: "Cliente",
        password: "password123",
      };

      mockExecute.resolves([{ affectedRows: 1, insertId: 1 }]);

      const res = await request(app).post("/api/register").send(newUser);

      expect(res.status).to.equal(201);
      expect(res.text).to.include("Usuario registrado con ID: 1");
    });

    it("Debería devolver un error si el correo ya está registrado", async function () {
      const newUser = {
        nombres: "Juan",
        apellido_paterno: "Perez",
        apellido_materno: "Gomez",
        rfc: "JUAPG1234",
        edad: 30,
        estado_civil: "Soltero",
        telefono: "1234567890",
        correo: "juanff.perez@example.com",
        rol: "Cliente",
        password: "password123",
      };

      mockExecute.resolves([[{ correo: "juan.perez@example.com" }]]);

      const res = await request(app).post("/api/register").send(newUser);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("El correo ya está registrado.");
    });
  });

  // Test para la ruta POST /login
  describe("POST /api/login", function () {
    it("Debería permitir iniciar sesión con usuario y contraseña correctos", async function () {
      const user = {
        correo: "juanff.perez@example.com",
        password: "password123",
      };

      const dbResult = [
        [
          {
            id_usuario: 1,
            rol: "Usuario",
            password: "$2b$10$V2R19l2yC2wmwEea1uG4z69HguxD9X7s2eU3Qz/UkMQ25T7rGHY/e",
          },
        ],
      ];

      mockExecute.resolves(dbResult);

      const res = await request(app).post("/api/login").send(user);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("id_usuario");
    });

    it("Debería devolver un error si el correo o contraseña son incorrectos", async function () {
      const user = {
        correo: "juan.perez@example.com",
        password: "wrongpassword",
      };

      mockExecute.resolves([[]]);

      const res = await request(app).post("/api/login").send(user);

      expect(res.status).to.equal(401);
      expect(res.text).to.equal("Correo o contraseña incorrectos");
    });
  });

  // Test para la ruta GET /usuarios
  describe("GET /api/usuarios", function () {
    it("Debería devolver una lista de usuarios", async function () {
      const mockUsers = [
        { id_usuario: 1, nombres: "Juan", apellido_paterno: "Perez" },
        { id_usuario: 2, nombres: "Maria", apellido_paterno: "Lopez" },
      ];

      mockExecute.resolves([mockUsers]);

      const res = await request(app).get("/api/usuarios");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(mockUsers);
    });
  });

  // Test para la ruta DELETE /usuario/:id/:id_usuario (solo administrador)
  describe("DELETE /api/usuario/:id/:id_usuario", function () {
    it("Debería eliminar un usuario si el usuario es administrador", async function () {
      const params = { id: 1, id_usuario: 2 };
      mockExecute.resolves([{ affectedRows: 1 }]);

      const res = await request(app).delete(`/api/usuario/1/1`);

      expect(res.status).to.equal(200);
      expect(res.text).to.equal("Usuario eliminado exitosamente");
    });

    it("Debería devolver un error si no es administrador", async function () {
      const params = { id: 1, id_usuario: 2 }; // El id_usuario no es administrador
      mockExecute.resolves([{ affectedRows: 0 }]);

      const res = await request(app).delete(`/api/usuario/1/2`);

      expect(res.status).to.equal(403);
      expect(res.text).to.equal("Acceso denegado: solo administradores pueden realizar esta acción");
    });
  });
});
