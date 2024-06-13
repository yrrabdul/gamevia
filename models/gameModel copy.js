const mongoose = require("mongoose");

let gameModel = mongoose.Schema(
  {
    title: String,
    genre: [String],
    image: String,
    date: Date,
    time: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameModel", gameModel);
