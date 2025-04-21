module.exports = (sequelize, DataTypes) => {
    const FrecuenciaMuestreoBase = sequelize.define("frecuencia_muestreo_base", {
      tipo_estudio: {
        type: DataTypes.ENUM(
          "ESTABILIDAD NATURAL (ESTABLE)",
          "ESTABILIDAD ACELERADA (ESTABLE)",
          "ESTABILIDAD ON GOING (ESTABLE)",
          "ESTUDIO DE EXCURSIÓN (ESTABLE)",
          "ESTABILIDAD NATURAL (MENOS ESTABLE)",
          "ESTABILIDAD ACELERADA (MENOS ESTABLE)",
          "ESTABILIDAD ON GOING (MENOS ESTABLE)",
          "ESTUDIO DE EXCURSIÓN (MENOS ESTABLE)"
        ),
        allowNull: false,
      },
      parametro: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frecuencia: {
        type: DataTypes.JSON, // Ejemplo: { "T0": 1, "T1 (6m)": 2, "T2 (12m)": 1, ... }
        allowNull: false,
      },
      numero_envases: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    return FrecuenciaMuestreoBase;
  };
  