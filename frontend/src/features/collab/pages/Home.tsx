import { useState } from "react";
import { createRoom, joinRoom } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@heroui/react";

/**
 * Collab Dev Page
 */
export default function Home() {
    const [roomIdInput, setRoomIdInput] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            // Updated to handle navigating directly after creation
            const res = await createRoom();
            const newId = res.data.roomId;
            if (newId) {
                navigate(`/room/${newId}`);
            }
        } catch (error) {
            console.error("Create failed:", error);
            alert("Failed to create room. check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!roomIdInput.trim()) return;
        setIsLoading(true);
        try {
            const res = await joinRoom(roomIdInput);
            if (res.data.success) {
                navigate(`/room/${roomIdInput}`);
            }
        } catch (error) {
            console.error("Join failed:", error);
            alert("Room does not exist!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-10 flex flex-col gap-6 max-w-sm">
            <h1 className="text-xl font-bold tracking-tight">Collaboration Dev Mode</h1>
            
            <Button 
                color="primary" 
                size="lg"
                className="font-semibold shadow-md active:scale-95"
                onPress={handleCreate}
                isLoading={isLoading}
            >
                Create New Room
            </Button>

            <div className="flex flex-col gap-2 border-t border-divider pt-6 mt-4">
                <p className="text-sm text-default-500 font-medium">Or join by manual ID:</p>
                <Input
                    placeholder="Enter Room ID"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    variant="bordered"
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <Button 
                    variant="flat" 
                    onPress={handleJoin}
                    isLoading={isLoading}
                    isDisabled={!roomIdInput.trim()}
                >
                    Join Room
                </Button>
            </div>
        </div>
    );
}