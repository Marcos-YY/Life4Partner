const router = require('express').Router()
const verifyToken = require('../helpers/verify-token')
const PetsController = require('../controllers/petscontroller')
const { imageUpload } = require('../helpers/multer-upload')

router.post('/create',verifyToken, imageUpload.array("images"), PetsController.createPet)
router.get('/', PetsController.getAll)
router.get('/mypets',verifyToken, PetsController.getAllUserPets)
router.get('/myAdoption', verifyToken, PetsController.getAllUserAdoptions)
router.get('/:id', PetsController.getPetByID)
router.delete('/:id', verifyToken, PetsController.deletePetByID)
router.patch('/:id', verifyToken, imageUpload.array("images"), PetsController.editPet)
router.patch('/schedule/:id', verifyToken, PetsController.schedule)
router.patch('/finishAdoption/:id', verifyToken, PetsController.finishAdoption)

module.exports = router