// JWT used for authentication
const jwt = require("jsonwebtoken");

//secret JWT key 
const jwtSecret = "jwtSecret1234567890";

// database module server
var mongodb = require("mongodb");

// client used to connect to MongoDB
// var MongoClient = mongodb.MongoClient;

// each MongoDB connection has a document unique identifier
var ObjectId = mongodb.ObjectId;

// exports NOT export ... bad typing 
module.exports = async function (request, result, next) {
  try {
    const accessToken = request.headers.authorization.split(" ")[1];
    //console.log("accessToken ", accessToken);
    const decoded = jwt.verify(accessToken, jwtSecret);
    const userId = decoded.userId;

    const user = await db.collection("users").findOne({ accessToken: accessToken });

    if (user == null) {
      result.staus(401).json({
        status: "error", 
        message: "User has been logged out."
      });
      return;
    }

    delete user.password;
    delete user.accessToken;
    delete user.createdAt;

    request.user = user;
    next();
  } catch (exp) {
  result.status(401).json({
    status: "error",
    message: "User has been logged out."
    });
  }
};