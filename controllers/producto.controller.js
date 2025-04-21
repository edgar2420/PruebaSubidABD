const { productos: Producto, forma_farmaceutica: FormaFarmaceutica, formula_cuali_cuantitativa: Formula, materias_primas: MateriaPrima } = require('../models');
const { Op } = require("sequelize");
const fsp = require("fs").promises;
const path = require("path");
const xlsx = require("xlsx");

// Función para normalizar textos
const normalizarTexto = (texto) => {
  return texto
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        {
          model: FormaFarmaceutica,
          as: "formaFarmaceutica",
          attributes: ["nombre"]
        }
      ]
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ msg: "Error al obtener productos", error: error.message });
  }
};

// Editar producto por ID
exports.editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(req.body, { where: { id } });

    if (updated) {
      const productoActualizado = await Producto.findByPk(id);
      res.status(200).json({ msg: "Producto actualizado", producto: productoActualizado });
    } else {
      res.status(404).json({ msg: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al editar producto:", error);
    res.status(500).json({ msg: "Error al editar producto", error });
  }
};

// Eliminar producto por ID
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Producto.destroy({ where: { id } });

    if (eliminado) {
      res.status(200).json({ msg: "Producto eliminado correctamente" });
    } else {
      res.status(404).json({ msg: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ msg: "Error al eliminar producto", error });
  }
};

// Buscar productos por nombre, lote, envase o volumen
exports.buscarProductos = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ msg: "Debes enviar un parámetro de búsqueda (?q=)" });
    }

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { lote: { [Op.like]: `%${query}%` } },
          { envase: { [Op.like]: `%${query}%` } },
          { volumen: { [Op.like]: `%${query}%` } }
        ]
      }
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ msg: "Error al buscar productos", error });
  }
};

// Agregar producto manualmente (formaFarmaceutica es obligatoria aquí)
exports.agregarProducto = async (req, res) => {
  try {
    const {
      nombre, lote, envase, volumen, hermeticidad, aspecto,
      ph, conductividad, impurezas, particulas, recuentoMicrobiano,
      esterilidad, endotoxinas, observaciones, fechaAnalisis,
      formaFarmaceuticaNombre
    } = req.body;

    // Validaciones
    if (!nombre) {
      return res.status(400).json({ msg: "El nombre del producto es obligatorio" });
    }

    if (!formaFarmaceuticaNombre) {
      return res.status(400).json({ msg: "La forma farmacéutica es obligatoria" });
    }

    // Buscar o crear la forma farmacéutica
    const [formaFarmaceutica] = await FormaFarmaceutica.findOrCreate({
      where: { nombre: formaFarmaceuticaNombre },
      defaults: { nombre: formaFarmaceuticaNombre }
    });

    const nuevo = await Producto.create({
      nombre,
      lote,
      envase,
      volumen,
      hermeticidad,
      aspecto,
      ph,
      conductividad,
      impurezas,
      particulas,
      recuentoMicrobiano,
      esterilidad,
      endotoxinas,
      observaciones,
      fechaAnalisis,
      formaFarmaceuticaId: formaFarmaceutica.id,
      otros_datos: {}
    });

    res.status(201).json({
      msg: "Producto creado correctamente",
      producto: nuevo
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      msg: "Error en el servidor al crear el producto",
      error: error.message
    });
  }
};


// Obtener detalle fórmula cuali-cuantitativa por producto y volumen
exports.obtenerDetalleProducto = async (req, res) => {
  try {
    const nombreProducto = req.params.nombre;
    const nombreNormalizado = normalizarTexto(nombreProducto);

    // Obtener producto con forma farmacéutica
    const productoDB = await Producto.findOne({
      where: { nombre: nombreProducto },
      include: [{ model: FormaFarmaceutica, as: "formaFarmaceutica", attributes: ["nombre"] }],
    });

    if (!productoDB) {
      return res.status(404).json({ error: "Producto no encontrado en la base de datos." });
    }

    const formaFarmaceutica = productoDB.formaFarmaceutica?.nombre || "No asignada";

    // Obtener fórmulas cuali-cuantitativas del producto
    const formulas = await Formula.findAll({
      where: {
        productoNombre: { [Op.like]: `%${nombreProducto}%` }
      },
      include: [{ model: MateriaPrima, as: "materiasPrimas" }]
    });

    if (!formulas.length) {
      return res.status(404).json({ error: "No se encontraron fórmulas para este producto en la base de datos." });
    }

    // Preparar respuesta agrupada
    const respuesta = {
      nombre: nombreProducto,
      formaFarmaceutica,
      envasePrimario: "Ampolla de vidrio tipo I",
      volumenes: formulas.map(f => f.volumenNominal),
      formulas: formulas.map(f => ({
        volumen: f.volumenNominal,
        materiasPrimas: f.materiasPrimas.map(mp => ({
          materiaPrima: mp.nombre,
          cantidad: mp.cantidad,
          unidad: mp.unidad
        }))
      }))
    };

    res.json(respuesta);
  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    res.status(500).json({ error: "Error al procesar detalle del producto" });
  }
};
// Obtener especificaciones del producto por nombre
exports.obtenerEspecificacionesProducto = async (req, res) => {
  try {
    const nombre = req.params.nombre;
    const producto = await Producto.findOne({ where: { nombre } });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });

    const especificacion = await Especificacion.findOne({ where: { producto_id: producto.id } });
    if (!especificacion) return res.status(404).json({ msg: "Especificación no encontrada" });

    const resultado = [
      { tipo: "especificacion", nombre: "Aspecto", criterio: especificacion.aspecto },
      { tipo: "especificacion", nombre: "pH", criterio: `${especificacion.ph_min} - ${especificacion.ph_max}` },
      { tipo: "especificacion", nombre: "Volumen", criterio: "No menor a 1 ml" },
      { tipo: "especificacion", nombre: "Hermeticidad", criterio: especificacion.hermeticidad },
      { tipo: "valoracion", nombre: "Valoración de cianocobalamina", criterio: "95.0% - 115.0%" },
      { tipo: "valoracion", nombre: "Valoración de cloruro de sodio", criterio: "95.0% - 105.0%" },
      { tipo: "prueba_microbiologica", nombre: "Esterilidad", criterio: especificacion.esterilidad },
      { tipo: "prueba_microbiologica", nombre: "Endotoxinas bacterianas", criterio: especificacion.endotoxinas }
    ];

    res.json(resultado);
  } catch (error) {
    console.error("Error obteniendo especificaciones:", error);
    res.status(500).json({ msg: "Error interno", error });
  }
};
