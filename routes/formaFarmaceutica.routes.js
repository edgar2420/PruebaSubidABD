const express = require("express");
const router = express.Router();
const controller = require("../controllers/formaFarmaceutica.controller");

router.get("/obtener", controller.obtenerFormasFarmaceuticas);
router.post("/crear", controller.crearFormaFarmaceutica);
router.put("/editar/:id", controller.editarFormaFarmaceutica);
router.delete("/eliminar/:id", controller.eliminarFormaFarmaceutica);

module.exports = app => {
  app.use("/forma-farmaceutica", router);
};
