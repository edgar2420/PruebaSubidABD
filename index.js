const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
    origin: 'http://localhost:5173',
};
app.use(cors(corsOptions));

// Middleware para archivos estáticos
app.use(express.static('public'));

// Middleware para la subida de archivos
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

// Sincronizar la base de datos
const db = require("./models");
db.sequelize.sync().then(() => {
    console.log("db resync");
});

// Importar y usar las rutas
require('./routes')(app);


// Middleware de errores en JSON
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(400).json({
            msg: 'Error en el JSON'
        });
    } else {
        next();
    }
});

// Iniciar el servidor
app.listen(3000, function () {
    console.log('Servidor corriendo en http://localhost:3000');
});
