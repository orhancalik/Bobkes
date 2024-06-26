import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import axios from "axios"; 
import session from "./session";
import { CapturedPokemon } from "./types";

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

app.get("/", (req, res) => {
  res.render("landingPage");
});


app.get("/pokemonvergelijken", async (req: Request, res: Response) => {
  res.render("pokemonvergelijken");
});

app.get("/mijnpokemon", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon || user.capturedPokemon.length === 0) {
      return res.redirect("/pokemoncatcher");
    }

    const sortedPokemonList = user.capturedPokemon.sort(
      (a: CapturedPokemon, b: CapturedPokemon) => {
        return a.number - b.number; 
      }
    );


    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=1000"
    );
    const allPokemon: { name: string; url: string }[] = response.data.results;

    const caughtPokemonNames = sortedPokemonList.map(
      (pokemon: CapturedPokemon) => pokemon.name
    );
    const uncaughtPokemon = allPokemon
      .filter(
        (pokemon: { name: string; url: string }) =>
          !caughtPokemonNames.includes(pokemon.name)
      )
      .slice(0, 20);

   
    const uncaughtPokemonDetails = await Promise.all(
      uncaughtPokemon.map(async (pokemon: { name: string; url: string }) => {
        const details = await axios.get(pokemon.url);
        return {
          name: pokemon.name,
          number: details.data.id,
          image: details.data.sprites.front_default,
          level: "N/A",
          defence: "N/A",
          caught: false,
        };
      })
    );

    res.render("mijnpokemon", {
      user: req.session.user,
      pokemonList: sortedPokemonList,
      allPokemonList: uncaughtPokemonDetails,
      message: "",
    });
  } catch (error) {
    console.error("Error fetching user Pokémon:", error);
    res
      .status(500)
      .send("Er is een fout opgetreden bij het ophalen van je Pokémon.");
  }
});

app.post("/setFavoritePokemon", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res
      .status(401)
      .send("Je moet ingelogd zijn om een favoriete Pokémon in te stellen.");
  }

  const { name } = req.body;

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user) {
      return res.status(404).send("Gebruiker niet gevonden.");
    }

    const favoritePokemon = user.capturedPokemon.find(
      (pokemon: CapturedPokemon) => pokemon.name === name
    );

    if (!favoritePokemon) {
      return res.status(404).send("Pokémon niet gevonden.");
    }

    await collection.updateOne(
      { email: req.session.user.email },
      { $set: { favoritePokemon } }
    );

    req.session.user.pokemon = favoritePokemon; 

    res.json({ success: true });
  } catch (error) {
    console.error("Error setting favorite Pokémon:", error);
    res
      .status(500)
      .send(
        "Er is een fout opgetreden bij het instellen van je favoriete Pokémon."
      );
  }
});

app.get("/pokemon/:name", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon) {
      return res.status(404).send("Pokémon niet gevonden.");
    }

    const pokemon = user.capturedPokemon.find(
      (p: CapturedPokemon) => p.name === req.params.name
    );

    if (!pokemon) {
      return res.status(404).send("Pokémon niet gevonden.");
    }

    res.render("pokemondetails", {
      user: req.session.user,
      pokemon,
    });
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    res
      .status(500)
      .send(
        "Er is een fout opgetreden bij het ophalen van de Pokémon details."
      );
  }
});

app.post("/pokemon/:name/update", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).send("Niet geautoriseerd");
  }

  try {
    const { type, action } = req.body;
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon) {
      return res.status(404).send("Pokémon niet gevonden.");
    }

    const pokemon = user.capturedPokemon.find(
      (p: CapturedPokemon) => p.name === req.params.name
    );

    if (!pokemon) {
      return res.status(404).send("Pokémon niet gevonden.");
    }

    if (type === "wins") {
      pokemon.wins =
        action === "increment" ? pokemon.wins + 1 : pokemon.wins - 1;
    } else if (type === "losses") {
      pokemon.losses =
        action === "increment" ? pokemon.losses + 1 : pokemon.losses - 1;
    }

    await collection.updateOne(
      { email: req.session.user.email },
      { $set: { capturedPokemon: user.capturedPokemon } }
    );

    res.status(200).send("Pokémon stats bijgewerkt");
  } catch (error) {
    console.error("Error updating Pokémon stats:", error);
    res
      .status(500)
      .send(
        "Er is een fout opgetreden bij het bijwerken van de Pokémon stats."
      );
  }
});


