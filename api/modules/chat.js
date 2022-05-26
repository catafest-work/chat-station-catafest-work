// database module server
var mongodb = require("mongodb");

// client used to connect to MongoDB
// var MongoClient = mongodb.MongoClient;

// each MongoDB connection has a document unique identifier
var ObjectId = mongodb.ObjectId;

const auth = require("./auth");

const fileSystem = require("fs")

const crypto = require("crypto");

const algorithm = 'aes-256-cbc';// Using AES encryption

const key = "chat-catafest-1976-chat-catafest";// must be of 32 characters


let encrypt = function (text) {
  const iv = crypto.randomBytes(16);
   
  // protected data
  const message = text;

  // the cipher function
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // encrypt the message
  // input encoding
  // output encoding
  let encryptedData = cipher.update(message, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  const base64data = Buffer.from(iv, 'binary').toString('base64');
  return {
    iv: base64data,
    encryptedData: encryptedData
  };
};

let decrypt = function(text) {
  const originalData = Buffer.from(text.iv, 'base64')
  const decipher = crypto.createDecipheriv(algorithm, key, originalData);
  let decryptedData = decipher.update(text.encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};

module.exports = {

  init: function (app, express)  {
  const self = this; 
  const router = express.Router();

  router.post("/fetch", auth, async function (request, result) {
    const user = request.user;
    const email = request.fields.email;
    const page = request.fields.page ?? 0;
    const limit = 30;

    if(!email) {
      result.json({
        status: "error",
        message: "Please enter all fields."
      });
      return;
    }
    const receiver = await db.collection("users").
      findOne({
        email: email
      });
    if(receiver == null) {
      result.json({
        status: "error",
        message: "The receiver is not a member of Chat Station."
      });
      return;
    }
    const messages = await db.collection("messages").
      find({
        $or: [{
          "sender._id": user._id,
          "receiver._id": receiver._id
        },{
          "sender._id": receiver._id,
          "receiver._id": user._id
        }]
      })
      .sort("createdAt", -1).skip(page * limit).limit(limit).toArray();

      const data = [];
      for (let a = 0; a < messages.length; a++) {
          data.push({
              _id: messages[a]._id.toString(),
              message: decrypt(messages[a].message),
              sender: {
                  email: messages[a].sender.email,
                  name: messages[a].sender.name
              },
              receiver: {
                  email: messages[a].receiver.email,
                  name: messages[a].receiver.name
              }, 
              isRead: messages[a].isRead,
              createdAt: messages[a].createdAt
          });
      } 

      let unreadMessages = 0;
      for (let a = 0; a < data.length; a++) {
        if (data[a].receiver.email == user.email && !data[a].isRead) {
            await db.collection("messages").updateMany
            ({
                _id: ObjectId(data[a]._id)
            },{
                $set: {
                    "isRead": true
                }
            })
            unreadMessages++;
        }
      }
      await db.collection("users").findOneAndUpdate({
          $and: [{
              "_id": user._id
          }, {
              "contacts.email": email
          }]
      }, {
          $inc: {
              "contacts.$.unreadMessages": -
                unreadMessages
          }
      });
      result.json({
          status: "success",
          message: "Messages has been fetched.",
          messages: data,
          user: {
              email: user.email,
              name: user.name, 
              contacts: user.contacts
          },
          receiver: {
              email: receiver.email,
              name: receiver.name
          }
      });
  });

  router.post("/send", auth, async function (request, result) {
    const user = request.user;
    const email = request.fields.email;
    const message = request.fields.message;
    const attachment = request.files.attachment; // size (byte), path, name, type, mtime
    const createdAt = new Date().getTime();
   
    if (!email || !message) {
      result.json({
        status: "error",
        message: "Please enter all fields."
      });
      return;
    }
   
    // Text send to encrypt function
    const hw = encrypt(message);
   
    const receiver = await db.collection("users").findOne({
      email: email
    });
   
    if (receiver == null) {
      result.json({
        status: "error",
        message: "The receiver is not a member of Chat Station."
      });
      return;
    }
   
    const object = {
      message: hw,
      sender: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      receiver: {
        _id: receiver._id,
        name: receiver.name,
        email: receiver.email
      },
      isRead: false,
      createdAt: createdAt
    };

    if (attachment != null && attachment.size > 0) {
      if(!fileSystem.existsSync("uploads/" + user.email)) {
        fileSystem.mkdirSync("uploads/" + user.email);
      }
      const dateObj = new Date();
      const datetimeStr = dateObj.getFullYear() + "-" + (dateObj.getMonth()+1) + "-"+
      dateObj.getDate() + "-" + dateObj.getHours()+ "-" +
      dateObj.getMinutes() + "-" + dateObj.getSeconds();
      const fileName = "ChatStation-" + datetimeStr + "-" + attachment.name;
      const filePath = "uploads/" + user.email + "/" + fileName;
      object.attachment = {
        size: attachment.size,
        path: filePath,
        name: fileName,
        displayName: attachment.name,
        type: attachment.type
      };
      fileSystem.readFile(attachment.path, function 
        (error, data) {
          if(error) {
            console.error(error);
          }
        fileSystem.writeFile(filePath, data,
            function(error) {
              if(error) {
                console.error(error);
              }
            });
        fileSystem.unlink(attachment.path, 
          function(error) {
            if(error) {
              console.error(error);
            }
          });
        });
    }

    const document = await db.collection("messages").insertOne(object);
   
    await db.collection("users").findOneAndUpdate({
      $and: [{
        "_id": receiver._id
      }, {
        "contacts._id": user._id
      }]
    }, {
      $inc: {
        "contacts.$.unreadMessages": 1
      }
    });
   
    const messageObject = {
      _id: document.insertedId,
      message: message,
      sender: object.sender,
      receiver: object.receiver,
      isRead: false,
      createdAt: createdAt
    };
   
    result.json({
      status: "success",
      message: "Message has been sent.",
      messageObject: messageObject
    });
  });

  app.use("/chat", router);
  }
};