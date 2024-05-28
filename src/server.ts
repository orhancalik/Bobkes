import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import axios from "axios"; // Add axios for API requests
import session from "./session";
import { CapturedPokemon } from './types';

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




// Index
app.get("/", (req, res) => {
  res.render("index");
});

// Route om de pokemonvergelijken.ejs pagina te renderen
app.get("/pokemonvergelijken", async (req: Request, res: Response) => {
  res.render("pokemonvergelijken");
});

// MijnPokemon Orhan
app.get('/mijnpokemon', async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const db = client.db();
    const collection = db.collection('users');
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon || user.capturedPokemon.length === 0) {
      return res.render('mijnpokemon', {
        user: req.session.user,
        pokemonList: [],
        message: 'Je hebt nog geen pokemons gevangen! Vang je eerste pokemon bij de catcher'
      });
    }

    const sortedPokemonList = user.capturedPokemon.sort((a: CapturedPokemon, b: CapturedPokemon) => {
      return a.number - b.number; // Zorg ervoor dat 'number' een eigenschap is van CapturedPokemon
    });

    // Haal alle Pokémon op uit de API
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const allPokemon: { name: string; url: string }[] = response.data.results;

    // Filter de niet-gevangen Pokémon
    const caughtPokemonNames = sortedPokemonList.map((pokemon: CapturedPokemon) => pokemon.name);
    const uncaughtPokemon = allPokemon.filter((pokemon: { name: string; url: string }) => !caughtPokemonNames.includes(pokemon.name)).slice(0, 20);

    // Voeg extra details toe aan de niet-gevangen Pokémon
    const uncaughtPokemonDetails = await Promise.all(uncaughtPokemon.map(async (pokemon: { name: string; url: string }) => {
      const details = await axios.get(pokemon.url);
      return {
        name: pokemon.name,
        number: details.data.id,
        image: details.data.sprites.front_default,
        level: 'N/A',
        defence: 'N/A',
        caught: false
      };
    }));

    res.render('mijnpokemon', {
      user: req.session.user,
      pokemonList: sortedPokemonList,
      allPokemonList: uncaughtPokemonDetails,
      message: '' // Altijd een message variabele doorgeven
    });
  } catch (error) {
    console.error('Error fetching user Pokémon:', error);
    res.status(500).send('Er is een fout opgetreden bij het ophalen van je Pokémon.');
  }
});

app.post('/setFavoritePokemon', async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).send('Je moet ingelogd zijn om een favoriete Pokémon in te stellen.');
  }

  const { name } = req.body;

  try {
    const db = client.db();
    const collection = db.collection('users');
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user) {
      return res.status(404).send('Gebruiker niet gevonden.');
    }

    const favoritePokemon = user.capturedPokemon.find((pokemon: CapturedPokemon) => pokemon.name === name);

    if (!favoritePokemon) {
      return res.status(404).send('Pokémon niet gevonden.');
    }

    await collection.updateOne(
      { email: req.session.user.email },
      { $set: { favoritePokemon } }
    );

    req.session.user.pokemon = favoritePokemon; // Update de sessie met de favoriete Pokémon

    res.json({ success: true });
  } catch (error) {
    console.error('Error setting favorite Pokémon:', error);
    res.status(500).send('Er is een fout opgetreden bij het instellen van je favoriete Pokémon.');
  }
});


app.get('/pokemon/:name', async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const db = client.db();
    const collection = db.collection('users');
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon) {
      return res.status(404).send('Pokémon niet gevonden.');
    }

    const pokemon = user.capturedPokemon.find((p: CapturedPokemon) => p.name === req.params.name);

    if (!pokemon) {
      return res.status(404).send('Pokémon niet gevonden.');
    }

    res.render('pokemondetails', {
      user: req.session.user,
      pokemon,
    });
  } catch (error) {
    console.error('Error fetching Pokémon details:', error);
    res.status(500).send('Er is een fout opgetreden bij het ophalen van de Pokémon details.');
  }
});

app.post('/pokemon/:name/update', async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).send('Niet geautoriseerd');
  }

  try {
    const { type, action } = req.body;
    const db = client.db();
    const collection = db.collection('users');
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon) {
      return res.status(404).send('Pokémon niet gevonden.');
    }

    const pokemon = user.capturedPokemon.find((p: CapturedPokemon) => p.name === req.params.name);

    if (!pokemon) {
      return res.status(404).send('Pokémon niet gevonden.');
    }

    if (type === 'wins') {
      pokemon.wins = action === 'increment' ? pokemon.wins + 1 : pokemon.wins - 1;
    } else if (type === 'losses') {
      pokemon.losses = action === 'increment' ? pokemon.losses + 1 : pokemon.losses - 1;
    }

    await collection.updateOne({ email: req.session.user.email }, { $set: { capturedPokemon: user.capturedPokemon } });

    res.status(200).send('Pokémon stats bijgewerkt');
  } catch (error) {
    console.error('Error updating Pokémon stats:', error);
    res.status(500).send('Er is een fout opgetreden bij het bijwerken van de Pokémon stats.');
  }
});

// pokemonStats YNS
app.get("/pokemonStats", (req, res) => {
  res.render("pokemonStats");
});

// Pokemon catcher Rayan

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
    //currentPokemon[statToIncrease]++;
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
    req.session.user = { username: user.username, email: user.email };

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

//catcher

app.get("/pokemoncatcher", (req, res) => {
  res.render("pokemoncatcher");
});

app.post("/catchPokemon", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).send("Je moet ingelogd zijn om Pokémon te vangen.");
  }

  const pokemon = req.body; // De gegevens van de gevangen Pokémon.

  try {
    const db = client.db();
    const collection = db.collection("users");

    // Voeg de gevangen Pokémon toe aan de 'capturedPokemon' array van de gebruiker.
    // Als de 'capturedPokemon' array niet bestaat, zal deze automatisch worden aangemaakt.
    await collection.updateOne(
      { email: req.session.user.email }, // Gebruik de e-mail uit de sessie als unieke identificatie.
      { $push: { capturedPokemon: pokemon } },
      { upsert: true } // Zorgt ervoor dat als het document niet bestaat, het wordt aangemaakt.
    );

    res.status(200).send("Pokémon succesvol gevangen!");
  } catch (error) {
    console.error("Error catching Pokémon:", error);
    res.status(500).send("Er is een fout opgetreden bij het vangen van de Pokémon.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});