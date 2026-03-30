import { useState } from "react";
import { createRoom, joinRoom } from "../services/api";
import { useNavigate } from "react-router-dom";

/**
 * Page to test the frontend features of the collaboration page.
 * Actual Creating and Joining logic will be done by matching service after integration.
 *
 * @constructor
 */
export default function Home() {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleCreate = async () => {
        const res = await createRoom();
        setRoomId(res.data.roomId);
    };

    const handleJoin = async () => {
        try {
            await joinRoom(roomId);
            navigate(`/room/${roomId}`);
        } catch {
            alert("Room does not exist!");
        }
    };

    return (
        <div className="p-10">
            <button onClick={handleCreate} className="btn">
                Create Room
            </button>

            <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border ml-4"
            />

            <button onClick={handleJoin} className="ml-2">
                Join
            </button>
        </div>
    );
}