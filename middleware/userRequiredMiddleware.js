const db = require("../models");
const jwt = require('jsonwebtoken');


exports.userRequiredMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        
        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        
        const [bearer, token] = authorization.split(" ");
        
        if (bearer !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthorized - Invalid token format" });
        }

        
        const authToken = await db.auth_tokens.findOne({ where: { token } });
        
        
        if (!authToken) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        
        const usuario = await db.usuarios.findByPk(authToken.usuarioId);

        if (!usuario) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        
        req.user = usuario;

        
        next();

    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};

