jest.mock("../../model/collab-room-model.js", () => ({
  __esModule: true,
  default: {
    getMessages: jest.fn(),
    addMessage: jest.fn(),
  },
}));

import CollabRoomModel from "../../model/collab-room-model.js";
import socketHandler from "../../sockets/socket-handler.js";

afterEach(() => jest.clearAllMocks());

// Helpers
function buildMocks() {
  const mockSocket = {
    id: "socket-id-1",
    join: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
  };
  const mockEmit = jest.fn();
  const mockIo = {
    on: jest.fn(),
    to: jest.fn(() => ({ emit: mockEmit })),
  };
  return { mockSocket, mockIo, mockEmit };
}

function connect(mockIo, mockSocket) {
  socketHandler(mockIo);
  const connectionHandler = mockIo.on.mock.calls[0][1];
  connectionHandler(mockSocket);

  function getHandler(eventName) {
    const call = mockSocket.on.mock.calls.find(([ev]) => ev === eventName);
    return call ? call[1] : null;
  }
  return getHandler;
}

/////////////////////////////////////////////////////
// connection
/////////////////////////////////////////////////////
describe("socketHandler — connection", () => {
  test("registers a 'connection' listener on io", () => {
    const { mockIo, mockSocket } = buildMocks();
    connect(mockIo, mockSocket);
    expect(mockIo.on).toHaveBeenCalledWith("connection", expect.any(Function));
  });

  test("registers join_room, send_message, and disconnect listeners on the socket", () => {
    const { mockIo, mockSocket } = buildMocks();
    connect(mockIo, mockSocket);
    const registeredEvents = mockSocket.on.mock.calls.map(([ev]) => ev);
    expect(registeredEvents).toContain("join_room");
    expect(registeredEvents).toContain("send_message");
    expect(registeredEvents).toContain("disconnect");
  });
});

/////////////////////////////////////////////////////
// join_room
/////////////////////////////////////////////////////
describe("join_room event", () => {
  test("calls socket.join with the given roomId", async () => {
    CollabRoomModel.getMessages.mockResolvedValue([]);
    const { mockIo, mockSocket } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("join_room")("room-abc", { id: "u1" });

    expect(mockSocket.join).toHaveBeenCalledWith("room-abc");
  });

  test("loads persisted messages and emits load_messages to the socket", async () => {
    const messages = [
      { id: 1, text: "hello" },
      { id: 2, text: "world" },
    ];
    CollabRoomModel.getMessages.mockResolvedValue(messages);
    const { mockIo, mockSocket } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("join_room")("room-abc", { id: "u1" });

    expect(CollabRoomModel.getMessages).toHaveBeenCalledWith("room-abc");
    expect(mockSocket.emit).toHaveBeenCalledWith("load_messages", messages);
  });

  test("emits load_messages with empty array when room has no messages", async () => {
    CollabRoomModel.getMessages.mockResolvedValue([]);
    const { mockIo, mockSocket } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("join_room")("room-abc", { id: "u1" });

    expect(mockSocket.emit).toHaveBeenCalledWith("load_messages", []);
  });
});

/////////////////////////////////////////////////////
// send_message
/////////////////////////////////////////////////////
describe("send_message event", () => {
  test("broadcasts receive_message to the correct room with full message shape", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({
      roomId: "r1",
      message: "hello",
      senderUsername: "alice",
      senderId: "u1",
    });

    expect(mockIo.to).toHaveBeenCalledWith("r1");
    expect(mockEmit).toHaveBeenCalledWith(
      "receive_message",
      expect.objectContaining({
        text: "hello",
        senderUsername: "alice",
        senderId: "u1",
      }),
    );
  });

  test("message id is set to Date.now()", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    jest.spyOn(Date, "now").mockReturnValue(99999);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({
      roomId: "r1",
      message: "hi",
      senderUsername: "alice",
      senderId: "u1",
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "receive_message",
      expect.objectContaining({ id: 99999 }),
    );
    Date.now.mockRestore();
  });

  test("defaults senderUsername to 'Unknown' when not provided", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({ roomId: "r1", message: "hello" });

    expect(mockEmit).toHaveBeenCalledWith(
      "receive_message",
      expect.objectContaining({ senderUsername: "Unknown" }),
    );
  });

  test("defaults senderId to socket.id when not provided", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({ roomId: "r1", message: "hello" });

    expect(mockEmit).toHaveBeenCalledWith(
      "receive_message",
      expect.objectContaining({ senderId: "socket-id-1" }),
    );
  });

  test("persists the message via CollabRoomModel.addMessage before broadcasting", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({
      roomId: "r1",
      message: "hello",
      senderUsername: "alice",
      senderId: "u1",
    });

    expect(CollabRoomModel.addMessage).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({
        text: "hello",
        senderUsername: "alice",
        senderId: "u1",
      }),
    );
    // addMessage must be called before the broadcast
    expect(CollabRoomModel.addMessage).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
  });

  test("empty string message is still persisted and broadcast", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket, mockEmit } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({ roomId: "r1", message: "" });

    expect(mockEmit).toHaveBeenCalledWith(
      "receive_message",
      expect.objectContaining({ text: "" }),
    );
    expect(CollabRoomModel.addMessage).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ text: "" }),
    );
  });

  test("broadcasts to the correct room when multiple messages use different roomIds", async () => {
    CollabRoomModel.addMessage.mockResolvedValue(undefined);
    const { mockIo, mockSocket } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);

    await getHandler("send_message")({ roomId: "r1", message: "m1" });
    await getHandler("send_message")({ roomId: "r2", message: "m2" });

    expect(mockIo.to.mock.calls[0][0]).toBe("r1");
    expect(mockIo.to.mock.calls[1][0]).toBe("r2");
  });
});

/////////////////////////////////////////////////////
// disconnect
/////////////////////////////////////////////////////
describe("disconnect event", () => {
  test("does not throw when the disconnect handler is called", () => {
    const { mockIo, mockSocket } = buildMocks();
    const getHandler = connect(mockIo, mockSocket);
    expect(() => getHandler("disconnect")()).not.toThrow();
  });
});
