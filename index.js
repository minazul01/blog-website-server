const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');


// midleware
app.use(cors());
app.use(express.json());



// mongodb server

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.dB_pass}@cluster0.eyk5ydv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const blogCollection = client.db("tech-blog").collection("post");
    const commentCollection = client.db("tech-blog").collection("comment");
    // some post insert direct mongodb
    app.get('/post', async (req, res) => {
        const result = await blogCollection.find().toArray();
        res.send(result);
    });


    // comment post 
    app.post("/comoment", async (req, res) => {
      const query = req.body;
      const result = await likeCollection.insertOne(query);
      res.send(result);
    });
    app.get("/comment", async (req, res) => {
      const result = await likeCollection.find().toArray();
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
