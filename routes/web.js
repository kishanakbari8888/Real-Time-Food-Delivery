const menus = require('../app/model/menus')

const allroutes = (app)=>{
    
    app.get('/',async (req,res)=>{

        const data = await menus.find();

        res.render('home',{pizzas:data});
    })




    app.get('/cart', (req, res) => {
        res.render('customers/cart')
    })





    app.get('/login', (req, res) => {
        res.render('auth/login')
    })




    app.get('/register', (req, res) => {
        res.render('auth/register')
    })

    app.post('/update-cart',(req,res)=>{
        
        console.log(req.body );

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