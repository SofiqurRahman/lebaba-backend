require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const serverless = require("serverless-http");
const userRoutes = require('../src/users/user.route');
const productsRoutes = require('../src/products/product.route');
const reviewsRoutes = require('../src/reviews/review.route')
const ordersRoutes = require("../src/orders/order.route");
const statsRoutes = require("../src/stats/stats.route")
const uploadImage = require("../src/utils/uploadImage");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://lebaba-frontend.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Origin",
      "Accept",
      "Access-Control-Allow-Headers",
    ],
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api/auth', userRoutes);
app.use('/api/products', productsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stats", statsRoutes);

// mongoose configuration
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// upload image api
app.post('/uploadImage',  (req, res) => {
  uploadImage(req.body.image)
    .then(url => res.send(url))
    .catch(error => res.status(500).send(error));
})

app.get("/", (req, res) => {
  res.send("Meta Blog App Server is running on Vercel!");
});

module.exports = app;
module.exports.handler = serverless(app);
