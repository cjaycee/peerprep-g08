import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync.js";
import * as encoding from "lib0/encoding.js";
import * as decoding from "lib0/decoding.js";

// temporary in-memory map, to be upgraded to Redis later
// roomId → { ydoc: Y.Doc, clients: Set<WebSocket> }
const rooms = new Map();

const wss = new WebSocketServer({ noServer: true });

export function setupYjsHandler(server) {
  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/yjs/")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (ws, req) => {
    const roomId = req.url.replace("/yjs/", "");

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { ydoc: new Y.Doc(), clients: new Set() });
    }
    const room = rooms.get(roomId);
    // send the new client the current doc state so they're caught up
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0);
    syncProtocol.writeSyncStep1(encoder, room.ydoc);

    ws.send(Buffer.from(encoding.toUint8Array(encoder)));
    room.clients.add(ws);

    ws.on("message", (data) => {
      try {
        const decoder = decoding.createDecoder(new Uint8Array(data));
        const messageType = decoding.readVarUint(decoder);

        if (messageType === 0) {
          // sync message — handle and possibly send a response
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0);
          syncProtocol.readSyncMessage(decoder, encoder, room.ydoc, null);
          const response = encoding.toUint8Array(encoder);
          if (response.byteLength > 1) {
            ws.send(Buffer.from(response));
          }
        }
        // type 1 = awareness — just broadcast as-is, no decoding needed

        // broadcast raw message to all other clients regardless of type
        for (const client of room.clients) {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(Buffer.from(data));
          }
        }
      } catch (err) {
        console.error("Yjs message error:", err);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    ws.on("close", (code, reason) => {
      room.clients.delete(ws);
    });
  });

  wss.on("error", (err) => {
    console.error("WSS error:", err);
  });
}
