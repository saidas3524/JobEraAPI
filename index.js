
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require("./models/User");
var Profile = require("./models/Profile");
var jwt = require("jwt-simple");

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

mongoose.connect("mongodb://test:test@ds137246.mlab.com:37246/mydb")
var app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
    done(null, user.id);
})

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
})



var strategyOptions = { usernameField: 'userName' };

var registerStrategyOptions = { usernameField: 'userName', passReqToCallback: true };
var loginStrategy = new LocalStrategy(strategyOptions, function (userName, password, done) {
    var searchUser = { userName: userName }

    User.findOne(searchUser, function (err, user) {
        if (err) return done(err);
        if (!user) {
            return done(null, false, { message: "wrong UserName/password" });
        }
        user.comparePasswords(password, function (err, isValidpassword) {
            if (err) return done(err);
            if (!isValidpassword) {
                return done(null, false, { message: "wrong password" });
            }
            return done(null, user);
        });
    })

});
var registerStrategy = new LocalStrategy(registerStrategyOptions, function (req, name, userName, done) {
    var user = req.body;
    var searchUser = { $or: [{ userName: user.userName }, { email: user.email }] }

    User.find(searchUser, function (err, users) {
        if (err) return done(err);
        if (users && users.length > 0) {
            return done(null, false, { message: "username/email already exists" });
        }
        var newUser = new User({
            name: user.name,
            userName: user.userName,
            email: user.email,
            password: user.password,
            isAdmin: false
        });
        newUser.save(function (err) {
            done(null, newUser);
        })
    })




});

passport.use('local-login', loginStrategy);
passport.use('local-register', registerStrategy);

app.post("/login", function (req, res, next) {
    passport.authenticate('local-login', function (err, user,info) {
        if (err)
            next(err);
        if (!user) {
            return res.send(400, info);

        }
        req.login(user, function (err) {
            if (err)
                next(err);
            createToken(user, res);
        })

    })(req, res, next)
});
app.post("/register", function (req, res, next) {
    passport.authenticate('local-register', function (err, user, info) {
        if (err)
            next(err);

        if (!user) {
            return res.send(400, info);

        }
        req.login(user, function (err) {
            if (err)
                next(err);
            createToken(user, res);
        })

    })(req, res, next)
});

function createToken(user, res) {
    var payload = {
        sub: user._id,
        isAdmin : user.isAdmin
    }

    var jwtoken = jwt.encode(payload, "mysecret");
    return res.status(200).send({
        token: jwtoken,
        user: user.toJSON()

    });

}


app.get("/greetings", function (req, res) {

    checkAuthorisation(req, res);
    res.status(200).send(JSON.stringify({
        greetings: [{}, {}]
    }))
})
app.get("/getUserInfo",function(req,res){
   const {sub,isAdmin} =   checkAuthorisation(req,res);
    var searchUser = { _id: sub }

    User.findOne(searchUser, function (err, user) {
        if (err ) return res.status(400).json({
            message:"something went wrong"
        });
        if (!user) {
            return res.status(400).json({
                message:"user doesnt exist"
            })
        }
        return res.status(200).send(user);
    })
})
app.get("/getProfiles",function(req,res){
    const {sub,isAdmin} =   checkAuthorisation(req,res);
    Profile.find({},function(err,profiles){
        if(err){
          return  res.status(400).json({message:"Unable to fetch Profiles"});
        }
       return res.status(200).json(profiles);

    })
    
 })

 app.get("/getProfileById/:id",function(req,res){
    const {sub,isAdmin}  =   checkAuthorisation(req,res);
    Profile.find({_id:req.params.id},function(err,profile){
        if(err){
          return  res.status(400).json({message:"Unable to fetch Profiles"});
        }
       return res.status(200).json(profile[0]);

    })
    
 })





app.post("/saveProfile",function(req,res){
    const {sub,isAdmin} =   checkAuthorisation(req,res);
    if(!isAdmin)
       return  res.status(401).send({message:"Not authorised to perform this action"})
    var profile = req.body;
    const{sections,personalInfo,id} = profile;
    var resultObj = {
        firstName: personalInfo.firstName,
        dob:personalInfo.dob,
        gender:personalInfo.gender,
        lastName:personalInfo.lastName,
        email:personalInfo.email,
        description:personalInfo.description,
        mobile:personalInfo.mobile,
        address:personalInfo.address,
        sections:sections
     };
    if(id){
        Profile.findByIdAndUpdate(id,{...resultObj},{new:true},function(error,newProfile){
            if(error){
              return  res.status(400).send({message:"Something went wrong"})
            }
           return res.status(200).json(newProfile);
        })
    }
    else{
        var newProfile = new Profile({...resultObj});

        newProfile.save(function(err,response){
            if(err){
               return res.status(400).send({message:"Something went wrong"})
            }
            return res.status(200).json(newProfile);
    
        })
    
    }


   
    
 })



var server = app.listen(3300, function () {
    console.log("app is running on ", server.address().port);
});


function checkAuthorisation(req, res) {
    if (!req.headers.authorization) {
        res.status(401).send({
            message: "You are not authorised"
        });
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, "mysecret");
    if (!payload.sub) {
        res.status(401).send({ message: "not authorised" });
    }
    return payload;
}

