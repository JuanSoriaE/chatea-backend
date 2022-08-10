// Node modules
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');

// Server
const app = express();
const server = http.createServer(app);

// Settings
app.set('port', process.env.PORT || 5000);

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes, DB
const userRouter = require('./routes/user.routes');
const chatRouter = require('./routes/chat.routes');
app.use(userRouter, chatRouter);
const connectDB = require('./db/db.index');

// Socket
const { socketController } = require('./socket/socket.controller');

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => socketController(socket, io));

// Main function
async function main() {
    await connectDB();
    server.listen(app.get('port'), () => {
        console.log('[+] Server on port ' + app.get('port'));
    });
}

main();
