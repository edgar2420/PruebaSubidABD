const express = require("express");
const router = express.Router();
const controller = require("../controllers/protocolo.controller");

router.get("/generar-codigo", controller.generarCodigoProtocolo);


module.exports = app => {
    app.use("/productos", router);
  };
  
