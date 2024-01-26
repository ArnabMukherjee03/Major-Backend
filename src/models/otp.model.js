import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
      },
      otp: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, 
      },
})

otpSchema.pre("save", async function (next){
    this.otp = await bcrypt.hash(this.otp,10);
    next();
})

export const Otp = mongoose.model("otp", otpSchema);