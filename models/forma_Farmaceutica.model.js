module.exports = (sequelize, DataTypes) => {
    const FormaFarmaceutica = sequelize.define('FormaFarmaceutica', {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    return FormaFarmaceutica;
  };