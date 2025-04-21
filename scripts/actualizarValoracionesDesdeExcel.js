const path = require("path");
const xlsx = require("xlsx");
const { especificaciones: Especificacion, productos: Producto } = require("../models");
const { Sequelize } = require("sequelize");

async function actualizarValoraciones() {
    try {
        const excelPath = path.join(__dirname, "../uploads/Valoraciones_Estructuradas_Final.xlsx");
        const workbook = xlsx.readFile(excelPath);
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(hoja, { defval: "" });

        let actualizados = 0;
        for (const fila of data) {
            const nombreProducto = fila["Producto"]?.toString().trim();
            if (!nombreProducto) continue;

            // Extraer solo las valoraciones válidas
            const valoraciones = {};
            for (const clave in fila) {
                if (clave !== "Producto" && fila[clave] !== "" && fila[clave] !== null) {
                    valoraciones[clave.trim()] = fila[clave];
                }
            }

            const producto = await Producto.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("nombre")),
                    nombreProducto.toLowerCase()
                )
            });

            if (!producto) {
                console.warn(`⚠️ Producto no encontrado: ${nombreProducto}`);
                continue;
            }

            // Buscar especificación para ese producto
            const especificacion = await Especificacion.findOne({
                where: { producto_id: producto.id }
            });

            if (!especificacion) {
                console.warn(`⚠️ No se encontró especificación para: ${nombreProducto}`);
                continue;
            }

            await especificacion.update({
                otros_componentes: JSON.stringify(valoraciones)
            });

            console.log(`✅ Valoraciones actualizadas para: ${nombreProducto}`);
            actualizados++;
        }

        console.log(`\n🎉 Valoraciones actualizadas correctamente para ${actualizados} productos.`);
    } catch (error) {
        console.error("❌ Error al actualizar valoraciones:", error);
    }
}

actualizarValoraciones();
