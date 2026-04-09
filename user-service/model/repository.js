import UserModel from "./user-model.js";
import AdminCodeModel from "./admin-code-model.js";
import OtpModel from "./otp-model.js";

import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}

export async function createAdminCode(code, createdBy) {
  return new AdminCodeModel({ code, createdBy }).save();
}


export async function findAndUseAdminCode(code) {
  return AdminCodeModel.findOneAndUpdate(
    { code, isUsed: false },
    { $set: { isUsed: true } },
    { new: true }
  );
}

// ---------------------------------------------------------------------------
// OTP functions (F1.1.2 – email confirmation)
// ---------------------------------------------------------------------------

/**
 * Deletes all existing OTPs for an email then saves a new one.
 */
export async function createOtp(email, otp) {
  await OtpModel.deleteMany({ email });
  return new OtpModel({ email, otp }).save();
}

/**
 * Finds the most recent unexpired OTP for the given email.
 */
export async function findLatestOtpByEmail(email) {
  return OtpModel.findOne({ email }).sort({ createdAt: -1 });
}

/**
 * Removes all OTP documents for a given email (called after successful verification).
 */
export async function deleteOtpsByEmail(email) {
  return OtpModel.deleteMany({ email });
}

/**
 * Marks the user's email as verified.
 */
export async function verifyEmailById(userId) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { isEmailVerified: true } },
    { new: true }
  );
}
