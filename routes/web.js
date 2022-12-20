const menus = require('../app/model/menus');
const user = require('../app/model/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

const allroutes = (app)=>{


    app.get('/',async (req,res)=>{

        const data = await menus.find();

        res.render('home',{pizzas:data});
    })




    app.get('/cart', (req, res,nex) => {
        res.render('customers/cart')
    })





    app.get('/login', (req, res) => {
        res.render('auth/login')
    })

    app.post('/login', (req, res,next) => {
        const { email, password }   = req.body
           // Validate request 
            if(!email || !password) {
                req.flash('error', 'All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message )
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message )
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message ) 
                        return next(err)
                    }

                    return res.redirect('/');
                })
            })(req, res, next)
    })



    app.get('/register', (req, res) => {
        
        res.render('auth/register');
    })


    app.post('/register', async (req, res) => {

        const {name,email,password} = req.body;

        if(!name || !email || !password){

            // ---------local jugad-------------
                // error = {
                //     name:name,
                //     email:email,
                //     error:'All fields are reqsa'
                // }
            // ---------local jugad-------------


            req.flash('error','All fields are requied')
            req.flash('name',name);
            req.flash('email',email);
            
            return res.redirect('/register');
        }
        
        const hashpass = await bcrypt.hash(req.body.password,10);
 
        let use = new user({
            name:req.body.name,
            email:req.body.email,
            password:hashpass
        });
        
        try{
            const exit = await user.exists({email:email});
            if(exit)
            {
                req.flash('error','user already exit')
                req.flash('name',name);
                req.flash('email',email);
                return res.redirect('/register');
            }
        }catch(err)
        {
            req.flash('error','oop! some error occur')
            req.flash('name',name);
            req.flash('email',email);
            return res.redirect('/register');
        }

        const result = await use.save();
        console.log('you data is saved');

        return res.redirect('/');
        

    })


    app.post('/update-cart',(req,res)=>{
        
        // console.log(req.body );

        if(!req.session.cart)
        {
            req.session.cart = {
                item:{},
                totalqty:0,
                totalprice:0
            }
        }

        let cart = req.session.cart;

        if(cart.item[req.body._id])
        {
            cart.item[req.body._id].qty = cart.item[req.body._id].qty+1; 
        }
        else
        {
            cart.item[req.body._id] = {pizza:req.body,qty:1};
        }

        cart.totalprice += req.body.price;
        cart.totalqty++;
        console.log(cart);
        

        return res.json(cart);
 
    })


}

module.exports = allroutes;