const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const db = require("./models");

// === MIDDLEWARES ===
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = { origin: '*' };
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// === IMPORTAR RUTAS ===
require('./routes')(app);

// === MANEJO DE ERRORES JSON ===
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.status(400).json({ msg: 'Error en el JSON' });
  } else {
    next();
  }
});

// === EJECUTAR SCRIPTS UNA VEZ (SI SE CONFIGURA) ===
const ejecutarScriptsUnaVez = async () => {
  try {
    if (process.env.EJECUTAR_SCRIPTS === "true") {
      console.log("⚙️ Ejecutando scripts iniciales...");

      await require("./scripts/actualizarValoracionesDesdeExcel")();
      await require("./scripts/asignarFormaFarmaceutica")();
      await require("./scripts/limpiarOtrosComponentes")();

      console.log("✅ Todos los scripts se ejecutaron correctamente.");
    }
  } catch (error) {
    console.error("❌ Error al ejecutar los scripts:", error);
  }
};

// === SYNC Y START SERVER ===
db.sequelize.sync().then(() => {
  ejecutarScriptsUnaVez(); // se ejecuta solo si la variable está activada
  app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
  });
});

