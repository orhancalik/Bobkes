import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import User, { UserModel } from "../models/User";


const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
// Middleware
app.use(bodyParser.json());

// MongoDB-verbinding

mongoose
  .connect(
    `mongodb+srv://Younes:APHogeschool@clusterofyounes.4temuqa.mongodb.net/ClusterOfYounes`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
// Routes


//Index
app.get("/", (req, res) => {
  res.render("index");
});


//Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post('/register', async (req, res) => {
  try {
    // Ontvang gegevens van het registratieformulier
    const { email, password, address, city, province, zip } = req.body;

    // Maak een nieuwe gebruiker aan met Mongoose
    const newUser = new User({
      email,
      password, // Je moet het wachtwoord beveiligen voordat je het opslaat in de database
      address,
      city,
      province,
      zip
    });

    // Sla de nieuwe gebruiker op in de database
    await newUser.save();

    // Stuur een bevestiging dat de registratie is geslaagd
    res.status(200).send('Registratie succesvol!');
  } catch (error) {
    // Stuur een foutmelding als er iets misgaat tijdens het verwerken van het registratieverzoek
    res.status(500).send('Er is een fout opgetreden bij het verwerken van het registratieverzoek.');
  }
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Zoek gebruiker in database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Gebruiker niet gevonden" });
  }

  // Controleer wachtwoord
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Ongeldig wachtwoord" });
  }

  res.status(200).json({ message: "Inloggen gelukt" });
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
