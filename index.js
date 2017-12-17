var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require("./models/User");
var jwt = require("jwt-simple");

mongoose.connect("mongodb://test:test@ds137246.mlab.com:37246/mydb")
var app = express();

app.use(bodyParser.json());

app.get("/hello", function (req, res) {
    res.send("this is working");
});


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
})


app.post("/login", function (req, res) {
    req.user = req.body;
    var searchUser = { userName: req.user.userName };
    User.findOne(searchUser, function (err, user) {
        if (err) throw err;
        if(!user){
           return res.status(401).send({ message: "wrong UserName/password" });
        }
        user.comparePasswords(req.user.password, function (err, isValidpassword) {
            if (err) throw err;
            if (!isValidpassword) {
              return  res.status(401).send({ message: "wrong password" });
            }
            createToken(user,res);
        });
    })
})

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

    if (!req.headers.authorization) {
        res.status(401).send({
            message: "You are not authorised"
        })
    }

    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, "mysecret");

    if (!payload.sub) {
        res.status(401).send({ message: "not authorised" })
    }



    res.status(200).send(JSON.stringify({
        greetings: [{}, {}]
    }))
})
app.post("/register", function (req, res) {

    var user = req.body;
    var newUser = new User({
        name: user.name,
        userName: user.userName,
        email: user.email,
        password: user.password,
    });

    var payload = {
        issuer: req.hostname,
        sub: newUser._id
    }

    var jwtoken = jwt.encode(payload, "mysecret");
    newUser.save(function (err) {

        createToken(newUser, res);
    })


});



var server = app.listen(3300, function () {
    console.log("app is running on ", server.address().port);
});


