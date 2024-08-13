const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref:"user.js",
  },
  ingredients: {
    type: [mongoose.Schema.ObjectId],
    ref:"ingredients.js",
  },
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
