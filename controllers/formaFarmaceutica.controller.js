const db = require("../models");
const FormaFarmaceutica = db.forma_farmaceutica;

// Obtener todas
exports.obtenerFormasFarmaceuticas = async (req, res) => {
  try {
    const formas = await FormaFarmaceutica.findAll({
      attributes: ["id", "nombre"],
      order: [["nombre", "ASC"]],
    });
    res.json(formas);
  } catch (error) {
    console.error("Error al obtener formas farmacéuticas:", error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Crear nueva
exports.crearFormaFarmaceutica = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ msg: "El nombre es obligatorio" });

    const existente = await FormaFarmaceutica.findOne({ where: { nombre } });
    if (existente) return res.status(400).json({ msg: "Ya existe esa forma farmacéutica" });

    const nueva = await FormaFarmaceutica.create({ nombre });
    res.status(201).json(nueva);
  } catch (error) {
    console.error("Error al crear forma farmacéutica:", error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Editar existente
exports.editarFormaFarmaceutica = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const actualizada = await FormaFarmaceutica.update(
      { nombre },
      { where: { id } }
    );

    if (!actualizada[0]) {
      return res.status(404).json({ msg: "Forma farmacéutica no encontrada" });
    }

    const forma = await FormaFarmaceutica.findByPk(id);
    res.json(forma);
  } catch (error) {
    console.error("Error al editar forma farmacéutica:", error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};

// Eliminar
exports.eliminarFormaFarmaceutica = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await FormaFarmaceutica.destroy({ where: { id } });

    if (!eliminado) {
      return res.status(404).json({ msg: "Forma farmacéutica no encontrada" });
    }

    res.json({ msg: "Forma farmacéutica eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar forma farmacéutica:", error);
    res.status(500).json({ msg: "Error en el servidor", error });
  }
};
