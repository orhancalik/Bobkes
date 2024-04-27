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

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Controleer of gebruiker al bestaat
  const existingUser: UserModel | null = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Gebruiker bestaat al" });
  }
  ///ddsdfssdf
  // Hash het wachtwoord
  const hashedPassword = await bcrypt.hash(password, 10);

  // Maak nieuwe gebruiker
  const newUser = new User({ email, password: hashedPassword });

  // Opslaan in database
  try {
    await newUser.save();
    res.status(201).json({ message: "Gebruiker aangemaakt" });
  } catch (error) {
    res.status(500).json({ message: "Er is iets misgegaan" });
  }
});



// Route om de pokemonvergelijken.ejs pagina te renderen
app.get("/pokemonvergelijken", (req, res) => {
  res.render("pokemonvergelijken");
});


//MijnPokemon YNS
app.get("/mijnpokemon", (req, res) => {
  res.render("mijnpokemon");
});


//Pokemon catcher Rayan
app.get("/catch", (req, res) => {
  res.render("catch");
});

//Index
app.get("/", (req, res) => {
  res.render("index");
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
