import { useParams, useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import { joinRoom, endRoom } from "../services/api";
import { useEffect } from "react";

export default function Room() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Validate room on mount
    useEffect(() => {
        const checkRoom = async () => {
            try {
                await joinRoom(id!);
            } catch {
                alert("Room does not exist!");
                navigate("/");
            }
        };
        checkRoom();
    }, [id, navigate]);

    const handleEnd = async () => {
        try {
            await endRoom(id!);
        } catch {
            alert("Room does not exist or already ended");
        }
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Main Room Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Room: {id}</h1>
                    <button
                        onClick={handleEnd}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        End Room
                    </button>
                </div>

                {/* Room details area */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <p className="text-gray-700">
                        Welcome to the room! Use the chat to communicate in real-time.
                    </p>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-1/3 border-l border-gray-300 p-4 bg-white shadow-lg flex flex-col">
                <Chat roomId={id!} />
            </div>
        </div>
    );
}