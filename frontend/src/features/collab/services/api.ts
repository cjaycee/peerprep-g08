import axios from "axios";

export const API_URL = `${import.meta.env.VITE_COLLAB_API_URL}` as string;

export const api = axios.create({
    baseURL: API_URL,
});

export const createRoom = () => api.post("/rooms/create");
export const joinRoom = (roomId: string) =>
    api.post("/rooms/join", { roomId });
export const endRoom = (roomId: string) =>
    api.delete(`/rooms/${roomId}`);