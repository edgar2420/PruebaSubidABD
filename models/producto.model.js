module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define("productos", {
    nombre: { type: DataTypes.STRING, allowNull: false },
    lote: { type: DataTypes.STRING },
    envase: { type: DataTypes.STRING },
    volumen: { type: DataTypes.INTEGER },
    hermeticidad: { type: DataTypes.STRING },
    aspecto: { type: DataTypes.TEXT },
    ph: { type: DataTypes.FLOAT },
    conductividad: { type: DataTypes.FLOAT },
    impurezas: { type: DataTypes.STRING },
    particulas: { type: DataTypes.FLOAT },
    recuentoMicrobiano: { type: DataTypes.STRING },
    esterilidad: { type: DataTypes.STRING },
    endotoxinas: { type: DataTypes.STRING },
    observaciones: { type: DataTypes.TEXT },
    fechaAnalisis: { type: DataTypes.DATE },
    otros_datos: { type: DataTypes.JSON },
    formaFarmaceuticaId: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
  return Producto;
};
