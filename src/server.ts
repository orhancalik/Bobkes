import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import axios from "axios";
import session from "./session";

dotenv.config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);

app.use((req: Request, res: Response, next: () => void) => {
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

let currentPokemon1 = {
  name: "",
  hp: 100,
  attack: 39,
  defense: 28,
};

let currentPokemon2 = {
  name: "",
  hp: 100,
  attack: 39,
  defense: 28,
};

// Index
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/pokemonvergelijken", async (req: Request, res: Response) => {
  res.render("pokemonvergelijken");
});

app.get("/mijnpokemon", (req: Request, res: Response) => {
  res.render("mijnpokemon");
});

app.get("/pokemonStats", (req: Request, res: Response) => {
  res.render("pokemonStats");
});

app.get("/pokemonbattler", async (req: Request, res: Response) => {
  try {
    const pokemonList = await getPokemonList(); // Get the list of Pokémon

    // Create userPokemonMoves and pokemonDetails inside the try-block
    const userPokemonMoves = ["move1", "move2", "move3", "move4"]; // Replace with actual moves
    const pokemonDetails = await Promise.all(
      pokemonList.slice(0, 2).map(async (pokemon: any) => {
        const response = await axios.get(pokemon.url);
        return {
          name: pokemon.name,
          moves: response.data.moves
            .slice(0, 4)
            .map((move: any) => move.move.name),
          sprite: response.data.sprites.other["official-artwork"].front_default,
          hp: 100,
        };
      })
    );

    // Render the EJS template with pokemonList, pokemonDetails, and userPokemonMoves passed as objects
    res.render("pokemonbattler", {
      pokemonList,
      pokemonDetails,
      userPokemonMoves,
    });
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    res
      .status(500)
      .send("Er is een fout opgetreden bij het ophalen van de Pokémon-lijst.");
  }
});

app.post("/pokemonbattle", (req: Request, res: Response) => {
  const { attacker, move } = req.body;
  const moveDamage = Math.floor(Math.random() * 10) + 1; // Random damage between 1 and 10

  let currentAttacker, currentDefender;

  if (attacker === "user") {
    currentAttacker = currentPokemon1;
    currentDefender = currentPokemon2;
  } else {
    currentAttacker = currentPokemon2;
    currentDefender = currentPokemon1;
  }

  const damage = moveDamage - currentDefender.defense;
  currentDefender.hp -= damage > 0 ? damage : 0;

  if (currentPokemon1.hp <= 0 || currentPokemon2.hp <= 0) {
    res.json({
      currentPokemon1,
      currentPokemon2,
      message: "Battle Over!",
    });
  } else {
    res.json({
      currentPokemon1,
      currentPokemon2,
      message: "Battle Continues",
    });
  }
});

app.get("/pokemonsearch/:pokemonName", async (req: Request, res: Response) => {
  try {
    const pokemonName = req.params.pokemonName.toLowerCase();
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const pokemonDetails = {
      name: response.data.name,
      sprite: response.data.sprites.other["official-artwork"].front_default,
      moves: response.data.moves.map((move: any) => move.move.name),
    };
    res.json(pokemonDetails);
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    res.status(500).json({
      error: "Er is een fout opgetreden bij het ophalen van Pokémon-details.",
    });
  }
});

app.get("/whosthatpokemon", async (req: Request, res: Response) => {
  try {
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

    res.render("whosthatpokemon", { pokemon, currentPokemon: currentPokemon1 });
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    res
      .status(500)
      .send("Er is een fout opgetreden bij het ophalen van de Pokémon.");
  }
});

app.post("/whosthatpokemon", (req: Request, res: Response) => {
  const { pokemonName, correctName } = req.body;

  if (pokemonName.toLowerCase() === correctName.toLowerCase()) {
    const statToIncrease = Math.random() > 0.5 ? "attack" : "defense";
    currentPokemon1[statToIncrease]++;
  }

  res.redirect("/whosthatpokemon");
});

app.get("/landingPage", (req: Request, res: Response) => {
  res.render("landingPage");
});

app.get("/register", (req: Request, res: Response) => {
  res.render("register");
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
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
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .render("login", { error: "Ongeldige inloggegevens" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .render("login", { error: "Ongeldige inloggegevens" }); // Hier stond een opening accolade die gesloten moest worden.
    }

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

app.post("/logout", (req: Request, res: Response) => {
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

app.get("/pokemoncatcher", (req: Request, res: Response) => {
  res.render("pokemoncatcher");
});

app.post("/pokemoncatcher/catch", (req: Request, res: Response) => {
  const { targetPokemon, currentPokemon } = req.body;
  const chanceToCatch =
    100 - ((targetPokemon.defense - currentPokemon.attack) % 100);

  if (Math.random() * 100 < chanceToCatch) {
    res
      .status(200)
      .json({ success: true, message: "Je hebt de Pokémon gevangen!" });
  } else {
    res.status(200).json({
      success: false,
      message: "Je hebt de Pokémon niet kunnen vangen.",
    });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
