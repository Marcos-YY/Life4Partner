const express = require('express')
const cors = require('cors')
const UserRoutes = require('./routes/UserRoutes.js')
const PetsRoutes = require('./routes/PetsRoutes.js')
const conexao = require('./db/conexao.js')
const app = express()


app.use(express.json())
// Habilita o CORS com credenciais para acesso local
app.use(cors({credentials: true, origin: "http://localhost:3000"}))
app.use(express.static('public'))

app.use('/users', UserRoutes)
app.use('/pets', PetsRoutes)

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});



