import {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  updateUserPrivilege,
  deleteUser,
  generateAdminCode,
  upgradeUserToAdmin,
  formatUserResponse,
  updateProfilePicture,
} from "../../controller/user-controller.js";

// Mock the repository so no DB is needed
jest.mock("../../model/repository.js", () => ({
  createUser: jest.fn(),
  deleteUserById: jest.fn(),
  findAllUsers: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByUsernameOrEmail: jest.fn(),
  updateUserById: jest.fn(),
  updateUserPrivilegeById: jest.fn(),
  createAdminCode: jest.fn(),
  findAndUseAdminCode: jest.fn(),
  updateUserProfilePicture: jest.fn(),
}));

import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  createAdminCode as _createAdminCode,
  findAndUseAdminCode as _findAndUseAdminCode,
  updateUserProfilePicture as _updateUserProfilePicture,
} from "../../model/repository.js";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

afterEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// A valid MongoDB ObjectId string for test purposes
const VALID_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439012";

const VALID_PASSWORD = "StrongPass123!";
const VALID_USERNAME = "valid_user";
const VALID_EMAIL = "valid@test.com";

// ---------------------------------------------------------------------------
// formatUserResponse
// ---------------------------------------------------------------------------
describe("formatUserResponse", () => {
  test("returns only the expected fields (including new ones)", () => {
    const user = {
      id: VALID_ID,
      username: "alice",
      email: "alice@test.com",
      isAdmin: false,
      isEmailVerified: true,
      profilePicture: "data:image/png;base64,...",
      createdAt: new Date("2024-01-01"),
      password: "should-not-appear",
    };
    const result = formatUserResponse(user);
    expect(result).toEqual({
      id: VALID_ID,
      username: "alice",
      email: "alice@test.com",
      isAdmin: false,
      isEmailVerified: true,
      profilePicture: "data:image/png;base64,...",
      createdAt: user.createdAt,
    });
    expect(result).not.toHaveProperty("password");
  });
});

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------
describe("createUser", () => {
  test("returns 400 when required fields are missing", async () => {
    const req = { body: { username: VALID_USERNAME } }; // no email or password
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when email format is invalid", async () => {
    const req = { body: { username: VALID_USERNAME, email: "invalid-email", password: VALID_PASSWORD } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid email format." }));
  });

  test("returns 400 when password strength is insufficient", async () => {
    const req = { body: { username: VALID_USERNAME, email: VALID_EMAIL, password: "123" } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Password must be at least 8 characters long.") }));
  });

  test("returns 409 when username or email already exists", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue({ id: OTHER_ID });

    const req = { body: { username: VALID_USERNAME, email: VALID_EMAIL, password: VALID_PASSWORD } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "username or email already exists",
    });
  });

  test("returns 201 for a regular user with valid inputs", async () => {
    _findUserByUsernameOrEmail.mockResolvedValue(null);
    const createdUser = {
      id: VALID_ID,
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      isAdmin: false,
      createdAt: new Date(),
    };
    _createUser.mockResolvedValue(createdUser);

    const req = { body: { username: VALID_USERNAME, email: VALID_EMAIL, password: VALID_PASSWORD } };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.data.username).toBe(VALID_USERNAME);
  });
});

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------
describe("updateUser", () => {
  test("returns 400 when updating with invalid password", async () => {
    _findUserById.mockResolvedValue({ id: VALID_ID });
    const req = { body: { password: "weak" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when updating with invalid username", async () => {
    _findUserById.mockResolvedValue({ id: VALID_ID });
    const req = { body: { username: "a" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 200 on a successful update", async () => {
    const existing = { id: VALID_ID, username: "old", email: "old@t.com", isAdmin: false, createdAt: new Date() };
    _findUserById.mockResolvedValue(existing);
    _findUserByUsername.mockResolvedValue(null);
    _findUserByEmail.mockResolvedValue(null);
    _updateUserById.mockResolvedValue({ ...existing, username: "new_valid_username" });

    const req = { body: { username: "new_valid_username" }, params: { id: VALID_ID } };
    const res = mockRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.username).toBe("new_valid_username");
  });
});

// ---------------------------------------------------------------------------
// updateProfilePicture
// ---------------------------------------------------------------------------
describe("updateProfilePicture", () => {
  test("returns 400 if no file is provided", async () => {
    _findUserById.mockResolvedValue({ id: VALID_ID });
    const req = { params: { id: VALID_ID }, file: null };
    const res = mockRes();

    await updateProfilePicture(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No profile picture file provided." });
  });

  test("returns 200 on successful update", async () => {
    const user = { id: VALID_ID, username: "alice" };
    _findUserById.mockResolvedValue(user);
    _updateUserProfilePicture.mockResolvedValue({ ...user, profilePicture: "data:..." });

    const req = {
      params: { id: VALID_ID },
      file: { mimetype: "image/png", buffer: Buffer.from("fake-image") },
    };
    const res = mockRes();

    await updateProfilePicture(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(_updateUserProfilePicture).toHaveBeenCalled();
  });
});
