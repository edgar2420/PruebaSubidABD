module.exports = (sequelize, DataTypes) => {
  const Especificacion = sequelize.define("especificaciones", {
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    volumen: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    aspecto: DataTypes.STRING,
    hermeticidad: DataTypes.TEXT, 
    ph_min: DataTypes.FLOAT,
    ph_max: DataTypes.FLOAT,
    conductividad: DataTypes.STRING,
    impurezas: DataTypes.STRING,
    pruebas_microbiologicas: DataTypes.STRING,
    esterilidad: DataTypes.STRING,
    endotoxinas: DataTypes.STRING,
    referencia_documental: DataTypes.TEXT,
    otros_componentes: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  return Especificacion;
};
