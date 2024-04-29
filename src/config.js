const mongoose = require("mongoose");

// Verbinden met de MongoDB-database
async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb+srv://Younes:APHogeschool@clusterofyounes.4temuqa.mongodb.net/ClusterOfYounes", {

        });
        console.log("Database connected Successfully");
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error; // Rethrow the error for higher level handling
    }
}

// Definieer het schema voor gebruikersgegevens
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false // Dit veld is nu optioneel
    },
    email: {
        type: String,
        required: true // Dit veld is nog steeds vereist
    },
    password: {
        type: String,
        required: true
    }
});

// Maak een model aan op basis van het schema
const UserModel = mongoose.model("User", LoginSchema);

// Exporteer het model voor gebruik in andere modules
module.exports = {
    connectToDatabase,
    UserModel
};