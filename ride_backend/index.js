import dotenv from "dotenv";
import pool from './config/db.js';
import app from "./src/app.js";

import { createServer } from 'node:http';
import {Server} from "socket.io";

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const server = createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",   // frontend url
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Joining the room for the ride 
    socket.on('joinRoom', async(rideId) => {
      socket.join(rideId);
      console.log(`User ${socket.id} joined room ${rideId}`);
    
    // Send previous messages from DB
    try {
        const result = await pool.query(
          'SELECT chats.*, users.name FROM chats INNER JOIN users ON chats.user_id = users.id WHERE ride_id = $1 ORDER BY timestamp ASC',
          [rideId]
        );
        socket.emit('chat history', result.rows);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    });

    

    // Listening for new messages
    socket.on('chat message', async ({ rideId, user, message }) => {
        try {
            // Save to DB
            const res = await pool.query(
              'SELECT name FROM users WHERE id = $1',
              [user.id]
            );
            const user_id = user.id;
            const name = res.rows[0].name;
            await pool.query(
              'INSERT INTO chats (ride_id, user_id, message) VALUES ($1, $2, $3)',
              [rideId, user.id, message]
            );
    
          // Broadcast to other clients in the same ride room
          io.to(rideId).emit('chat message', {
            rideId,
            user_id,
            name,
            message,
            timestamp: new Date(), // client can format
          });
        } catch (err) {
          console.error('Error saving message:', err);
        }
      });

      // On disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));