module.exports = {
    isRequestValid: (requiredFields, body, res) => {
        for (const field of requiredFields) {
            if (body[field] === null || body[field] === undefined) {
                res.status(400).json({
                    msg: `Falta el campo ${field}`
                });
                return false;
            }
        }
        return true;
    },
    sendError500: (error, res) => {
        console.error('Error:', error);
        res.status(500).json({
            msg: 'Error en el servidor',
            error: error.message
        });
    },
};
