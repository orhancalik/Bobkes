import mongoose from "mongoose";

interface UserModel extends mongoose.Document {
  email: string;
  password: string;
  // Voeg hier andere gebruikersvelden toe indien nodig
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  // Voeg hier andere gebruikersvelden toe indien nodig
});

const User = mongoose.model<UserModel>("User", userSchema);

export default User;
export { UserModel };
