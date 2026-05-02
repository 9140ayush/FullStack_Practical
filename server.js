const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/inventory')
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema with constraints
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  stock: {
    type: Number,
    min: 0,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

// Bonus: GET /products/out-of-stock
app.get('/products/out-of-stock', async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Oops! Something went wrong while getting the out-of-stock products." });
  }
});

// GET /products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Oops! Something went wrong while fetching the products." });
  }
});

// GET /products/:id
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Sorry, we couldn't find that product." });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Oops! Something went wrong while fetching the product. Is the ID correct?" });
  }
});

// POST /products
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Please make sure you provided a title, and that price and stock are 0 or greater." });
  }
});

// PUT /products/:id
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } 
    );
    if (!product) return res.status(404).json({ error: "Sorry, we couldn't find that product to update." });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Please check your inputs! Price and stock cannot be negative." });
  }
});

// DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Sorry, we couldn't find that product to delete." });
    res.json({ message: "Product was deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Oops! Something went wrong while trying to delete the product." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
