import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import axios from "axios"; // Add axios for API requests
import session from "./session";

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

const getPokemonList = async () => {
  const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = response.data;
  return data.results;
};

// Simulated current Pokémon stats (to be replaced with actual logic)
let currentPokemon = {
  attack: 39,
  defense: 28,
};

// Index
app.get("/", (req, res) => {
  res.render("index");
});

// Route om de pokemonvergelijken.ejs pagina te renderen
app.get("/pokemonvergelijken", async (req: Request, res: Response) => {
  res.render("pokemonvergelijken");
});

// MijnPokemon YNS
app.get("/mijnpokemon", (req, res) => {
  res.render("mijnpokemon");
});

// pokemonStats YNS
app.get("/pokemonStats", (req, res) => {
  res.render("pokemonStats");
});

// Pokemon catcher Rayan
app.get("/pokemoncatcher", (req, res) => {
  res.render("pokemoncatcher");
});

let currentPokemon1 = {
  name: "",
  hp: 100, // Stel de HP in op 100 of een ander passend startwaarde
  // Andere statistieken van de Pokémon...
};

let currentPokemon2 = {
  name: "",
  hp: 100, // Stel de HP in op 100 of een ander passend startwaarde
  // Andere statistieken van de Pokémon...
};

// pokemonbattler
app.get("/pokemonbattler", async (req: Request, res: Response) => {
  const pokemonList = await getPokemonList();
  res.render("pokemonbattler", { pokemonList });
});

// Handle Pokémon battle
app.post("/pokemonbattle", async (req: Request, res: Response) => {
  const { pokemon1, pokemon2 } = req.body;

  // Fetch stats and sprites for both Pokémon
  const fetchPokemonStats = async (pokemonName: string) => {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    return {
      name: pokemonName,
      attack: response.data.stats[1].base_stat,
      defense: response.data.stats[2].base_stat,
      hp: response.data.stats[0].base_stat,
      sprite: response.data.sprites.front_default,
    };
  };

  const pokemon1Stats = await fetchPokemonStats(pokemon1);
  const pokemon2Stats = await fetchPokemonStats(pokemon2);

  // Simulated battle logic
  while (pokemon1Stats.hp > 0 && pokemon2Stats.hp > 0) {
    // Pokémon 1 attacks Pokémon 2
    const damageTo2 = Math.max(0, pokemon1Stats.attack - pokemon2Stats.defense);
    pokemon2Stats.hp -= damageTo2;

    // Check if Pokémon 2 has fainted
    if (pokemon2Stats.hp <= 0) {
      res.json({ message: `${pokemon1Stats.name} wins!`, currentPokemon1: pokemon1Stats, currentPokemon2: pokemon2Stats });
      return;
    }

    // Pokémon 2 attacks Pokémon 1
    const damageTo1 = Math.max(0, pokemon2Stats.attack - pokemon1Stats.defense);
    pokemon1Stats.hp -= damageTo1;

    // Check if Pokémon 1 has fainted
    if (pokemon1Stats.hp <= 0) {
      res.json({ message: `${pokemon2Stats.name} wins!`, currentPokemon1: pokemon1Stats, currentPokemon2: pokemon2Stats });
      return;
    }
  }

  res.json({ message: "It's a draw!", currentPokemon1: pokemon1Stats, currentPokemon2: pokemon2Stats });
});

// Who's That Pokemon?
app.get("/whosthatpokemon", async (req, res) => {
  try {
    // Fetch a random Pokémon
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=151"
    );
    const pokemonList = response.data.results;
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];

    const pokemonDetails = await axios.get(randomPokemon.url);
    const pokemon = {
      name: pokemonDetails.data.name,
      image:
        pokemonDetails.data.sprites.other["official-artwork"].front_default,
    };

    res.render("whosthatpokemon", { pokemon, currentPokemon });
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    res
      .status(500)
      .send("Er is een fout opgetreden bij het ophalen van de Pokémon.");
  }
});

// Handle the guess submission
app.post("/whosthatpokemon", (req: Request, res: Response) => {
  const { pokemonName, correctName } = req.body;

  if (pokemonName.toLowerCase() === correctName.toLowerCase()) {
    // Increase attack or defense
    const statToIncrease = Math.random() > 0.5 ? "attack" : "defense";
    currentPokemon[statToIncrease]++;
  }

  res.redirect("/whosthatpokemon");
});

// LandingPage
app.get("/landingPage", (req, res) => {
  res.render("landingPage");
});

// Register
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

// Login
app.get("/login", (req, res) => {
  const error = req.query.error;
  res.render("login", { error });
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Zoek de gebruiker in de database en haal de gebruikersnaam op
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).render("login", { error: "Ongeldige inloggegevens" });
    }

    // Controleer het wachtwoord
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {

      return res.status(401).render("login", { error: "Ongeldige inloggegevens" });
    }

    // Sla de gebruikersnaam op in de sessie
    req.session.user = { username: user.username };

    // Stuur de gebruiker door naar de indexpagina
    res.redirect("/");

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("login", { error: "Er is een fout opgetreden bij het inloggen." });
  }
});




const checkAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).send("Er is een fout opgetreden bij het uitloggen.");
    }
    res.redirect("/login");
  });
});


app.get("/pokemoncatcher", (req, res) => {
  res.render("pokemoncatcher");
});

app.post("/pokemoncatcher/catch", (req, res) => {
  const { targetPokemon, currentPokemon } = req.body;

  const chanceToCatch = 100 - (targetPokemon.defence - currentPokemon.attack) % 100;

  if (Math.random() * 100 < chanceToCatch) {
    // Pokémon gevangen
    res.status(200).json({ success: true, message: "Je hebt de Pokémon gevangen!" });
  } else {
    // Pokémon niet gevangen
    res.status(200).json({ success: false, message: "Je hebt de Pokémon niet kunnen vangen." });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
