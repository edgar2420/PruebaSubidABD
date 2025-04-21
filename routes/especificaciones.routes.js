const express = require("express");
const router = express.Router();
const especificacionesController = require('../controllers/especificaciones.controller');

// Ruta para importar un archivo CSV o Excel
router.post("/importar", especificacionesController.importArchivo);

// Ruta para obtener todas las especificaciones
router.get('/obtener', especificacionesController.obtenerEspecificaciones);

//Ruta para buscar
router.get('/buscar', especificacionesController.buscarEspecificaciones);

//Ruta para eliminar
router.delete('/eliminar/:id', especificacionesController.eliminarEspecificacion);

//Ruta para editar especificaciones
router.put('/editar/:id', especificacionesController.editarEspecificacion);

//Ruta para obtener especificaciones por nombre de producto
router.get("/producto/:nombre_producto", especificacionesController.obtenerEspecificacionesPorProducto);


module.exports = app => {
    app.use("/especificaciones", router);
};
