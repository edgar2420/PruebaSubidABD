const path = require("path");
const xlsx = require("xlsx");
const { productos: Producto, forma_farmaceutica: FormaFarmaceutica } = require("../models");
const sequelize = require(path.join(__dirname, "../config", "db.config.js"));

async function asignarFormaFarmaceutica() {
  try {
    const excelPath = path.join(__dirname, "../uploads/ESPECIFICACIONES Y BASE DE DATOS.xlsx");
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    for (const row of data) {
      const nombreProducto = row["Nombre del producto"]?.trim();
      const nombreFormaFarmaceutica = row["Forma Farmaceutica"]?.trim();

      if (!nombreProducto || !nombreFormaFarmaceutica) continue;

      const producto = await Producto.findOne({ where: { nombre: nombreProducto } });
      if (!producto) continue;

      const forma = await FormaFarmaceutica.findOne({ where: { nombre: nombreFormaFarmaceutica } });
      if (!forma) continue;

      if (producto.formaFarmaceuticaId !== forma.id) {
        producto.formaFarmaceuticaId = forma.id;
        await producto.save();
        console.log(`✔️ Asignado: ${nombreProducto} → ${nombreFormaFarmaceutica}`);
      }
    }

    console.log("✅ Asignación completada.");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error al asignar formas farmacéuticas:", error);
  }
}

asignarFormaFarmaceutica();
