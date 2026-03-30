export const rooms = new Map();

export function createRoom(id) {
    rooms.set(id, {
        id,
        users: [],
        messages: [],
    });
}

export function getRoom(id) {
    return rooms.get(id);
}

export function deleteRoom(id) {
    rooms.delete(id);
}