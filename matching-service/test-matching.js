const { io } = require("socket.io-client");

const GATEWAY_URL = "http://localhost:3002";

const createClient = (name, userId, language, difficulty, category) => {
  const socket = io(GATEWAY_URL, {
    reconnection: false,
    transports: ["websocket"] 
  });

  socket.on("connect", () => {
    console.log(`[${name}] Searching for ${language}/${difficulty}/${category}...`);
    socket.emit("find-match", { userId, language, difficulty, category });
  });

  socket.on("match-found", (data) => {
    console.log(`[${name}] Match found!`);
    console.log(`      Room: ${data.roomId}`);
    console.log(`      Partner Socket: ${data.partnerId}`);
    socket.disconnect();
  });

  socket.on("match-timeout", (data) => {
    console.log(`[${name}] Timeout: ${data.message}`);
    socket.disconnect();
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") {
      console.log(`[${name}] Test completed.`);
    } else {
      console.log(`[${name}] Disconnected: ${reason}`);
    }
  });

  socket.on("connect_error", (err) => {
    console.log(`[${name}]Connection Error: ${err.message}`);
  });

  return socket;
};

async function runTests() {
  console.log("TEST 1: Simulating two matching users");
  const user1 = createClient("User_1", "id_1", "javascript", "easy", "algorithms");
  
  setTimeout(() => {
    const user2 = createClient("User_2", "id_2", "javascript", "easy", "algorithms");
  }, 1000);

  setTimeout(() => {
    console.log("\nTEST 2: Simulating a user with different criteria (Hard/Strings)...");
    const user3 = createClient("User_3", "id_3", "javascript", "hard", "strings");
  }, 4000);

  setTimeout(() => {
    console.log("\n--- Tests initiated. Waiting for results (approx 30s) ---");
  }, 6000);
}

runTests();
