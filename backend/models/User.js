import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "manager", "admin"], default: "employee" },
  department: { 
    type: String, 
    required: true,
    enum: ["Engineering", "Product", "Design", "Marketing", "Sales", "Human Resources", "Finance", "Operations", "Customer Support", "Legal", "Executive"]
  },
  avatar: { type: String, default: "" },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    annual: { type: Number, default: 18 }
  }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User; // CORRECT DEFAULT EXPORT