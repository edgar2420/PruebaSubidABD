const { especificaciones: Especificacion } = require("../models");

const limpiarClaves = (data) => {
    const resultado = {};
    const excluidos = ["columna", "unnamed"];

    for (const clave in data) {
        const claveLower = clave.toLowerCase();
        const esValido = !excluidos.some(ex => claveLower.includes(ex)) && clave.trim() !== "";

        if (esValido) {
            resultado[clave.trim()] = data[clave];
        }
    }
    return resultado;
};

async function limpiarOtrosComponentes() {
    try {
        const especificaciones = await Especificacion.findAll();

        for (const esp of especificaciones) {
            if (!esp.otros_componentes) continue;

            let originales;
            try {
                originales = JSON.parse(esp.otros_componentes);
            } catch (err) {
                console.warn(`Formato inválido en ID ${esp.id}`);
                continue;
            }

            const limpiados = limpiarClaves(originales);

            await Especificacion.update(
                { otros_componentes: JSON.stringify(limpiados) },
                { where: { id: esp.id } }
            );

            console.log(`🧹 Especificación ${esp.id} limpiada`);
        }

        console.log("✅ Limpieza finalizada.");
    } catch (error) {
        console.error("❌ Error durante la limpieza:", error);
    }
}

limpiarOtrosComponentes();
