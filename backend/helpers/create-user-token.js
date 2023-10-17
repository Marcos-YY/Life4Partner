const jwt = require('jsonwebtoken')
const passWtoken = 'meusecret'

const createUserToken = async (user, req, res) =>{
    const token = jwt.sign({
        name: user.name,
        id: user.id
    }, passWtoken)

//return token
    res.status(200).json({
        message: "Você está autenticado",
        token: token,
        userId: user._id
    })
}

module.exports = createUserToken;