module.exports = (sequelize, DataTypes) => {
    const ClasificacionPA = sequelize.define("clasificacion_pa", {
      productoNombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      clasificacion: {
        type: DataTypes.ENUM("ESTABLE", "MENOS ESTABLE"),
        allowNull: false,
      },
    });
  
    return ClasificacionPA;
  };
  