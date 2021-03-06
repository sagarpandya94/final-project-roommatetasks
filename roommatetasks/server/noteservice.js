const express = require("express");
const { MongoClient, ObjectID } = require("mongodb");
const app = express();
const cors = require("cors");
const port = 2308;

app.use(cors());
app.use(express.json());

const KafkaProducer = require("./KafkaProducer.js");
const KafkaConsumer = require("./KafkaConsumer");

const consumer = new KafkaConsumer(["myTopic", "myOtherTopic"]);
const producer = new KafkaProducer("myTopic");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "roommate-tasks";

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(err => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log("Connected successfully to server");
  const db = client.db(dbName);

  app.post("/addnote", (req, res) => {
    // producer.connect(() => {
    //   console.log("in kafka producer, connected to kafka! - this is what it is sending", req.body.noteData);
    //   producer.send(req.body.noteData);
    //   // producer.send(req.body.noteData.key);
    // });

    // consumer.on("message", message => {
    //   console.log("in kafka consumer in add note service");
    //   let temp = JSON.parse(message.value);
    //   console.log(temp);
    //   tempArray.push(temp);

    //   // console.log("in add notes service", req.body.noteData);
    //   // db.collection("notes").insertOne({
    //   //   noteText: temp.text,
    //   //   noteKey: temp.key,
    //   //   tag: temp.tag
    //   // });
    // });
    
    console.log("in add notes service", req.body.noteData);
    db.collection("notes").insertOne({
      noteText: req.body.noteData.text,
      noteKey: req.body.noteData.key,
      tag: req.body.noteData.tag
    });

    res.send({ valid: true });
  });

  app.get("/listnewnote", (req, res) => {
    console.log("in list notes service");
    db.collection("notes")
      .find({ tag: "newNote" })
      .toArray()
      .then(document => {
        res.send({ document });
      });
  });

  app.post("/updatenote", (req, res) => {
    console.log("in update note service", req.body.note);
    // maybe change to _id
    let noteName = req.body.note;
    let noteid = req.body._id;
    console.log("in update note service, note name is", noteName);

    db.collection("notes")
      .updateOne(
        //maybe update by id
        { noteText: `${noteName}` },
        { $set: { tag: "done" } }
      )
      .then(() => {
        res.send({ updated: true });
      })
      .catch(e => {
        console.log(e);
      });
  });

  app.get("/listdonenote", (req, res) => {
    console.log("in done list notes service");
    db.collection("notes")
      .find({ tag: "done" })
      .toArray()
      .then(document => {
        res.send({ document });
      });
  });

  app.post("/deletenote", (req, res) => {
    console.log("in delete note service", req.body.data.id);
    let temp = req.body.data.id + ".0";
    console.log("temp is", temp);

    // db.getCollection('notes').deleteOne({ noteKey: 1576110303422.0})

    db.collection("notes")
      .updateOne(
        //maybe update by id
        { noteKey: `${temp}` },
        { $set: { tag: "deleted" } }
      )
      .then(() => {
        res.send({ updated: true });
      })
      .catch(e => {
        console.log(e);
      });
  });

  consumer.connect();
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});
