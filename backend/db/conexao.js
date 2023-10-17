const mongoose = require('mongoose')
const uri = 'mongodb://127.0.0.1:27017/life4partner'

async function run() {
    await mongoose.connect(uri)
    console.log('conectou com sucesso com o mongoose')
}

run().catch((err)=>console.log(err))

module.exports = mongoose;