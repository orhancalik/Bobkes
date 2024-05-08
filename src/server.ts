<<<<<<< HEAD
import express, { Request, Response } from 'express';
=======
import express, { Request, Response } from "express";
>>>>>>> refs/remotes/origin/main
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import session from './session';
import { url } from "inspector";

dotenv.config();

const app = express();
const PORT = 3000;


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);

app.use((req: Request, res: Response, next) => {
  res.locals.user = req.session.user;
  next();
});


const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, {});

//Index
app.get("/", (req, res) => {
  res.render("index");
});

//Ik heb hier routes gegeven. -YNS
// Route om de pokemonvergelijken.ejs pagina te renderen

app.get("/pokemonvergelijken", async (req: Request, res: Response) => {
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

//Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);

    // Voeg de gebruiker toe aan de database
    const db = client.db();
    const collection = db.collection("users");
    await collection.insertOne({ email, password: hashedPassword });

    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Er is een fout opgetreden bij de registratie.");
  }
});

//Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Zoek de gebruiker in de database en haal de gebruikersnaam op
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).send("Ongeldige inloggegevens");
    }

    // Controleer het wachtwoord
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Ongeldige inloggegevens");
    }

    // Sla de gebruikersnaam op in de sessie
    req.session.user = { username: user.username };

    // Stuur de gebruiker door naar de indexpagina
    res.redirect("/");

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Er is een fout opgetreden bij het inloggen.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
