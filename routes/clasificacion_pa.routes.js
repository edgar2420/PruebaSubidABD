const express = require("express");
const router = express.Router();
const clasificacionController = require("../controllers/clasificacion_pa.controller");

// Obtener todas las clasificaciones
router.get("/obtener", clasificacionController.obtenerTodas);

// Crear una nueva clasificación
router.post("/crear", clasificacionController.crear);

// Editar clasificación por ID
router.put("/editar/:id", clasificacionController.editar);

// Eliminar clasificación por ID
router.delete("/eliminar/:id", clasificacionController.eliminar);

// Registrar el router en la app
module.exports = app => {
  app.use("/clasificacion-pa", router);
};
