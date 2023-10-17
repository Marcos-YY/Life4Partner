const Pet = require('../models/pet')
const ObjectId = require('mongoose').Types.ObjectId
//helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-ByToken')


module.exports = class PetsController{
    static async createPet(req, res) {
        try {
        const { name, age, weight, color, description } = req.body;
        const images = req.files;
        const available = true


            
          if (!name || !age || !weight || !color || !description) {
            return res.status(400).json({ message: "Todos os dados para cadastro são obrigatórios" });
          }
          if (images && images.length > 0) {
 
            const pet = {
              images: []
            };
            // O campo images não está vazio
            images.map((image) => {
              pet.images.push(image.filename);
            });
          } else {
            // O campo images está vazio
            return res.status(422).json({ message: "Falta imagem" });
          }
      
          const token = getToken(req);
          const user = await getUserByToken(token);
      
          if (!user) {
            return res.status(401).json({ message: "Usuário não autorizado" });
          }
      
          const pet = new Pet({
            name,
            age,
            weight,
            color,
            description,
            image: images.map((image) => image.filename),
            available:available,
            user: {
              _id: user._id,
              name: user.name,
              profileImage: user.image,
              phone: user.phone,
            },
            adopters: []
          });
      
          const newPet = await pet.save();
          res.status(200).json({ message: "Pet cadastrado com sucesso", newPet });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Erro ao criar o pet" });
        }
    }     
    static async getAll(req, res){
        const pets = await Pet.find().sort("-createdAt")

        res.status(200).json({petsResgatados: pets})
    }
    static async getAllUserPets(req, res){
        const token = getToken(req)
        const user = await getUserByToken(token)
        const pets = await Pet.find({'user._id':user._id}).sort('-createdAt')
        res.status(200).json({pets})
    }
    static async getAllUserAdoptions(req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token);
    
        if (!user) {
            res.status(422).json({ message: "Erro na solicitação!" });
            return;
        }
    
        const pets = await Pet.find({
            'adopters.user._id': user._id
        }).sort('-createdAt');
    
        res.status(200).json({ pets });
    }
    static async getPetByID(req,res){
        const id = req.params.id
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ message: 'Id inválido' })
            return
        }
        //check pet
        const pet = await Pet.findById(id)
        if (!pet) {
            res.status(404).json({error: "Pet não encontrado"})
            return
        }

        res.status(200).json({petEncontrado: pet})
    }
    static async deletePetByID(req, res){
        const id = req.params.id
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ message: 'Id inválido' })
            return
        }
        //check pet
        const pet = await Pet.findById(id)
        if (!pet) {
            res.status(404).json({message: "Pet não encontrado"})
            return
        }
        const token = getToken(req)
        const user = await getUserByToken(token);   

        if (!pet || !user || pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "erro na solicitação!" });
            return;
        }
        
        await Pet.findByIdAndDelete(id)
        res.status(200).json({message: "Pet deletado com sucesso"})
    }
    static async editPet(req, res){
        const id =  req.params.id
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ message: 'Id inválido' })
            return
        }

        const pet = await Pet.findOne({_id:id});
        const { name, age, weight, color, available } = req.body
        const images = req.files;
        const updatedData = {}
        const token = getToken(req)
        const user = await getUserByToken(token);   


        if (!pet || !user || pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "error na solicitação!" });
            return;
        }         

        updatedData.name = name !== null && name !== undefined ? name : pet.name;
        updatedData.age = age !== null && age !== undefined ? age : pet.age;
        updatedData.weight = weight !== null && weight !== undefined ? weight : pet.weight;
        updatedData.color = color !== null ? color : pet.color;
        
        if (Array.isArray(images) && images.length !== 0) {
            updatedData.images = []
            images.map((image) => { updatedData.images.push(image.filename) })
        }
       
        try {
            await Pet.findByIdAndUpdate(id, updatedData)
            res.status(200).json({message: "Dados do pet atualizados" });

        } catch (error) {
            console.error("Error ao enviar resposta: ", error);
        }
    }
    static async schedule(req, res){
        const id = req.params.id;
        const pet = await Pet.findOne({ _id: id });
        const token = getToken(req);
        const user = await getUserByToken(token);
    
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ message: 'Id inválido' })
            return;
        }
    
        if (!pet || !user) {
            res.status(422).json({ message: "Erro na solicitação!" });
            return;
        }
    
        if (pet.user._id.equals(user._id)) {
            res.status(422).json({
                message: 'Você não pode agendar uma visita com seu próprio Pet!',
            });
            return;
        }
    
        if (pet.adopters.some(adopter => adopter.user._id.equals(user._id))) {
            res.status(422).json({
                message: 'Você já agendou uma visita para este Pet!',
            });
            return;
        }
    
        // Adicione o adotante ao array de adotantes
        pet.adopters.push({
            user: {
                _id: user._id,
                name: user.name,
                image: user.profileImage
            }
        });
    
        await pet.save(); 
    
        res.status(200).json({
            message: `Agendamento da visita realizada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`
        });
    }
    static async finishAdoption(req, res){
        const id = req.params.id
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            res.status(422).json({ message: 'Id inválido' })
            return
        }
        const pet = await Pet.findOne({_id: id})
        if (!pet) {
            res.status(422).json({message: "pet não encontrado"})
            return;
        }
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (!user || pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "error na solicitação!" });
            return;
        }  

        pet.available = false

        await Pet.findByIdAndUpdate(pet._id, pet)

        res.status(200).json({
        pet: pet,
        message: `Parabéns! O ciclo de adoção foi finalizado com sucesso!`,
        })
    }
}