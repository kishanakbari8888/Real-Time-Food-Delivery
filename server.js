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
// ----------------------------------------------------------------------------------------------------
mongoose.set("strictQuery", false);
DB_URL = "mongodb+srv://nodedemo:nodedemo@nodecazzy.zasfn3a.mongodb.net/Pizza?retryWrites=true&w=majority"
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


// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
app.use((req,res,next)=>{
    // console.log(req.session);
    res.locals.session = req.session;
    // console.log('---');
    // console.log(req.user);
    res.locals.user = req.user;
    next();
})

// ----------------------------------------------------------------------------------------------------


allroutes(app);


// ----------------------------------------------------------------------------------------------------

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) =>{
    app.listen(PORT,()=>{
        console.log('here we go ${app_port}');
    })
}
).catch((err) => console.log(err));

// ----------------------------------------------------------------------------------------------------
