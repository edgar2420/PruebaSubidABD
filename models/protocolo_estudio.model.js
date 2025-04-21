module.exports = (sequelize, DataTypes) => {
  const ProtocoloEstudio = sequelize.define("protocolos_estudio", {
    codigo: { type: DataTypes.STRING, allowNull: false },
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
      allowNull: false
    },
    objetivo: DataTypes.TEXT,
    temperatura: {
      type: DataTypes.ENUM("40°C ± 2°C", "30°C ± 2°C", "5°C ± 3°C"),
    },
    humedad: DataTypes.STRING,
    laboratorio_fabricante: DataTypes.STRING,
    producto_nombre: DataTypes.STRING,
    sistema_envase: DataTypes.STRING,
    volumen_nominal: DataTypes.STRING,
    envase_primario: DataTypes.STRING,
    envase_secundario: DataTypes.STRING,
    formula_cuali_cuantitativa: DataTypes.JSON,
    principio_activo: DataTypes.STRING,
    clasificacion_principio: DataTypes.STRING,
    fecha_ingreso: DataTypes.DATE,
    lotes: DataTypes.JSON,
    especificaciones: DataTypes.JSON,
    frecuencia_muestreo: DataTypes.JSON,
    observaciones: DataTypes.TEXT,
    realizado_por: DataTypes.STRING,
    verificado_por: DataTypes.STRING
  });

  return ProtocoloEstudio;
};
