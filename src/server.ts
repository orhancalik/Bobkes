import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const collection = require("./config");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
// Middleware
app.use(bodyParser.json());



//Index
app.get("/", (req, res) => {
  res.render("index");
});

//Ik heb hier routes gegeven. -YNS
// Route om de pokemonvergelijken.ejs pagina te renderen
app.get("/pokemonvergelijken", (req, res) => {
  res.render("pokemonvergelijken");
});


//MijnPokemon YNS
app.get("/mijnpokemon", (req, res) => {
  res.render("mijnpokemon");
});


//pokemonStats YNS
app.get("/pokemonStats", (req, res) => {
  res.render("pokemonStats");
});


//Pokemon catcher Rayan
app.get("/pokemoncatcher", (req, res) => {
  res.render("pokemoncatcher");
});

//pokemonbattler
app.get("/pokemonbattler", (req, res) => {
  res.render("pokemonbattler");
});

//Who's That Pokemon? 
app.get("/whosthatpokemon", (req, res) => {
  res.render("whosthatpokemon");
});





//LandingPage
app.get("/landingPage", (req, res) => {
  res.render("landingPage");
});

//Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required");
    }
    if (!collection || !collection.UserModel) {
      throw new Error("UserModel is not defined");
    }

    // Maak een nieuw gebruikersinstantie met de ontvangen gegevens
    const newUser = new collection.UserModel(userData);

    // Sla de gebruiker op in de database
    const result = await newUser.save();

    console.log(result);
    res.send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal server error");
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
