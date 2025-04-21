module.exports = app => {
    require("./usuario.routes")(app); // Rutas de usuarios
    require("./producto.routes")(app); // Rutas de Producto
    require("./auth.routes")(app); // Rutas de autenticación
    require("./especificaciones.routes")(app); // Rutas de especificaciones
    require("./frecuenciaMuestreoBase.routes")(app); // Rutas de frecuencia de muestreo base
    require("./formula.routes")(app); // Rutas de fórmulas cuali-cuantitativas
    require("./formaFarmaceutica.routes")(app); // Rutas de formas farmacéuticas
    require("./clasificacion_pa.routes")(app); // Rutas de clasificación de productos
    require("./protocolo.routes")(app); // Rutas de protocolos

};