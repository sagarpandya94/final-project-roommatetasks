const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const app = express();
const cors = require('cors');
const port = 2305;

app.use(cors());
app.use(express.json());

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'roommate-tasks';

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect((err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log("Connected successfully to server");
  const db = client.db(dbName);

  app.post('/registeruser', (req,res) => {
    console.log("in register user server", req.body.userData);
    db.collection('users').insertOne({
      firstName: req.body.userData.firstName,
      lastName: req.body.userData.lastName,
      email: req.body.userData.email,
      password: req.body.userData.password
    })

    res.send("You are a registered user now");
  })

  app.post('/login', (req, res) => {
    console.log("in login server", req.body.loginData);
    var document = db.collection('users').find({
      $and:[
        {email: req.body.loginData.email},
        {password: req.body.loginData.password}
      ]
    }).toArray()
    .then((document) => {
      console.log("doc",document);
      res.send(document);
    })
  })

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});