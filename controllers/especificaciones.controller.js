const fsp = require("fs").promises;
const path = require("path");
const xlsx = require("xlsx");
const { Op, Sequelize } = require("sequelize");
const { especificaciones: Especificacion, productos: Producto } = require("../models");

const normalizarTexto = (texto) => {
    if (!texto || typeof texto !== "string") return texto;
    return texto
        .normalize("NFD")
        .replace(/[^\w\s.%]/gi, "")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/gi, "n")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
};

const extraerNumeroDeVolumen = (texto) => {
    if (!texto || typeof texto !== "string") return null;
    const match = texto.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
};

async function procesarHoja(nombreHoja, rawData, insertados) {
    const headers = rawData[0];
    const data = rawData.slice(1);

    for (const row of data) {
        const fila = {};
        headers.forEach((h, i) => {
            if (h) fila[h] = row[i];
        });

        const normalizados = {};
        for (const key in fila) {
            normalizados[normalizarTexto(key)] = fila[key];
        }

        const nombre_producto = normalizados["nombre del producto"]?.toString().trim() || nombreHoja;
        if (!nombre_producto) continue;

        const envase = normalizados["envase"];
        const volumen = extraerNumeroDeVolumen(normalizados["volumen"]);
        const aspecto = normalizados["aspecto"];
        const hermeticidad = normalizados["hermeticidad"];
        const ph_min = parseFloat(normalizados["ph"]) || null;
        const ph_max = parseFloat(normalizados["ph max"]) || null;
        const conductividad = normalizados["conductividad"] || normalizados["conductividad2"];
        const impurezas = normalizados["impurezas"];
        const particulas = parseFloat(normalizados["particulas"]) || 0;
        const recuentoMicrobiano = normalizados["recuentomicrobiano"];
        const esterilidad = normalizados["esterilidad"] || fila["Columna35"];
        const endotoxinasRaw = fila["Columna36"] || normalizados["endotoxinas"];
        const endotoxinas = typeof endotoxinasRaw === "string" ? endotoxinasRaw.trim() : endotoxinasRaw?.toString();
        const observaciones = normalizados["observaciones"];
        const referencia_documental = normalizados["referencia documental"];
        const pruebas_microbiologicas = normalizados["pruebas microbiologicas"];

        const camposExcluidos = [
            "producto", "nombre del producto", "volumen", "envase", "aspecto", "ph",
            "conductividad", "conductividad2", "hermeticidad", "impurezas", "particulas",
            "recuentomicrobiano", "esterilidad", "endotoxinas", "observaciones",
            "referencia documental", "pruebas microbiologicas", "fecha", "ph max"
        ];

        const valoraciones = {};
        for (const key in fila) {
            const normalizado = normalizarTexto(key);
            const valor = fila[key];
            const esValoracion = valor && typeof valor === "string" &&
                !camposExcluidos.includes(normalizado) &&
                !normalizado.includes("columna") &&
                !normalizado.includes("unnamed");

            if (esValoracion) {
                valoraciones[key.trim()] = valor.trim();
            }
        }

        const [producto] = await Producto.findOrCreate({
            where: { nombre: nombre_producto },
            defaults: {
                nombre: nombre_producto,
                envase,
                volumen,
                aspecto,
                hermeticidad,
                ph: ph_min,
                conductividad,
                impurezas,
                particulas,
                recuentoMicrobiano,
                esterilidad,
                endotoxinas,
                observaciones,
                otros_componentes: JSON.stringify(valoraciones)
            }
        });

        const yaExiste = await Especificacion.findOne({
            where: {
                producto_id: producto.id,
                volumen: volumen
            }
        });

        if (yaExiste) continue;

        await Especificacion.create({
            producto_id: producto.id,
            volumen,
            aspecto,
            hermeticidad,
            ph_min,
            ph_max,
            conductividad,
            impurezas,
            pruebas_microbiologicas,
            esterilidad,
            endotoxinas,
            referencia_documental,
            otros_componentes: JSON.stringify(valoraciones)
        });

        insertados.count++;
    }
}


