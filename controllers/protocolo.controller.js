const path = require("path");
const xlsx = require("xlsx");

exports.generarCodigoProtocolo = async (req, res) => {
    try {
      const ultimo = await Protocolo.findOne({ order: [['createdAt', 'DESC']] });
  
      let nuevoCodigo = "PROT-001";
      if (ultimo && ultimo.codigo) {
        const numeroActual = parseInt(ultimo.codigo.split("-")[1]);
        const siguienteNumero = (numeroActual + 1).toString().padStart(3, "0");
        nuevoCodigo = `PROT-${siguienteNumero}`;
      }
  
      res.json({ codigo: nuevoCodigo });
    } catch (error) {
      console.error("Error al generar código:", error);
      res.status(500).json({ msg: "Error al generar código", error });
    }
  };
  