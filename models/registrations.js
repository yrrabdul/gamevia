const mongoose = require("mongoose");

let registration = mongoose.Schema({
  name: String,
  email: String,
  tournamentid: String,
});

module.exports = mongoose.model("resgistration", registration);
