// models/gameModel.js

const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    title: String,
    genre: String,
    date: Date,
    time: String,
    image: String
});

// Create a text index on the fields you want to search
gameSchema.index({ title: 'text', genre: 'text' });

module.exports = mongoose.model("Game", gameSchema);
