const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const allroutes = require('./routes/web');
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events');

// ----------------------------------------------------------------------------------------------------
mongoose.set("strictQuery", false);
DB_URL = "" //add URL
const app = express();

// ----------------------------------------------------------------------------------------------------

const mongoStore = MongoStore.create({
    mongoUrl: DB_URL,
    collectionName: "sessions",
  });
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(expressLayout);
app.use(session({
    secret:'thisissecret',
    resave:false,
    saveUninitialized:false,
    store: mongoStore,
    cookie:{maxAge:1000*60*60*24}
    
}))
app.use(flash());
app.set('views', __dirname+'/resources/views');
app.set('view engine','ejs');
const eventEmitter = new Emitter();
app.set('eventEmitter',eventEmitter);

const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use((req,res,next)=>{
    // console.log(req.session);
    res.locals.session = req.session;
    // console.log('---');
    // console.log(req.user);
    res.locals.user = req.user;
    next();
})

allroutes(app);


// ----------------------------------------------------------------------------------------------------
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) =>{
    console.log('Database connected....')
}
).catch((err) => console.log(err));
// ------------------------------------------------------------------------------------------------
const server = app.listen(PORT,()=>{
    console.log('here we go ${app_port}');
})
// --------------------------------shocket--------------------------------------------------------------------


const io = require('socket.io')(server);
io.on('connection',(socket)=>{
    socket.on('join',(room1)=>{
        console.log(room1);
        socket.join(room1);
    })

})

eventEmitter.on('orderUpdate',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdate',data);
})


eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data);
})
