// include express framework 
const express = require('express')

// create an instance of it and
const app = express()

// CORS blocked ... try to fix with settings ... : npm install cors
const cors = require('cors')
app.use(cors())

const http = require("http").createServer(app);
// create http server from express instance and

// include for auth.js  
// database module server
var mongodb = require("mongodb");

// client used to connect to MongoDB
var MongoClient = mongodb.MongoClient;

// each MongoDB connection has a document unique identifier
var ObjectId = mongodb.ObjectId;

// add headers before the routes are defined , this will remove the error : has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
app.use(function(req, res, next) {
  //Website you wish to allow to connect 
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  //Request headers you wish to allow 
  res.setHeader('Acess-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  // Set to true if you need the website to include cookies in the request sent
  // to the API (e.g. in the case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  //Pass to the next layer of middleware 
  next();
});

// module required for parsing FormData values
const expressFormidable = require("express-formidable");

// settings the middleware 
app.use(expressFormidable());

// module require for encrypting the password
// and verify the password as well 
const bcrypt = require("bcrypt")

// JWT used for authentication
const jwt = require("jsonwebtoken");

//secret JWT key 
const jwtSecret = "jwtSecret1234567890";

// include auth.js from modules folder
const auth = require("./modules/auth");
// include contact.js from modules folder 
const contact = require("./modules/contact");

// strat the server at port 3000 (for local) or for hosting 
http.listen(process.env.PORT || 3000, function(){
  console.log("Server has been started at: " + (process.env.PORT || 3000));
  
  // connect to database server
  MongoClient.connect("mongodb://localhost:27017", function(error, client) {
    if (error) {
      console.error("Error is : ", error);
    return;
    }
    
    // set database name
    db = client.db("catafest_chat_station");
    // set global to used with another files
    global.db = db;
    // success message for database connection 
    console.log("Database connected successfully");
    // use the api to database 

    contact.init(app,express);

    app.post ("/logout", auth, async function (request, result) {
    const user = request.user;
    // update JWT of user in Database
    await db.collection("users").findOneAndUpdate({
      "_id": user._id,
    },{
      $set: {
        "accessToken": ""
      }
    });
    result.json({
      status: "success",
      message: "Logout successfully."
    });
   });
   
   
    /*
    //app.post("/getUser", auth, async function (request, 
    this give me error: "Error: Route.post() requires a callback function but got a [object Object]"
    app.route.post : Error: 'app.router' is deprecated!
    I remove the auth arg and seem to work need to test it and learn about this changes ...
    */
   
    app.post("/getUser", auth, async function (request,   
      result) {
      const user = request.user;
      result.json ({
        status: "success",
        message: "Data has been fetched.",
        user: user
      });
    });
    
    // route for login requests
    app.post("/login", async function (request, result) {
      // get values from login from server
      const email = request.fields.email;
      const password = request.fields.password;

      // check if email exists
      const user = await db.collection("users").findOne(
        {
          "email": email
        });
        if (user == null) {
          result.json({
            status: "error",
            message: "Email does not exist."
          });
          return;
        }
        // check if password is correct
        bcrypt.compare(password, user.password, 
          async function (error, isVerify) {
            console.log("isVerify = ", isVerify);
            if(isVerify) {
              // generate JWT for the user
              const accessToken = jwt.sign( { "userId": user._id.toString() }, jwtSecret);
              // update JWT of user in database
              await db.collection("users").findOneAndUpdate(
                {
                  "email": email
                }, {
                  // update access token value with $set
                  $set: {
                    "accessToken": accessToken
                  }
                });
                result.json({
                  status: "success",
                  message: "Login successfully.",
                  accessToken: accessToken
                });
                return;
                }
              result.json({
                status: "error",
                message: "Password is not correct."
        });
      });
    });

    // api for registration
    app.post("/registration", async function (request, result) {
      const name = request.fields.name;
      const email = request.fields.email;
      const password = request.fields.password;
      const createdAt = new Date().getTime();

      if (!name || !email || !password) {
        result.json (
          {
            status: "error", 
            message: "Please enter all values."
          }
        );
        return;
      }
      // check if the email already exists 
      var user = await db.collection("users").findOne({
        email:email
      })
      if(user != null) {
        result.json(
          {
            status: "error", 
            message: "Email already exists."
          }
        );
        return;
      }
      // encrypt the password
      bcrypt.hash(password, 10, async function (error, hash) {
        // insert in the database 
        await db.collection("users").insertOne({
          name: name,
          email: email,
          password: hash,
          accessToken: "",
          contacts: [],
          createdAt: createdAt
        });
        // register success for the user registering component
        result.status(200).json({
          status: "success",
          message: "User has been signed up."
        });
      });
    });

  });
})