import { sendOtp, verifyOtp } from "../../controller/otp-controller.js";
import {
  findUserByEmail,
  createOtp,
  findLatestOtpByEmail,
  deleteOtpsByEmail,
  verifyEmailById,
} from "../../model/repository.js";
import { sendOtpEmail } from "../../utils/mailer.js";

jest.mock("../../model/repository.js");
jest.mock("../../utils/mailer.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("OTP Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("sendOtp", () => {
    test("200 – sends OTP if user is registered and unverified", async () => {
      findUserByEmail.mockResolvedValue({ email: "unverified@t.com", isEmailVerified: false });
      createOtp.mockResolvedValue({});
      sendOtpEmail.mockResolvedValue({});

      const req = { body: { email: "unverified@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(createOtp).toHaveBeenCalledWith("unverified@t.com", expect.any(String), "email_verification");
      expect(sendOtpEmail).toHaveBeenCalled();
    });

    test("400 – if user is already verified", async () => {
      findUserByEmail.mockResolvedValue({ email: "v@t.com", isEmailVerified: true });
      const req = { body: { email: "v@t.com" } };
      const res = mockRes();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is already verified." });
    });
  });

  describe("verifyOtp", () => {
    test("200 – successful verification", async () => {
      findUserByEmail.mockResolvedValue({ id: "u1", email: "unverified@t.com", isEmailVerified: false });
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456" });
      verifyEmailById.mockResolvedValue({});
      deleteOtpsByEmail.mockResolvedValue({});

      const req = { body: { email: "unverified@t.com", otp: "123456" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(verifyEmailById).toHaveBeenCalledWith("u1");
    });

    test("400 – incorrect OTP", async () => {
      findUserByEmail.mockResolvedValue({ id: "u1", email: "unverified@t.com", isEmailVerified: false });
      findLatestOtpByEmail.mockResolvedValue({ otp: "123456" });

      const req = { body: { email: "unverified@t.com", otp: "wrong" } };
      const res = mockRes();

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid OTP." });
    });
  });
});
