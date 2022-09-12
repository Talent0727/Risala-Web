const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const cors = require('cors');
const env = require('dotenv').config();
const mysql_database = require('./config');
const socketFunction = require('./socketFunction')

const { createServer } = require("http");
const { Server } = require("socket.io");


/***************** Configuration ***************** */
/////////////////////////////////////////////////////
const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer, {   
    cors: { 
        origin: JSON.parse(process.env.CORS_ORIGIN),
        methods: ["GET", "POST"]
    },
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())
app.disable('etag');

httpServer.listen(process.env.SERVER_PORT, () =>{
    console.log(`running on port ${process.env.SERVER_PORT}`)
})
///////////////////////////////////////////////////////

//Routes
const uploadRouter      = require('./routes/upload');
const mailRouter        = require('./routes/mail');
const dirRouter         = require('./routes/dir');
const accountRouter     = require('./routes/accounts')
const chatRouter        = require('./routes/chat');
const loginRouter       = require('./routes/login');
const errorRouter       = require('./routes/error');
const projectsRouter    = require('./routes/projects');

var route = process.env.EXPRESS_ROUTE

app.use(route + '/upload', uploadRouter);
app.use(route + '/mail', mailRouter);
app.use(route + '/dir', dirRouter);
app.use(route + '/accounts', accountRouter);
app.use(route + '/chat', chatRouter);
app.use(route + '/login', loginRouter);
app.use(route + '/error', errorRouter)
app.use(route + '/projects', projectsRouter);

app.route(route + '/webscraping')
.post((req, res) => {
    if(req.body.request){
        let request = req.body.request;
        if(request === "reviews"){
            let sql = "SELECT * FROM Reviews WHERE rating = 5";
            mysql_database.query(sql, (err, result) => {
                if(result){
                    res.status(200).send(result)
                } else if(err){
                    res.status(500).send(err)
                }else{
                    res.status(400).send({data: "Data selection failed!"})
                }
            })
        }
    }
})


//Web-socket
io.on('connection', (socket) => {
    socket.on('message', (data) => {
        if(data.reply === true){
            socketFunction.sendReply(data)
        } else {
            socketFunction.sendMessage(data)
        }
        socket.to(data.room).emit('message', data)
    })
    socket.on('typing', (data) => {
        socket.to(data.id).emit('typing', data) //data.id is an array of ids
    })

    
    socket.on('disconnect', (data) => {
        console.log(`User Disconnected: ${socket.id}`);
    });

    socket.on('remove', (data) => {
        socketFunction.removeMessage(data)
        socket.to(data.id).emit('remove', data) //data.id is an array of ids (counterparts)
    })

    socket.on('group-exit', (data) => {
        socket.to(data.room).emit('group-exit', data) //data.room is a single id
    })

    socket.on('group-join', (data) => {
        socket.to(data).emit('group-join') //Data is an array of ids
    })

    //Join socket
    socket.on('join', (data) => {
        socket.join(data)
    })

    /*******************************************************/
    /*                        CALLS                        */
    /*******************************************************/
    socket.on('call-init', (data) => {
        console.log('**** CALL INIT *****', data.room)
        socket.to(data.room).emit('call-init', data)
    })
    
    socket.on('call-closed', (data) => {
        console.log('call-closed', data.room)
        socket.to(data.room).emit('call-closed', data)
    })

    socket.on('call-join', (data) => {
        console.log('Call-joined', data.room)
        socket.to(data.room).emit('call-join', data)
    })

    socket.on('call-message', (data) => {
        socket.to(data.room).emit('call-message', data)
    })

    socket.on('call-error', (data) => {
        console.log('**** CALL ERROR *****', data.room)
        socket.to(data.room).emit('call-error', data)
    })
});