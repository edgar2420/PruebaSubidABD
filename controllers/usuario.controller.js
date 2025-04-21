const bcrypt = require("bcrypt");
const db = require('../models');

exports.createUsuario = async (req, res) => {
    const { nombre, password, role } = req.body; 

    // Validar que los datos necesarios están presentes
    if (!nombre || !password || !role) {
        return res.status(400).json({ msg: "Nombre, contraseña y rol son necesarios" });
    }

    try {
        // Verificar si ya existe un usuario con el mismo nombre
        const existingUser = await db.usuarios.findOne({ where: { nombre } });

        if (existingUser) {
            return res.status(400).json({ msg: "El nombre ya está en uso" });
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de rondas de sal

        // Crear el nuevo usuario en la base de datos
        const newUser = await db.usuarios.create({
            nombre,
            password: hashedPassword,
            role
        });

        // Retornar la respuesta
        res.status(201).json({
            msg: "Usuario creado con éxito",
            usuario: {
                id: newUser.id,
                nombre: newUser.nombre,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ msg: "Error en el servidor al crear el usuario" });
    }
};
