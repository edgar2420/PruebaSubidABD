const path = require("path");
const fsp = require("fs").promises;
const xlsx = require("xlsx");
const { Op, Sequelize } = require("sequelize");
const db = require("../models");

const Formula = db.formula_cuali_cuantitativa;
const MateriaPrima = db.materias_primas;

// 🔧 Normalizar texto
const normalizarTexto = (texto) => {
  return texto
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// 🔹 Obtener fórmulas por nombre de producto (individual)
exports.obtenerFormulasPorProducto = async (req, res) => {
  try {
    const nombre = req.params.nombre;
    const nombreNormalizado = normalizarTexto(nombre);

    console.log("📥 Buscando fórmulas para:", nombreNormalizado);

    const todas = await Formula.findAll({
      include: [{ model: MateriaPrima, as: "materiasPrimas" }]
    });

    const coincidencias = todas.filter(f =>
      normalizarTexto(f.productoNombre) === nombreNormalizado
    );

    console.log("🔎 Coincidencias encontradas:", coincidencias.length);

    res.json(coincidencias);
  } catch (error) {
    console.error("❌ Error al obtener fórmulas:", error);
    res.status(500).json({ msg: "Error al obtener fórmulas", error });
  }
};

// 🔹 Obtener TODAS las fórmulas con paginación
exports.obtenerTodasLasFormulas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Formula.findAndCountAll({
      include: [{ model: db.materias_primas, as: "materiasPrimas" }],
      limit,
      offset
    });

    res.status(200).json({
      data: rows,
      total: count,
      currentPage: page
    });
  } catch (error) {
    console.error("❌ Error al obtener todas las fórmulas:", error);
    res.status(500).json({ msg: "Error al obtener todas las fórmulas" });
  }
};

// 🔹 Crear una nueva fórmula manualmente
exports.crearFormula = async (req, res) => {
  try {
    const { productoNombre, volumenNominal, materiasPrimas } = req.body;

    const nuevaFormula = await Formula.create({ productoNombre, volumenNominal });

    if (Array.isArray(materiasPrimas)) {
      for (const mp of materiasPrimas) {
        await MateriaPrima.create({
          nombre: mp.nombre,
          cantidad: mp.cantidad,
          unidad: mp.unidad,
          formulaId: nuevaFormula.id
        });
      }
    }

    const resultado = await Formula.findByPk(nuevaFormula.id, {
      include: [{ model: MateriaPrima, as: "materiasPrimas" }]
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error("❌ Error al crear fórmula:", error);
    res.status(500).json({ msg: "Error al crear fórmula", error });
  }
};

// 🔹 Importar fórmulas desde archivo Excel subido
exports.importarDesdeExcel = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ msg: "No se envió ningún archivo Excel" });
    }

    const file = req.files.file;

    if (!file.name.endsWith(".xlsx")) {
      return res.status(400).json({ msg: "Solo se permiten archivos .xlsx" });
    }

    const uploadPath = path.join(__dirname, "../uploads", `${Date.now()}_${file.name}`);
    await file.mv(uploadPath);

    const workbook = xlsx.readFile(uploadPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    let bloqueActual = null;
    const insertados = [];

    for (const row of data) {
      const nombre = row["Nombre del producto"]?.toString().trim();
      const volumen = row["Volumen nominal"]?.toString().trim();
      const materiaPrima = row["MATERIA PRIMA"]?.toString().trim();

      if (nombre && volumen) {
        bloqueActual = await Formula.create({
          productoNombre: nombre,
          volumenNominal: volumen
        });
        insertados.push({ nombre, volumen, id: bloqueActual.id });
      }

      if (bloqueActual && materiaPrima) {
        await MateriaPrima.create({
          nombre: materiaPrima,
          cantidad: parseFloat(row["Cantidad"]) || 0,
          unidad: row["Unidad"] || "",
          formulaId: bloqueActual.id
        });
      }
    }

    await fsp.unlink(uploadPath);

    res.status(201).json({
      msg: "Importación completada correctamente",
      formulas: insertados
    });

  } catch (error) {
    console.error("❌ Error al importar fórmula desde Excel:", error);
    res.status(500).json({ msg: "Error al importar fórmula", error: error.message });
  }
};
