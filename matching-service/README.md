## PeerPrep Matching Service
This service is a real-time microservice responsible for pairing users based on their programming language, difficulty level, and topic category. 
It uses **WebSockets (Socket.IO)** for bi-directional communication and **Redis** for managing the waiting queues.

## How it works
The matching service listens on port **3002**. It handles real-time matching requests and manages the matching lifecycle.
- Pair users immediately when matching criteria (language, difficulty, category) are met.
- Automatically removes users from the queue if no match is found within **30 seconds**.
- Automatically cleans up "ghost sockets" if a user disconnects before finding a match.

## Set-Up
1. Install Dependencies
In the `matching-service` folder:
npm install


2. Config Env Variables
Create `.env` file in the `matching-service` folder:

PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379


## Running the service
Run:
```bash
node index.js
```

Ensure that you run in this sequence:
1. Redis (Port 6379)
2. Matching Service (Port 3002)
3. API Gateway (Port 3000)

## Verification
You can verify if the service is running by visiting:
`http://localhost:3002/`

To verify the matching logic, you can run the standalone test script from this directory:
```bash
node test-matching.js
```

## WebSocket API
The service accepts connections via `ws://localhost:3002` (or through the API Gateway).

- **Event (Emit):** `find-match`
  - Payload: `{ userId, language, difficulty, category }`
- **Event (On):** `match-found`
  - Payload: `{ roomId, partnerId }`
- **Event (On):** `match-timeout`
  - Payload: `{ message }`
