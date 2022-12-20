
const guest = (req,res,next)=>{
    if(req.user){
        return res.redirect('/');
    }

    next();
}

const auth = (req,res,next)=>{
    if(!req.user){
        return res.redirect('/login');
    }

    next();
}


const admincheck = (req,res,next)=>{
    if(req.user && req.user.role==='admin'){
        return next();
    }

    return res.redirect('/');
}



module.exports = {guest,auth,admincheck};