"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = noteIOHandler;
function noteIOHandler(io, socket) {
    socket.on('join-room', (room) => {
        socket.join(room);
    });
}
