
const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Recipe = require('../models/recipe.js');
const Ingredient = require('../models/ingredients.js')
router.get('/', async (req, res) => {

  const foundRecpies = await  Recipe.find({owner: req.session.user._id})
  res.render('recipes/index.ejs', {recipes :foundRecpies});
   
    
});

router.get('/new', async (req, res) => {
    res.render('recipes/new.ejs');
});

router.post('/', async (req, res) => {
  try {
    // Create the new recipe object with data from the request body and the owner from the session
    const newRecipe = new Recipe({
      ...req.body,
      owner: req.session.user._id,
      ingredients: []  // Initialize ingredients as an empty array
    });

    // Split the ingredients string from the request body into an array
    const ingredientsString = req.body.ingredients;
    const ingredients = ingredientsString.split(',').map(ingredient => ingredient.trim());
    
    // Process each ingredient
    for (const ingredient of ingredients) {
      // Find if the ingredient already exists
      let foundIngredient = await Ingredient.findOne({ name: ingredient });
      if (!foundIngredient) {
        // If not found, create a new ingredient
        const newIngredient = new Ingredient({ name: ingredient });
        foundIngredient = await newIngredient.save();
      }
      // Push the ingredient's ObjectId to the newRecipe's ingredients array
      newRecipe.ingredients.push(foundIngredient._id);
    }

    // Save the new recipe
    await newRecipe.save();
    
    // Redirect to the recipes page
    res.redirect('/recipes');
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while creating the recipe.");
  }
});

router.get('/:recipeId', async (req, res) => {
  try {

    const recipe = await Recipe.findById(req.params.recipeId)
    const ingredients = await Promise.all(
      recipe.ingredients.map(ingredientId => Ingredient.findById(ingredientId))
    );
    const owner =await User.findById(recipe.owner);
    res.render('recipes/show.ejs' , {
      recipe ,
      ingredients,
      owner
    });


  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.redirect('/');
  }

});

router.delete('/:recipeId/show', async (req, res) => {

  try {


    const result = await Recipe.deleteOne({ _id: req.params.recipeId });

    // Check if any document was deleted
    res.redirect('/recipes/index');

  } catch (error) {

    console.log(error);
    res.redirect('/')
  }
});

router.get('/:recipeId/edit', async (req, res) => {

  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    res.render('recipes/edit.ejs',{recipe});
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }

});

router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    recipe.name = req.body.name;
    recipe.instructions = req.body.instructions;
    // updates the ingredients if provided, otherwise keeps the current ingredients.
    if (req.body.ingredients){
      const ingredients = req.body.ingredients.split(',').map(ingredient => ingredient.trim());

      for (const ingredient of ingredients) {
        // Find if the ingredient already exists
        let foundIngredient = await Ingredient.findOne({ name: ingredient });
        if (!foundIngredient) {
          // If not found, create a new ingredient
          const newIngredient = new Ingredient({ name: ingredient });
          foundIngredient = await newIngredient.save();
        }
        // Push the ingredient's ObjectId to the newRecipe's ingredients array
        recipe.ingredients.push(foundIngredient._id);
      }
    }else{
      recipe.ingredients;}
    await recipe.save();

    res.redirect(`/recipes/${recipe._id}`);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.redirect('/');
  }
});


// router logic will go here - will be built later on in the lab

module.exports = router;