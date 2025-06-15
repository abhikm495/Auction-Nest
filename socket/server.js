import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { Server } from 'socket.io';
import { createServer } from 'http';
import { connectDB } from './connection.js';
import User from './models/user.js';
import { verifyToken } from './utils/jwt.js';

dotenv.config();

const port = process.env.SOCKET_PORT || 4000;
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        process.env.CLIENT_ORIGIN ,
        process.env.API_ORIGIN,
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

// Connect to database
connectDB();

// Basic health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        msg: 'Socket Server is running', 
        timestamp: new Date().toISOString(),
        status: 'healthy'
    });
});

// Health check for monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'socket-server' });
});

// Notification endpoint for receiving events from REST API
app.post('/notify', (req, res) => {
    try {
        const { eventType, data } = req.body;
        
        if (!eventType || !data) {
            return res.status(400).json({ error: 'Missing eventType or data' });
        }

        console.log(`Received notification: ${eventType}`, data);

        switch (eventType) {
            case 'newBid':                
                // Extract bidData and auctionId from data
                const { bidData, auctionId } = data;

                // Check if bidData and auctionId are present
                if (!bidData || !auctionId) {
                    return res.status(400).json({ error: 'Missing bidData or auctionId' });
                }

                // Broadcast new bid to auction room
                io.to(`auction_${auctionId}`).emit('newBid', {
                    bidAmount: bidData.bidAmount,
                    bidder: bidData.bidder,
                    bidTime: bidData.bidTime,
                    auctionId: auctionId
                });

                // Also send auction update
                io.to(`auction_${auctionId}`).emit('auctionUpdate', {
                    auctionId: auctionId,
                    currentPrice: bidData.bidAmount, // Use bidData.bidAmount
                    lastBidder: bidData.bidder.name,
                    timestamp: bidData.bidTime
                });
                break;

            case 'auctionEnded':
                // Broadcast auction end to all participants
                io.to(`auction_${data.auctionId}`).emit('auctionEnded', {
                    auctionId: data.auctionId,
                    winner: data.winner,
                    finalPrice: data.finalPrice,
                    endDate: data.endDate
                });
                break;

            case 'auctionUpdate':
                // Broadcast general auction updates
                io.to(`auction_${data.auctionId}`).emit('auctionUpdate', data);
                break;

            default:
                console.warn(`Unknown event type: ${eventType}`);
                return res.status(400).json({ error: 'Unknown event type' });
        }

        res.status(200).json({ message: 'Notification processed successfully' });
    } catch (error) {
        console.error('Error processing notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const server = createServer(app);

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_ORIGIN,
            process.env.API_ORIGIN 
        ],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Cookie"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Helper function to parse cookies
const parseCookies = (cookieString) => {
    const cookies = {};
    if (cookieString) {
        cookieString.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
        });
    }
    return cookies;
};

// Socket.IO authentication middleware
io.use(async (socket, next) => {
    try {
        // Parse cookies and extract auth_token
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies.auth_token;

        if (!token) {
            console.log('No auth token found in cookies');
            return next(new Error('Authentication token not found'));
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.log('User not found for token');
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userName = user.name;
        socket.userEmail = user.email;
        next();
    } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication error'));
    }
});

// Track connected users and active auctions
const connectedUsers = new Map();
const activeAuctions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User ${socket.userName} (${socket.userId}) connected`);
    
    // Add user to connected users map
    connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userName: socket.userName,
        userEmail: socket.userEmail,
        connectedAt: new Date()
    });

    // Join auction room
    socket.on('joinAuction', (auctionId) => {
        socket.join(`auction_${auctionId}`);
        console.log(`User ${socket.userName} joined auction ${auctionId}`);
        
        // Track auction participants
        if (!activeAuctions.has(auctionId)) {
            activeAuctions.set(auctionId, new Set());
        }
        activeAuctions.get(auctionId).add(socket.userId);
        
        // Notify others in the auction room about new participant
        socket.to(`auction_${auctionId}`).emit('userJoined', {
            userId: socket.userId,
            userName: socket.userName,
            timestamp: new Date().toISOString()
        });
    });

    // Leave auction room
    socket.on('leaveAuction', (auctionId) => {
        socket.leave(`auction_${auctionId}`);
        console.log(`User ${socket.userName} left auction ${auctionId}`);
        
        // Remove from auction participants
        if (activeAuctions.has(auctionId)) {
            activeAuctions.get(auctionId).delete(socket.userId);
            if (activeAuctions.get(auctionId).size === 0) {
                activeAuctions.delete(auctionId);
            }
        }
        
        // Notify others in the auction room about participant leaving
        socket.to(`auction_${auctionId}`).emit('userLeft', {
            userId: socket.userId,
            userName: socket.userName,
            timestamp: new Date().toISOString()
        });
    });

    // Handle bid placement (broadcast to other users in the room)
    socket.on('placeBid', (bidData) => {
        console.log(`Bid placed by ${socket.userName} in auction ${bidData.auctionId}: $${bidData.bidAmount}`);
        
        // Validate bid data
        if (!bidData.auctionId || !bidData.bidAmount || !bidData.bidder) {
            socket.emit('bidError', { message: 'Invalid bid data' });
            return;
        }
        
        // Broadcast to all users in the auction room except the sender
        socket.to(`auction_${bidData.auctionId}`).emit('newBid', {
            bidAmount: bidData.bidAmount,
            bidder: {
                _id: bidData.bidder._id,
                name: bidData.bidder.name
            },
            bidTime: bidData.bidTime || new Date().toISOString(),
            auctionId: bidData.auctionId
        });
        
        // Also broadcast auction update for real-time price changes
        socket.to(`auction_${bidData.auctionId}`).emit('auctionUpdate', {
            auctionId: bidData.auctionId,
            currentPrice: bidData.bidAmount,
            lastBidder: bidData.bidder.name,
            timestamp: bidData.bidTime || new Date().toISOString()
        });
    });

    // Handle auction end notification
    socket.on('endAuction', (auctionData) => {
        console.log(`Auction ${auctionData.auctionId} ended`);
        
        io.to(`auction_${auctionData.auctionId}`).emit('auctionEnded', {
            auctionId: auctionData.auctionId,
            winner: auctionData.winner,
            finalPrice: auctionData.finalPrice,
            endDate: auctionData.endDate || new Date().toISOString()
        });
    });

    // Handle typing indicators (optional feature)
    socket.on('typing', (data) => {
        socket.to(`auction_${data.auctionId}`).emit('userTyping', {
            userId: socket.userId,
            userName: socket.userName,
            isTyping: data.isTyping
        });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`User ${socket.userName} disconnected: ${reason}`);
        
        // Remove from connected users
        connectedUsers.delete(socket.userId);
        
        // Remove from all active auctions
        activeAuctions.forEach((participants, auctionId) => {
            if (participants.has(socket.userId)) {
                participants.delete(socket.userId);
                
                // Notify other participants
                socket.to(`auction_${auctionId}`).emit('userLeft', {
                    userId: socket.userId,
                    userName: socket.userName,
                    timestamp: new Date().toISOString()
                });
                
                // Clean up empty auctions
                if (participants.size === 0) {
                    activeAuctions.delete(auctionId);
                }
            }
        });
    });

    // Handle connection errors
    socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userName}:`, error);
    });
});

// API endpoints for monitoring (optional)
app.get('/stats', (req, res) => {
    res.json({
        connectedUsers: connectedUsers.size,
        activeAuctions: activeAuctions.size,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Socket server closed');
        process.exit(0);
    });
});

server.listen(port, () => {
    console.log(`Socket server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});