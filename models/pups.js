const mongoose = require("mongoose");

const pupsSchema = new mongoose.Schema({
    img: String,
    name: String,
    sex: String,
    age: String,
    vaccination: String,
    price: String,
  });

  module.exports = mongoose.model("Pup", pupsSchema);