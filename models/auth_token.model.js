module.exports = (sequelize, Sequelize) => {
    const AuthToken = sequelize.define("auth_token", {
        token: {
            type: Sequelize.STRING,
            unique: true
        },
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    return AuthToken;
}