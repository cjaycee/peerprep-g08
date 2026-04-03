const redisClient = require('../config/redis');
const { getQueueKeys } = require('../utils/queueKeys');
const { socketState, enlistInQueues, cleanupSocket } = require('../services/matchingService');

const handleFindMatch = async (io, socket, data) => {
  const { userId, languages, topics, difficulty } = data;

  // Basic validation
  if (!userId || !Array.isArray(languages) || languages.length === 0 ||
      !Array.isArray(topics) || topics.length === 0 || !difficulty) {
    socket.emit('error', { message: 'Invalid find-match payload.' });
    return;
  }

  // Re-joining Attempt
  if (socketState.has(socket.id)) {
    console.log(`User ${userId} (${socket.id}) re-joining — clearing previous search state`);
    await cleanupSocket(socket.id);
  }

  const criteria = { languages, topics, difficulty };

  // This allows me to search for user in queue in one lookup
  const serializedEntry = JSON.stringify({ socketId: socket.id, userId });

  // Mark this user as actively waiting in Redis so concurrent match attempts
  await redisClient.set(`user_state:${userId}`, 'WAITING', { EX: 300 });

  socketState.set(socket.id, {
    userId,
    serializedEntry,
    queues: new Set(),
    relaxationTimers: [],   // populated later
    statusInterval: null,   // populated later
    startedAt: Date.now(),
    relaxationLevel: 0,
    criteria,
  });

  console.log(`User ${userId} (${socket.id}) searching — languages: [${languages}], topics: [${topics}], difficulty: ${difficulty}`);

  const initialKeys = getQueueKeys(criteria, 0);
  await enlistInQueues(io, socket, initialKeys);
};

const handleDisconnect = async (socket) => {
  console.log('User disconnected:', socket.id);
  // Replace later
};

module.exports = {
  handleFindMatch,
  handleDisconnect,
};