exports.importArchivo = async (req, res) => {
    try {
        if (!req.files?.file) {
            return res.status(400).json({ msg: "No se subió ningún archivo" });
        }

        const file = req.files.file;
        const ext = path.extname(file.name).toLowerCase();
        const uploadDir = path.join(__dirname, "..", "uploads");
        await fsp.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, `${Date.now()}_${file.name}`);
        await file.mv(filePath);

        if (ext !== ".xlsx") {
            return res.status(400).json({ msg: "Solo se permite archivos .xlsx por ahora." });
        }

        const workbook = xlsx.readFile(filePath);
        const insertados = { count: 0 };

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const raw = xlsx.utils.sheet_to_json(sheet, { defval: "", header: 1 });
            if (raw.length > 1) {
                await procesarHoja(sheetName, raw, insertados);
            }
        }

        await fsp.unlink(filePath);

        res.status(201).json({
            success: true,
            msg: "Archivo importado correctamente",
            registros: insertados.count
        });

    } catch (error) {
        console.error("Error al importar archivo:", error);
        res.status(500).json({
            success: false,
            msg: "Error al procesar el archivo",
            error: error.message
        });
    }
};

exports.obtenerEspecificaciones = async (req, res) => {
    try {
        const especificaciones = await Especificacion.findAll({
            include: {
                model: Producto,
                as: "producto",
                attributes: ["nombre"]
            }
        });

        const data = especificaciones.map((e) => ({
            id: e.id,
            nombre_producto: e.producto?.nombre || "N/A",
            volumen: e.volumen,
            aspecto: e.aspecto,
            hermeticidad: e.hermeticidad,
            ph_min: e.ph_min,
            ph_max: e.ph_max,
            conductividad: e.conductividad,
            impurezas: e.impurezas,
            pruebas_microbiologicas: e.pruebas_microbiologicas,
            esterilidad: e.esterilidad,
            endotoxinas: e.endotoxinas,
            referencia_documental: e.referencia_documental,
            otros_componentes: e.otros_componentes,
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error("Error al obtener especificaciones:", error);
        res.status(500).json({ msg: "Error al obtener especificaciones", error });
    }
};

exports.eliminarEspecificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Especificacion.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ msg: "Especificación no encontrada" });
        }

        res.status(200).json({ msg: "Especificación eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar especificación:", error);
        res.status(500).json({ msg: "Error al eliminar especificación", error });
    }
};

exports.editarEspecificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Especificacion.update(req.body, {
            where: { id },
        });

        if (!updated) {
            return res.status(404).json({ msg: "Especificación no encontrada" });
        }

        const especificacionActualizada = await Especificacion.findByPk(id, {
            include: { model: Producto, as: "producto", attributes: ["nombre"] }
        });

        res.status(200).json({ msg: "Especificación actualizada", especificacion: especificacionActualizada });
    } catch (error) {
        console.error("Error al editar especificación:", error);
        res.status(500).json({ msg: "Error al editar especificación", error });
    }
};

exports.buscarEspecificaciones = async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || "";

        const especificaciones = await Especificacion.findAll({
            include: {
                model: Producto,
                as: "producto",
                attributes: ["nombre"],
                where: {
                    nombre: { [Op.like]: `%${query}%` }
                }
            }
        });

        const data = especificaciones.map((e) => ({
            id: e.id,
            nombre_producto: e.producto?.nombre || "N/A",
            volumen: e.volumen,
            aspecto: e.aspecto,
            hermeticidad: e.hermeticidad,
            ph_min: e.ph_min,
            ph_max: e.ph_max,
            conductividad: e.conductividad,
            impurezas: e.impurezas,
            pruebas_microbiologicas: e.pruebas_microbiologicas,
            esterilidad: e.esterilidad,
            endotoxinas: e.endotoxinas,
            referencia_documental: e.referencia_documental,
            otros_componentes: e.otros_componentes,
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error("Error al buscar especificaciones:", error);
        res.status(500).json({ msg: "Error al buscar especificaciones", error });
    }
};


//* Obtiene las especificaciones de un producto específico por su nombre
exports.obtenerEspecificacionesPorProducto = async (req, res) => {
    try {
      const nombre = req.params.nombre_producto;
  
      const producto = await Producto.findOne({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('nombre')),
          nombre.toLowerCase()
        )
      });
  
      if (!producto) {
        return res.status(404).json({ msg: "Producto no encontrado" });
      }
  
      const especificaciones = await Especificacion.findAll({
        where: {
          producto_id: producto.id
        }
      });
  
      res.json(especificaciones);
    } catch (error) {
      console.error("Error al obtener especificaciones del producto:", error);
      res.status(500).json({ msg: "Error al obtener especificaciones", error: error.message });
    }
  };
  