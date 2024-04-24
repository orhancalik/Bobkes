import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import User from "../models/User"; // Definieer het User-model
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB-verbinding
mongoose
  .connect(
    `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DB_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.post("/register", async (req, res) => {
  // Code voor registratie...
});

app.post("/login", async (req, res) => {});

// Route om de pokemonvergelijken.ejs pagina te renderen
app.get("/pokemonvergelijken", (req, res) => {
  res.render("pokemonvergelijken");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
