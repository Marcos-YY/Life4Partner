const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
//helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserBytoken = require('../helpers/get-user-ByToken');
//funções para validação de cadastro
function isEmailValid(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}
function isPasswordValid(password) {
    // Verifique se a senha tem pelo menos 8 caracteres
    if (password.length < 8) {
        return false;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}
function isPhoneNumberValid(phone) {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(phone);
}

module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body;
        const emailExists = await User.findOne({email:email})
//verificações iniciais
        if (!name || !email || !phone || !password || !confirmpassword) {
            res.status(400).json({ "erro": "Todos os campos são obrigatórios" });
            return;
        }
//verificações campo a campo
        const fullName = name.split(' ');
        if (fullName.length < 2 || fullName[0].trim() === '' || fullName[1].trim() === '') {
            res.status(400).json({ "erro": "Por favor, forneça pelo menos nome e sobrenome" });
            return;
        }
        if (!isEmailValid(email) || emailExists) {
            res.status(400).json({ "erro": "O email fornecido não é válido ou já existe" });
            return;
        }
        if(!isPhoneNumberValid(phone)){
            res.status(400).json({ "erro": "Número de telefone no formato inválido" });
            return
        }       
        if(password !== confirmpassword){
            res.status(400).json({ "erro": "As senhas devem ser iguais" });
            return
        }
        if(!isPasswordValid(password)){
            res.status(400).json({ "erro": "As senhas devem conter 8 caracteres contendo letras e números" });
            return
        }

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })
        try {
            const createdUser = await user.save()
            await createUserToken(createdUser,req,res)

        } catch (error) {
            res.status(500).json({"erro":`${error}`})
        }
    }  
    static async login(req, res) {
        const {email, password} = req.body

        if ( !email || !password) {
            res.status(422).json({ "erro": "Preencha todos os campos para login" });
            return;
        }
        const user = await User.findOne({email:email})
        if (!isEmailValid(email) || !user) {
            res.status(422).json({ "erro": "O email fornecido não é válido ou não existe" });
            return;
        }
        const checPassword = await bcrypt.compare(password, user.password)
        if (!checPassword) {
            res.status(422).json({ "erro": "Senha inválida" });
            return;
        }
        await createUserToken(user, req, res)
    }
    static async checkUser(req,res){
        let currentUser
        if (req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, 'meusecret')
            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined
        } else {
            currentUser = null
        }
        res.status(200).send({currentUser})
    }
    static async getUserByID(req, res) {
        const id = req.params.id;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ erro: 'Id inválido' })
            return
        }

        const user = await User.findById(id).select('-password');

        try {
            if (!user) {
                res.status(400).json({ "erro": "usuário não encontrado" });
                return;
            }

            res.status(200).json({ user });
        } catch (error) {
            console.log(error)
        }
    }
    static async editUser(req,res){
        const {name, email, password, confirmpassword, phone} = req.body
        const token = getToken(req)
        const user = await getUserBytoken(token)
        const userExists = await User.findOne({email:email})   

        let image = ''
        if (req.file) {
            image = req.file.filename
            user.profileImage = image
        }

//verificações campo a campo
        if (name != null) {
            const fullName = name.split(' ');
            if (fullName.length < 2 || fullName[0].trim() === '' || fullName[1].trim() === '') {
                res.status(400).json({ message: "Por favor, forneça pelo menos nome e sobrenome" });
                return;
        }
        user.name= name
        }
        if (email != null) {
            if ((!isEmailValid(email) || (user.email !== email && userExists) )) {
                res.status(400).json({ message: "O email fornecido não é válido ou já está cadastrado" });
                return;
        }  
        user.email= email 
        }
        if (phone != null) {
        if(!isPhoneNumberValid(phone)){
            res.status(400).json({ message: "Número de telefone no formato inválido" });
            return
        }
        user.phone= phone                
        }
        if (password != null) {
            if(!isPasswordValid(password) || password !== confirmpassword){
            res.status(400).json({ message: "As senhas devem conter 8 caracteres contendo letras e números e devem ser iguais" });
            return
        }
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)
        user.password= passwordHash
        }

        try {
            await User.findByIdAndUpdate({_id: user._id},{$set: user},{new: true})
            res.status(200).json({message: "Usuário atualizado sucesso"})                      
        } catch (error) {
            res.status(502).json({message: `${error}`})                
        }
    }
}