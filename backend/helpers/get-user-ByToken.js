const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getUserByToken = async (token) => {
    try {
        if (!token) {
            return { error: "Token não fornecido" };
        }
        const decoded = jwt.verify(token, 'meusecret');
        if (!decoded.id) {
            return { error: "Token inválido" };
        }
        const userId = decoded.id;
        const user = await User.findById(userId);
        if (!user) {
            return { error: "Usuário não encontrado1" };
        }
        return user;
    } catch (error) {
        return { error: "Erro na verificação do token" };
    }
};

module.exports = getUserByToken;
