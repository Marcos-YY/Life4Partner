const router = require('express').Router()
const Usercontroller = require('../controllers/userController.js')
const { imageUpload } = require('../helpers/multer-upload.js')
//midleware
const checkToken = require('../helpers/verify-token.js')

router.post('/register', Usercontroller.register)
router.post('/login', Usercontroller.login)
router.get('/checkuser', Usercontroller.checkUser)
router.get('/:id', Usercontroller.getUserByID)
router.patch('/edit/:id', checkToken, imageUpload.single("image") , Usercontroller.editUser)

module.exports = router;
