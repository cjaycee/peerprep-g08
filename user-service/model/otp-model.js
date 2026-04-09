import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Stores a one-time password (OTP) generated for email verification.
 * Each document expires automatically via MongoDB TTL index after 10 minutes.
 */
const OtpModelSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // TTL index: MongoDB will automatically delete documents after 600 seconds (10 min)
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

export default mongoose.model("OtpModel", OtpModelSchema);
