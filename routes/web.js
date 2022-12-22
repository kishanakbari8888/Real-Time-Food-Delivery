const menus = require('../app/model/menus');
const user = require('../app/model/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {guest,auth, admincheck} = require('./middleware/guest');
const order = require('../app/model/orders');
const flash = require('express-flash');
const moment = require('moment');
const { populate } = require('../app/model/menus');
const orders = require('../app/model/orders');
const allroutes = (app)=>{


    app.get('/',async (req,res)=>{

        const data = await menus.find();

        res.render('home',{pizzas:data});
    })




    app.get('/cart',auth, (req, res,nex) => {
        res.render('customers/cart')
    })




    app.get('/login',guest,(req, res) => {
        res.render('auth/login')
    })

    app.post('/logout',(req,res)=>{
        req.logout((err)=>{
            return res.redirect('/login');
        })
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

                    if(req.user.role=='admin'){
                        return res.redirect('/admin/orders');
                    }
                    else{
                        return res.redirect('/');
                    }

                })
            })(req, res, next)
    })



    app.get('/register',guest,(req, res) => {
        
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

        return res.redirect('/');
        

    })


    app.post('/update-cart',(req,res)=>{
        

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
        

        return res.json(cart);
 
    })

    app.post('/orders',async (req,res)=>{

        const {phone,address} = req.body;
        if(!phone || !address){
            req.flash('error','All fields are required');
            return res.redirect('/cart');

        }

        const orde = new order({
            customerId:req.user._id,
            items:req.session.cart.item,
            phone:phone,
            address:address
        }) 

        const result = await orde.save();
        order.populate(result,{path:'customeId'}, (err,placedorder)=>{
            
            req.flash('success','Order placed successfully');
            delete req.session.cart;
    
            const eventEmitter = app.get('eventEmitter');
            eventEmitter.emit('orderPlaced',result);

        });

        return res.redirect('/order');
    })

    app.get('/order',auth,async (req,res)=>{

        const orders = await order.find({customerId:req.user._id},null,{sort:{'createdAt':-1}});
        res.render('customers/orders',{orders:orders,moment:moment});
    })

    app.get('/admin/orders',admincheck ,async (req,res)=>{
        order.find({status:{$ne:'competed'}},null,{sort:{'createdAt':-1}}).populate
        ('customerId','-password').exec((err,orde)=>{
            // console.log(orde)
            if(req.xhr){
                return res.json(orde);
            }
            res.render('admin/orders');
        })
    })

    app.post('/admin/order/status',async (req,res)=>{

        // console.log(req.body);
        const data = await orders.updateOne({_id:req.body.orderId},{status:req.body.status});
        // console.log(data);
        const eventEmitter = app.get('eventEmitter');
        eventEmitter.emit('orderUpdate',{id:req.body.orderId,status:req.body.status});

        res.redirect('/admin/orders');
    })

    app.get('/customer/orders/:id',async (req,res)=>{
        const orde = await order.findById(req.params.id);

        // console.log(req.user._id);
        // console.log(orde);
        // console.log('#######################');
        if(req.user._id.toString()===orde.customerId.toString()){
            return res.render('customers/singleorders',{order:orde});
        }
        
        return res.redirect('/');

    })

}

module.exports = allroutes;