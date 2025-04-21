module.exports = (sequelize, DataTypes) => {
    const MateriaPrima = sequelize.define("materias_primas", {
      nombre: { type: DataTypes.STRING, allowNull: false },
      cantidad: { type: DataTypes.FLOAT, allowNull: false },
      unidad: { type: DataTypes.STRING }
    });
  
    return MateriaPrima;
  };
  