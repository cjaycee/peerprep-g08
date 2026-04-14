import { forgotPassword, resetPassword } from "../../controller/password-reset-controller.js";
import {
  findUserByEmail,
  createOtp,
  findLatestOtpByEmail,
  deleteOtpsByEmail,
  resetPasswordById,
} from "../../model/repository.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";

jest.mock("../../model/repository.js");
jest.mock("../../utils/mailer.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Password Reset Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("forgotPassword", () => {
    test("200 – sends reset OTP if user exists", async () => {
      findUserByEmail.mockResolvedValue({ email: "bob@t.com" });
      createOtp.mockResolvedValue({});
      sendPasswordResetEmail.mockResolvedValue({});

      const req = { body: { email: "bob@t.com" } };
      const res = mockRes();

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).toHaveBeenCalledWith("bob@t.com", expect.any(String), "password_reset");
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    test("200 – dummy message even if user doesn't exist", async () => {
      findUserByEmail.mockResolvedValue(null);
      const req = { body: { email: "fake@t.com" } };
      const res = mockRes();

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    test("200 – successful reset", async () => {
      findUserByEmail.mockResolvedValue({ id: "u2", email: "bob@t.com" });
      findLatestOtpByEmail.mockResolvedValue({ otp: "654321" });
      resetPasswordById.mockResolvedValue({});
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "bob@t.com", otp: "654321", newPassword: "NewStrongPass1!" } };
      const res = mockRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(resetPasswordById).toHaveBeenCalled();
    });

    test("400 – fails if new password is weak", async () => {
      const req = { body: { email: "bob@t.com", otp: "654321", newPassword: "weak" } };
      const res = mockRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Password must be at least 8 characters long.") }));
    });
  });
});
