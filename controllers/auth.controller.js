const bcrypt = require("bcrypt");
const db = require('../models');
const { generateToken } = require('../utils/token.utils');

exports.login = async (req, res) => {
    const { nombre, password } = req.body;

    try {
        // Buscar al usuario por su nombre
        const usuario = await db.usuarios.findOne({ where: { nombre } });

        // Verifica si el usuario existe
        if (!usuario) {
            return res.status(401).json({ msg: "Usuario o contraseña incorrectos" });
        }

        // Verifica si las contraseñas coinciden
        const isPasswordValid = await bcrypt.compare(password, usuario.password); 

        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Usuario o contraseña incorrectos" });
        }

        
        const token = generateToken(usuario);

       
        await db.auth_tokens.create({
            token,
            usuarioId: usuario.id
        });

        
        res.json({
            token,
            role: usuario.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor durante el login" });
    }
};


exports.logout = async (req, res) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const [bearer, token] = authorization.split(" ");
        
        if (bearer !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthorized - Invalid token format" });
        }

        
        const deleted = await db.auth_tokens.destroy({
            where: { token }
        });

        if (deleted === 0) {
            return res.status(400).json({ message: "Invalid token" });
        }

        res.json({ msg: "Logout successful", token });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.me = async (req, res) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const [bearer, token] = authorization.split(" ");
        
        if (bearer !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthorized - Invalid token format" });
        }

        // Buscar el token en la base de datos
        const tokenObj = await db.auth_tokens.findOne({
            where: { token }
        });

        if (!tokenObj) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        // Obtener el usuario asociado al token
        const usuario = await db.usuarios.findByPk(tokenObj.usuarioId);

        if (!usuario) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        res.json({ usuario });
    } catch (error) {
        console.error("Error in 'me' controller:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
