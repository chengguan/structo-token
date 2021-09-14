// Create express app
var express = require("express")
var app = express()
var jwt = require('jsonwebtoken')

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 80 

// app variable
var current_username = "NA";

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/", (req, res, next) => {
    res.json({"username":current_username})
});

function generateAccessToken(username) {
  return jwt.sign(username, "structo", { expiresIn: '3600s' });
}

app.get('/about', function(req, res) {
    if (!req.body.token){
        return res.status(401).send('No token specified.');
    }

    token = req.body.token
    jwt.verify(token, "structo", function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        res.status(200).send("Hello World");
    });
});

app.get('/refresh', function(req, res) {
    if (!req.body.token){
        return res.status(401).send('No token specified.');
    }

    token = req.body.token
    jwt.verify(token, "structo", function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        var new_token = generateAccessToken({ username: current_username });
        res.status(200).send({'new token': new_token});
    });
});

app.post("/token/", (req, res, next) => {
    var errors=[]
    if (!req.body.username){
        errors.push("No username specified");
    }
    if (!req.body.password){
        errors.push("No password specified");
    }

    // Hardcoded user name and password
    if ((req.body.username=="cgteo") & (req.body.password=="Pass4321")) {
        var current_token = generateAccessToken({ username: req.body.username });
        current_username = req.body.username
        res.json({
            "token": {
                "accessToken":current_token,
            }
        })
    }
    else {
        res.json({
            "failed": "wrong password"
        })
    }
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});

///////////////////////////////////////////////////////////////////////////////
// Test scripts:
//
// Login:
//  curl -d "username=cgteo&password=Pass4321" -X POST http://localhost/token
//
// Return static string with correct token:
//  curl -d "token=<token>" -X GET http://localhost/about
//
// Refresh to avoid token expiry:
//  curl -d "token=<token>" -X GET http://localhost/refresh
//


