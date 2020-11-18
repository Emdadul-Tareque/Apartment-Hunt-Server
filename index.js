const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("images"));
app.use(fileUpload());
const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuz7l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(process.env.DB_USER);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const rentCollection = client.db("apartmentHunt").collection("apartment");
  const bookingCollection = client.db("apartmentHunt").collection("booking");
  const adminCollection = client.db("apartmentHunt").collection("Admin");
  const houseDetailsCollection = client.db("apartmentHunt").collection("houseDetails");
  console.log("database connected");

  app.post("/addAHouse", (req, res) => {
    const file = req.files.file;
    const userName = req.body.userName;
    const userEmail = req.body.userEmail;
    const title = req.body.title;
    const location = req.body.location;
    const bathroom = req.body.bathroom;
    const price = req.body.price;
    const bedroom = req.body.bedroom;
    const image = file.name;

    file.mv(`${__dirname}/images/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(5000).send({ msg: "Failed to upload Image" });
      }
      return res.send({ name: file.name, path: `/${file.name}` });
    });

    console.log(userName, userEmail, title, bedroom, bathroom, price, location, image);

    rentCollection
      .insertOne({ userName, userEmail, title, bedroom, bathroom, price, location, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/addARent", (req, res) => {

    const email = req.body.email;
    const fullName = req.body.fullName;
    const rentName = req.body.rentName;
    const message = req.body.message;
    const phoneNumber = req.body.phoneNumber;



    console.log( email, fullName, rentName, message, phoneNumber);

    bookingCollection
      .insertOne({ email, fullName, rentName, message, phoneNumber })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  

 

  app.post("/addAdmin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const userName = req.body.userName;
    const userEmail = req.body.userEmail;
    console.log(name, email, userEmail, userName);

    adminCollection
      .insertOne({
        name,
        email,
        userEmail,
        userName,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/houseDetails/:id", (req, res) => {
    console.log(req.params.id)
    rentCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        console.log(documents);
        res.send(documents[0]);
      });
  });

  app.get("/getApartment", (req, res) => {
    rentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/getHouseDetails", (req, res) => {
    houseDetailsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });


  app.get("/userBooking", (req, res) => {
    bookingCollection
      .find({ userEmail: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/getBooking", (req, res) => {
    bookingCollection
      .find({})
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/getAdmin", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.listen(port)
