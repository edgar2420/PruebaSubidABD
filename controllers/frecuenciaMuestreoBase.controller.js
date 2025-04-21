const path = require("path");
const ExcelJS = require("exceljs");

// 🔄 Normaliza texto para comparar sin errores por tildes, mayúsculas, comillas, etc.
const normalizar = (texto = "") => {
  if (!texto || typeof texto !== "string") {
    texto = (texto?.text || texto?.result || texto?.richText?.[0]?.text || "").toString();
  }

  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/["'%]/g, "")                           // quitar comillas
    .replace(/\s+/g, " ")                            // espacios múltiples
    .trim()
    .toUpperCase();
};

exports.obtenerFrecuenciaPorProductoYTipo = async (req, res) => {
  const productoParam = normalizar(req.params.producto);
  const tipoEstudioParam = normalizar(req.params.tipo_estudio);

  console.log("🔍 Buscando producto:", productoParam);
  console.log("🔍 Buscando tipo de estudio:", tipoEstudioParam);

  try {
    const filePath = path.join(__dirname, "../uploads/CÁLCULO DE CANTIDAD DE MUESTRA PARA EL ESTUDIO NUEVO.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet("Cantidad de muestra");

    if (!sheet) {
      return res.status(404).json({ msg: "Hoja 'Cantidad de muestra' no encontrada" });
    }

    let resultados = [];

    for (let i = 1; i <= sheet.rowCount; i++) {
      const productoRaw = sheet.getRow(i).getCell(3).value;
      if (!productoRaw) continue;

      const producto = normalizar(productoRaw);
      console.log("📦 Producto en Excel:", producto);

      // Coincidencia flexible
      if (
        !producto.includes(productoParam) &&
        !productoParam.includes(producto)
      ) continue;

      console.log("✅ Coincidencia de producto encontrada:", producto);

      // 🔁 Buscar tipo de estudio entre filas siguientes (por si no está en i+2 exacto)
      let tipo = "";
      for (let k = i + 1; k <= i + 5; k++) {
        const tipoRaw = sheet.getRow(k).getCell(3).value;
        if (!tipoRaw) continue;

        const tipoNormalizado = normalizar(tipoRaw);
        console.log("📄 Tipo de estudio en Excel:", tipoNormalizado);

        if (
          tipoNormalizado.includes(tipoEstudioParam) ||
          tipoEstudioParam.includes(tipoNormalizado)
        ) {
          tipo = tipoNormalizado;
          console.log("✅ Coincidencia de tipo encontrada:", tipo);
          i = k; // actualizar posición base de lectura
          break;
        } else {
          console.log("⛔ Tipo no coincide:", tipoNormalizado, "| esperado:", tipoEstudioParam);
        }
      }

      if (!tipo) continue;

      // 🔽 Iniciar lectura de tabla desde fila i + 2
      let j = i + 2;
      while (j <= sheet.rowCount) {
        const row = sheet.getRow(j);
        const celdaParametro = row.getCell(6).value;
        if (!celdaParametro) break;

        const parametro = row.getCell(6).text || "";
        const parametroNormalizado = normalizar(parametro);

        // 🛑 Ignorar filas de prueba u otros encabezados
        if (["PRUEBA", "EJEMPLO", "ENCABEZADO"].includes(parametroNormalizado)) {
          console.log("🚫 Fila ignorada (encabezado o prueba):", parametroNormalizado);
          j++;
          continue;
        }

        resultados.push({
          parametro,
          envases: parseInt(row.getCell(7).value) || 0,
          T0: parseInt(row.getCell(8).value) || 0,
          T1: parseInt(row.getCell(9).value) || 0,
          T2: parseInt(row.getCell(10).value) || 0,
          T3: parseInt(row.getCell(11).value) || 0,
          T4: parseInt(row.getCell(12).value) || 0,
          T5: parseInt(row.getCell(13).value) || 0,
          T6: parseInt(row.getCell(14).value) || 0,
          T7: parseInt(row.getCell(15).value) || 0,
          T8: parseInt(row.getCell(16).value) || 0,
          T9: parseInt(row.getCell(17).value) || 0,
          Extra: parseInt(row.getCell(18).value) || 0,
          subtotal: parseInt(row.getCell(19).value) || 0
        });

        j++;
      }

      break; // 💡 Salir del loop después de encontrar el bloque correcto
    }

    if (!resultados.length) {
      return res.status(404).json({ msg: "No se encontraron datos para el producto y tipo de estudio" });
    }

    return res.json({ frecuencias: resultados }); // 🔑 Usa la clave que espera el frontend

  } catch (error) {
    console.error("❌ Error al procesar Excel:", error);
    return res.status(500).json({ msg: "Error al procesar el archivo", error });
  }
};
