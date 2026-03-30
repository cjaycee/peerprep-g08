import { v4 as uuidv4 } from "uuid";
import RoomModel from "../model/room-model.js";

export const createRoom = (req, res) => {
    const id = uuidv4();
    const room = RoomModel.create(id);

    res.json({ roomId: room.id });
};

export const joinRoom = (req, res) => {
    const { roomId } = req.body;

    const room = RoomModel.findById(roomId);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }

    res.json({ success: true });
};

export const endRoom = (req, res) => {
    const { roomId } = req.params;

    RoomModel.remove(roomId);

    res.json({ success: true });
};