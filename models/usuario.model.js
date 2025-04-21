module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuarios", {
        nombre: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        role: {
            type: Sequelize.ENUM('admin', 'publico'),
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        }
    });

    return Usuario;
};