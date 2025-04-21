module.exports = (sequelize, DataTypes) => {
    const Formula = sequelize.define("formula_cuali_cuantitativa", {
      productoNombre: { type: DataTypes.STRING, allowNull: false },
      volumenNominal: { type: DataTypes.STRING, allowNull: false }
    });
  
    return Formula;
  };
  