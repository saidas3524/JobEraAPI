
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
        sub: user._id
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
   var id =   checkAuthorisation(req,res);
    var searchUser = { _id: id }

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
    var id =   checkAuthorisation(req,res);
    var profile = {
        firstName:"Sai Krishna",
        lastName:"Dasoju",
        title:"Software Engineer",
        description:"something needs to be written to be tested"
    };

    var profiles = [];
    for(i=0;i<10;i++){
        profiles.push(profile);
    }
    profiles.push({
        firstName:"December",
        lastName:"last step to get into new year",
        title:"Christmas Engineer",
        description:"Bitcoin is falling"
    })
    profiles.push({
        firstName:"Nani",
        lastName:"MCA",
        title:"Jobless Engineer",
        description:"Natural star"
    })

    res.status(200).json(profiles);
 })





app.post("/saveProfile",function(req,res){
    var id =   checkAuthorisation(req,res);
    var profile = req.body;
    const{educations,experiences,skills,personalInfo} = profile;
    

    var newProfile = new Profile({
       firstName: personalInfo.firstName,
       lastName:personalInfo.lastName,
       email:personalInfo.email,
       description:personalInfo.description,
       mobile:personalInfo.mobile,
       address:personalInfo.address,
       educations:educations,
       experiences:experiences,
       skills:skills
    });

    newProfile.save(function(err,response){
        if(err){
            res.status(400).send({message:"Something went wrong"})
        }
        res.status(200).json(newProfile);

    })

    
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
    return payload.sub;
}

