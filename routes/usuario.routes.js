const express = require("express");
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Ruta para crear un usuario
router.post('/crear', usuarioController.createUsuario);

module.exports = app => {
    app.use("/usuario", router);
};
