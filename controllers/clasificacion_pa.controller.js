const db = require("../models");
const ClasificacionPA = db.clasificacion_pa;

// Obtener todas las clasificaciones
exports.obtenerTodas = async (req, res) => {
  try {
    const lista = await ClasificacionPA.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al obtener clasificaciones:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Crear nueva clasificación
exports.crear = async (req, res) => {
  try {
    const { productoNombre, clasificacion } = req.body;

    if (!productoNombre || !clasificacion) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    const nueva = await ClasificacionPA.create({ productoNombre, clasificacion });
    res.status(201).json(nueva);
  } catch (error) {
    console.error("Error al crear clasificación:", error);
    res.status(500).json({ msg: "Error al crear" });
  }
};

// Editar clasificación
exports.editar = async (req, res) => {
  try {
    const { id } = req.params;
    const { productoNombre, clasificacion } = req.body;

    const [actualizados] = await ClasificacionPA.update(
      { productoNombre, clasificacion },
      { where: { id } }
    );

    if (!actualizados) return res.status(404).json({ msg: "No encontrado" });

    const actualizado = await ClasificacionPA.findByPk(id);
    res.json(actualizado);
  } catch (error) {
    console.error("Error al editar:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Eliminar
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await ClasificacionPA.destroy({ where: { id } });

    if (!eliminado) return res.status(404).json({ msg: "No encontrado" });

    res.json({ msg: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
