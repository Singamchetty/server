const express = require("express");
const serverless = require('serverless-http');
const cors = require("cors");
const { MongoClient } = require("mongodb");

const connectionString = "mongodb+srv://tblusers:Users12345@cluster0.xloadee.mongodb.net/";
const dbName = "reactdb";

const app = express();
const router = express.Router();

let records=[]

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create a reusable MongoClient instance for connection pooling
const client = new MongoClient(connectionString);
client.connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

router.get("/getusers", async (req, res) => {
  try {
    // Connect to MongoDB
    // await client.connect();
    
    const database = client.db(dbName);
    const users = await database.collection("tblusers").find({}).toArray();
    
    res.send(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");  
  }
  //  finally {
  //   // Close the MongoDB connection
  //  await  client.close();
  // }
});

router.post("/registeruser", async (req, res) => {
  try {
    const userData = {
      UserName: req.body.UserName,
      Age: parseInt(req.body.Age),
      Email: req.body.Email,
      Mobile: req.body.Mobile,
      Password: req.body.Password,
      CartItems:req.body.CartItems
    };
    const database = client.db(dbName);
    const result = await database.collection("tblusers").insertOne(userData);
    console.log("Record Inserted:", result.insertedId);
    res.status(200)
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).send("Internal Server Error");
  }
  //  finally {
  //   // Close the MongoDB connection
  //  await client.close();
  // }
});

router.get("/getproducts", async (req, res) => {
  try {
    // Connect to MongoDB
    // await client.connect();
    
    const database = client.db(dbName);
    const products = await database.collection("tblproducts").find({}).toArray();
    
    res.send(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  } 
  // finally {
  //   // Close the MongoDB connection
  // await  client.close();
  // }
});

router.get("/getproducts/category/:categoryname", async (req, res) => {
  let categoryname=req.params.categoryname
  try {
    // Connect to MongoDB
    // await client.connect();
    
    const database = client.db(dbName);
    const products = await database.collection("tblproducts").find({category:categoryname}).toArray();
    
    res.send(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  } 
  // finally {
  //   // Close the MongoDB connection
  // await  client.close();
  // }
});

router.get("/getcategories", async (req, res) => {
  try {
    // Connect to MongoDB
    // await client.connect();
    
    const database = client.db(dbName);
    const categories = await database.collection("tblcategories").find({}).toArray();
    
    res.send(categories);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  } 
  // finally {
  //   // Close the MongoDB connection
  //  await client.close();
  // }
});

router.get("/getproduct/:id", async (req, res) => {
  let productid=parseInt(req.params.id)
  try {
    // Connect to MongoDB
    // await client.connect();

    const database = client.db(dbName);
    const product = await database.collection("tblproducts").find({id:productid}).toArray();
    
    res.send(product);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
  //  finally {
  //   // Close the MongoDB connection
  // await  client.close();
  // }
});

router.put('/updateUserCart/:username', async (req, res) => {
  const userName = req.params.username;
  const product = req.body.cartitems.product;
  const quantity = req.body.cartitems.quantity;
  try {
    // await client.connect();

    const database = client.db(dbName);
    const collection = database.collection('tblusers');

    const user = await collection.findOne({ UserName: userName });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldCartItems = user.CartItems;
    const existingProductIndex = oldCartItems.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
      // If product exists in the cart, update the quantity
      oldCartItems[existingProductIndex].qty += quantity;
    } else {
      // If product does not exist, add it to the cart
      oldCartItems.push({ ...product, qty: quantity });
    }
    const result = await collection.updateOne(
      { UserName: userName },
      { $set: { CartItems: oldCartItems } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'CartItems updated successfully',updatedCartItems: oldCartItems  });
    } else {
      res.status(500).json({ message: 'Failed to update cart' });
    }
  }catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).send("Internal Server Error");
  }
  //  finally {
  //   await client.close();
  // }
});

router.put('/deleteUserCart/:username', async (req, res) => {
  const userName = req.params.username;
  const product = req.body.Product;
  try {
    // await client.connect();
    const database = client.db(dbName);
    const collection = database.collection('tblusers');
    const user = await collection.findOne({ UserName: userName });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const oldCartItems = user.CartItems;
    // const existingProductIndex = oldCartItems.findIndex(item => item.id === product.id);
    const newCartItems=oldCartItems.filter((item)=>{
      return item.id!==product.id
    })

    const result = await collection.updateOne(
      { UserName: userName },
      { $set: { CartItems: newCartItems } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'CartItem deleted successfully',updatedCartItems: newCartItems });
    } else {
      res.status(500).json({ message: 'Failed to update cart' });
    }
  }catch (err) {
    console.error("Error deleting cartproducts:", err);
    res.status(500).send("Internal Server Error");
  } 
  // finally {
  //   await client.close();
  // }
});


app.use('/.netlify/functions/api',router)
module.exports.handler=serverless(app)
