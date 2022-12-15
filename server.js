const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');




const app = express();
app.use(express.static('public'));



app.get('/',(req,res)=>{
    res.render('home');
})

app.use(expressLayout);
app.set('views', __dirname+'/resources/views');
app.set('view engine','ejs');



const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log('listening in port 5000')
})

