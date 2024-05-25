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
  const response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?limit=151"
  );
  const data = response.data;
  return data.results;
};

const fetchPokemonStats = async (pokemonName: string) => {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  const moves = response.data.moves.map((move: any) => move.move.name);
  const stats = response.data.stats.reduce((acc: any, stat: any) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});
  return {
    name: pokemonName,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    moves: moves.slice(0, 4), // Get the first four moves for simplicity
    sprite: response.data.sprites.front_default,
  };
};

// Index
app.get("/", (req, res) => {
  res.render("landingPage");
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
  hp: 100,
  attack: 0,
  defense: 0,
  // Andere statistieken van de Pokémon...
};

let currentPokemon2 = {
  name: "",
  hp: 100,
  attack: 0,
  defense: 0,
  // Andere statistieken van de Pokémon...
};

let battleState = {
  turn: 1,
  pokemon1: {
    name: "",
    hp: 100,
    attack: 0,
    defense: 0,
    speed: 0,
    moves: [],
  },
  pokemon2: {
    name: "",
    hp: 100,
    attack: 0,
    defense: 0,
    speed: 0,
    moves: [],
  },
};
const calculateDamage = (attacker: any, defender: any, move: string) => {
  // Simplified damage formula
  const attackPower = attacker.attack;
  const defensePower = defender.defense;
  const baseDamage = 10; // Base damage for simplification
  const damage =
    (((2 * 10) / 5 + 2) * attackPower * baseDamage) / defensePower / 50 + 2;
  return Math.floor(damage);
};

app.post("/startbattle", async (req: Request, res: Response) => {
  const { pokemon1, pokemon2 } = req.body;

  battleState.pokemon1 = await fetchPokemonStats(pokemon1);
  battleState.pokemon2 = await fetchPokemonStats(pokemon2);
  battleState.turn = 1; // Start with player 1

  res.json({
    message: "Battle started!",
    battleState,
  });
});

// Turn-based battle logic
app.post("/takeTurn", async (req: Request, res: Response) => {
  const { move } = req.body;
  const attacker =
    battleState.turn === 1 ? battleState.pokemon1 : battleState.pokemon2;
  const defender =
    battleState.turn === 1 ? battleState.pokemon2 : battleState.pokemon1;

  // Calculate damage and update health
  const damage = calculateDamage(attacker, defender, move);
  defender.hp -= damage;

  let message = `${attacker.name} used ${move}! ${defender.name} takes ${damage} damage!`;

  // Check if game is over
  if (defender.hp <= 0) {
    message += ` ${defender.name} has fainted!`;
    // Reset battle state
    battleState = {
      turn: 1,
      pokemon1: { ...battleState.pokemon1, hp: 100 },
      pokemon2: { ...battleState.pokemon2, hp: 100 },
    };
  } else {
    // Switch turns
    battleState.turn = battleState.turn === 1 ? 2 : 1;
  }

  res.json({
    message,
    battleState,
  });
});

// pokemonbattler
app.get("/pokemonbattler", async (req: Request, res: Response) => {
  const pokemonList = await getPokemonList();
  res.render("pokemonbattler", { pokemonList });
});

app.post("/pokemonbattle", async (req: Request, res: Response) => {
  const { pokemon1, pokemon1Move, pokemon2, pokemon2Move } = req.body;

  // Fetch stats and moves for both Pokémon
  const pokemon1Stats = await fetchPokemonStats(pokemon1);
  const pokemon2Stats = await fetchPokemonStats(pokemon2);

  const damage1To2 = calculateDamage(
    pokemon1Stats,
    pokemon2Stats,
    pokemon1Move
  );
  const damage2To1 = calculateDamage(
    pokemon2Stats,
    pokemon1Stats,
    pokemon2Move
  );

  pokemon2Stats.hp -= damage1To2;
  pokemon1Stats.hp -= damage2To1;

  let message = `Both Pokémon attacked! ${pokemon1} used ${pokemon1Move} and ${pokemon2} used ${pokemon2Move}.`;

  if (pokemon1Stats.hp <= 0 && pokemon2Stats.hp <= 0) {
    message += " It's a tie!";
  } else if (pokemon1Stats.hp <= 0) {
    message += ` ${pokemon2} wins!`;
  } else if (pokemon2Stats.hp <= 0) {
    message += ` ${pokemon1} wins!`;
  } else {
    message += " The battle continues...";
  }

  res.json({
    message,
    currentPokemon1: pokemon1Stats,
    currentPokemon2: pokemon2Stats,
  });
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

    res.render("whosthatpokemon", { pokemon });
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
    currentPokemon1[statToIncrease]++;
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
      return res
        .status(401)
        .render("login", { error: "Ongeldige inloggegevens" });
    }

    // Controleer het wachtwoord
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .render("login", { error: "Ongeldige inloggegevens" });
    }

    // Sla de gebruikersnaam op in de sessie
    req.session.user = { username: user.username };

    // Stuur de gebruiker door naar de indexpagina
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("login", {
      error: "Er is een fout opgetreden bij het inloggen.",
    });
  }
});

const checkAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res
        .status(500)
        .send("Er is een fout opgetreden bij het uitloggen.");
    }
    res.redirect("/login");
  });
});

app.get("/pokemoncatcher", (req, res) => {
  res.render("pokemoncatcher");
});

app.post("/pokemoncatcher/catch", (req, res) => {
  const { targetPokemon, currentPokemon } = req.body;

  const chanceToCatch =
    100 - ((targetPokemon.defence - currentPokemon.attack) % 100);

  if (Math.random() * 100 < chanceToCatch) {
    // Pokémon gevangen
    res
      .status(200)
      .json({ success: true, message: "Je hebt de Pokémon gevangen!" });
  } else {
    // Pokémon niet gevangen
    res.status(200).json({
      success: false,
      message: "Je hebt de Pokémon niet kunnen vangen.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
