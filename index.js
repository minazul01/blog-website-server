const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const cokieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const cors = require("cors");

// midleware
app.use(cors());
app.use(express.json());
app.use(cokieParser());

// jwt token
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unautorize access" });
  }
  jwt.verify(token, process.env.JWT_Token, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unautorize access" });
    }
    req.user = decoded;
    next();
  });
};

// mongodb server

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.dB_pass}@cluster0.eyk5ydv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const blogCollection = client.db("tech-blog").collection("post");
    const commentCollection = client.db("tech-blog").collection("comment");
    const favoriteCollection = client.db("tech-blog").collection("favorite");
    // some post insert direct mongodb
    app.get("/post", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });
    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const result = await blogCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    // post the blog post data.
    app.post("/post", async (req, res) => {
      const data = req.body;
      const result = await blogCollection.insertOne(data);
      res.send(result);
    });

    // remove the blog post post
    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    });

    // jwt token authentication
    // authentication apis with token
    app.post("/jwt", verifyToken, (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_Token, { expiresIn: "1d" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, // set to true if using HTTPS
        })
        .send({ success: true });
    });

    // Update the post
    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });
    app.patch("/post/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const upadate = {
        $set: {
          title: data.title,
          category: data.category,
          description: data.description,
        },
      };
      const result = await blogCollection.updateOne(query, upadate);
      res.send(result);
    });

    // comment on the post
    app.post("/comment", async (req, res) => {
      const query = req.body;
      const result = await commentCollection.insertOne(query);
      res.send(result);
    });

    // All comments
    app.get("/comment", async (req, res) => {
      const result = await commentCollection.find().toArray();
      res.send(result);
    });

    // Specific post's comments by postId
    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { postId: id }; // Post create করার সময় অবশ্যই postId পাঠাবেন
      const comments = await commentCollection.find(query).toArray();
      res.send(comments);
    });

    // favorite blog post
    app.post("/favorite", async (req, res) => {
      const data = req.body;
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).send({ message: "No documents to insert" });
      }
      // Insert many expects an array of documents
      const result = await favoriteCollection.insertMany(data);
      res.send(result);
    });
    app.get("/favorite/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.findOne(query);
      res.send(result);
    });
    app.get("/favorite", async (req, res) => {
      const result = await favoriteCollection.find().toArray();
      res.send(result);
    });
    // favorite blog post delete

    app.delete("/favorite/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
