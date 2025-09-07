import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
