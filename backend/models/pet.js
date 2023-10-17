const mongoose = require('mongoose');
const { Schema } = mongoose; 

const AdopterSchema = new Schema({
    user: Object,
});

const PetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    available: {
        type: Boolean
    },
    user: Object, 
    adopters: [AdopterSchema]
}, { timestamps: true });

const Pet = mongoose.model("pets", PetSchema);

module.exports = Pet;