let pokemonDetails: CapturedPokemon[];
app.get("/pokemonbattler", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon || user.capturedPokemon.length === 0) {
      return res.status(400).send("You don't have any captured Pokémon.");
    }

    const currentPokemon1 = user.capturedPokemon[0]; 


    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=151"
    );
    const randomIndex = Math.floor(
      Math.random() * response.data.results.length
    );
    const opponentData = await axios.get(
      response.data.results[randomIndex].url
    );
    const currentPokemon2 = {
      name: opponentData.data.name,
      moves: opponentData.data.moves
        .slice(0, 4)
        .map((move: any) => move.move.name),
      sprite: opponentData.data.sprites.other["official-artwork"].front_default,
      hp: 100,
      defense: 5,
      attack: Math.floor(Math.random() * 10) + 1,
    };


    const pokemonDetails = [
      {
        name: currentPokemon1.name,
        moves: ["Tackle", "Growl", "Quick Attack", "Swift"], 
        sprite: currentPokemon1.image,
        hp: 100,
        defense: currentPokemon1.defense || 5, 
        attack: currentPokemon1.attack || Math.floor(Math.random() * 10) + 1, 
      },
      currentPokemon2,
    ];

    res.render("pokemonbattler", { pokemonDetails });
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    res.status(500).send("Error fetching Pokémon list.");
  }
});

app.post("/pokemonbattle", async (req: Request, res: Response) => {
  const { attacker, move } = req.body;
  const moveDamage = Math.floor(Math.random() * 10) + 1;

  if (!pokemonDetails || pokemonDetails.length < 2) {
    return res.status(400).send("Battle context not set up correctly.");
  }

  let currentAttacker, currentDefender;

  if (attacker === "user") {
    currentAttacker = pokemonDetails[0];
    currentDefender = pokemonDetails[1];
  } else {
    currentAttacker = pokemonDetails[1];
    currentDefender = pokemonDetails[0];
  }

  const damage = moveDamage - currentDefender.defence;
  currentDefender.hp -= damage > 0 ? damage : 0;

  try {
    if (!req.session || !req.session.user || !req.session.user.email) {
      return res.status(401).send("Unauthorized");
    }

    if (pokemonDetails[1].hp <= 0) {
      const db = client.db();
      const collection = db.collection("users");

      const capturedPokemon = {
        name: pokemonDetails[1].name,
        moves: pokemonDetails[1].moves,
        image: pokemonDetails[1].image,
        hp: 100,
        defense: pokemonDetails[1].defence,
        attack: pokemonDetails[1].attack,
        level: 1,
        speed: pokemonDetails[1].speed,
      };

      const user = await collection.findOne({ email: req.session.user.email });

      if (!user) {
        return res.status(404).send("Gebruiker niet gevonden.");
      }

      if (!user.capturedPokemon) {
        user.capturedPokemon = [];
      }

      user.capturedPokemon.push(capturedPokemon);
      await collection.updateOne(
        { email: req.session.user.email },
        { $set: user }
      );

      return res.json({
        pokemonDetails,
        message: "Battle Over! You captured the Pokémon!",
      });
    } else if (pokemonDetails[0].hp <= 0) {
      return res.json({
        pokemonDetails,
        message: "Battle Over! Your Pokémon fainted!",
      });
    } else {
      return res.json({
        pokemonDetails,
        message: "Battle Continues",
      });
    }
  } catch (error) {
    console.error("Error capturing Pokémon after battle:", error);
    return res.status(500).send("Error capturing Pokémon after battle.");
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
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon || user.capturedPokemon.length === 0) {
      return res.status(400).send("You don't have any captured Pokémon.");
    }

    const currentPokemon1 = user.capturedPokemon[0]; 


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

app.post("/whosthatpokemon", async (req: Request, res: Response) => {
  const { pokemonName, correctName } = req.body;

  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.session.user.email });

    if (!user || !user.capturedPokemon || user.capturedPokemon.length === 0) {
      return res.status(400).send("You don't have any captured Pokémon.");
    }

    const currentPokemon1 = user.capturedPokemon[0]; 

    if (pokemonName.toLowerCase() === correctName.toLowerCase()) {
      const statToIncrease = Math.random() > 0.5 ? "attack" : "defense";
      currentPokemon1[statToIncrease] =
        (currentPokemon1[statToIncrease] || 0) + 1;


      await collection.updateOne(
        {
          email: req.session.user.email,
          "capturedPokemon.name": currentPokemon1.name,
        },
        { $set: { "capturedPokemon.$": currentPokemon1 } }
      );
    }

    res.redirect("/whosthatpokemon");
  } catch (error) {
    console.error("Error updating Pokémon stats:", error);
    res
      .status(500)
      .send(
        "Er is een fout opgetreden bij het bijwerken van de Pokémon stats."
      );
  }
});
const redirectLoggedInUser = (
  req: Request,
  res: Response,
  next: () => void
) => {
  if (req.session.user) {
    return res.redirect("/index"); 
  }
  next();
};

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
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

app.get("/login", redirectLoggedInUser, (req, res) => {
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
        .render("login", { error: "Ongeldige inloggegevens" });
    }


    req.session.user = { username: user.username, email: user.email };


    res.redirect("/index");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("login", {
      error: "Er is een fout opgetreden bij het inloggen.",
    });
  }
});

app.get("/index", (req: Request, res: Response) => {
  res.render("index");
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



app.get("/pokemoncatcher", (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
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
    res
      .status(500)
      .send("Er is een fout opgetreden bij het vangen van de Pokémon.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
