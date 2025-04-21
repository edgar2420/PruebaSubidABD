const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.especificaciones = require("./especificacion.model.js")(sequelize, Sequelize);
db.auth_tokens = require("./auth_token.model.js")(sequelize, Sequelize);
db.protocolos_estudio = require("./protocolo_estudio.model.js")(sequelize, Sequelize);
db.forma_farmaceutica = require("./Forma_Farmaceutica.model.js")(sequelize, Sequelize);
db.clasificacion_pa = require("./clasificacion_pa.model.js")(sequelize, Sequelize);
db.frecuencia_muestreo_base = require("./frecuencia_muestreo_base.model.js")(sequelize, Sequelize);

// Nuevos modelos para fórmulas cuali-cuantitativas
db.formula_cuali_cuantitativa = require("./formula_cuali_cuantitativa.model.js")(sequelize, Sequelize);
db.materias_primas = require("./materia_prima.model.js")(sequelize, Sequelize);

// Relación Usuario - AuthToken
db.usuarios.hasMany(db.auth_tokens, { as: "tokens", foreignKey: "usuarioId" });
db.auth_tokens.belongsTo(db.usuarios, { foreignKey: "usuarioId", as: "usuario" });

// Relación Producto - Especificaciones
db.productos.hasMany(db.especificaciones, { as: "especificaciones", foreignKey: "producto_id" });
db.especificaciones.belongsTo(db.productos, { foreignKey: "producto_id", as: "producto" });

// Relación Producto - Protocolo Estudio
db.productos.hasMany(db.protocolos_estudio, {
  foreignKey: "productoId",
  as: "protocolos"
});
db.protocolos_estudio.belongsTo(db.productos, {
  foreignKey: "productoId",
  as: "producto"
});

// Relación Forma Farmacéutica - Producto
db.forma_farmaceutica.hasMany(db.productos, {
  foreignKey: "formaFarmaceuticaId",
  as: "productos"
});
db.productos.belongsTo(db.forma_farmaceutica, {
  foreignKey: "formaFarmaceuticaId",
  as: "formaFarmaceutica"
});

// Relación Formula ↔ Materias Primas
db.formula_cuali_cuantitativa.hasMany(db.materias_primas, {
  foreignKey: "formulaId",
  as: "materiasPrimas"
});
db.materias_primas.belongsTo(db.formula_cuali_cuantitativa, {
  foreignKey: "formulaId",
  as: "formula"
});

// Ejecutar asociaciones definidas en los modelos
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
