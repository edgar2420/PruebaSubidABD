const express = require("express");
const router = express.Router();
const controller = require("../controllers/frecuenciaMuestreoBase.controller");

// Ruta que lee directamente desde el Excel sin usar la BD
router.get("/producto/:producto/tipo/:tipo_estudio", controller.obtenerFrecuenciaPorProductoYTipo);

module.exports = app => {
    app.use("/frecuencia", router);
};