const express = require("express");
const User = require("../users/user.model");
const Order = require("../orders/order.model");
const Reviews = require("../reviews/review.model");
const Products = require("../products/product.model");
const router = express.Router();

// user stats
router.get("/user-stats/:email", async (req, res) => {
  const { email } = req.params;
  if (!email) res.status(400).send({ message: "Email is required" });

  try {
    const user = await User.findOne({ email: email });
    if (!user) res.status(404).send({ message: "User not found" });
    // total payments
    const totalPaymentsResult = await Order.aggregate([
      { $match: { email: email } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalPaymentsAmount =
      totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;
    // total reviews
    const totalReviews = await Reviews.countDocuments({ userId: user._id });
    const purchasedProductsIds = await Order.distinct("products.productId", {
      email: email,
    });
    const totalPurchasedProducts = purchasedProductsIds.length;
    res.status(200).send({
      message: "Fetched User stats successfully",
      data: {
        totalPayments: Number(totalPaymentsAmount.toFixed(2)),
        totalReviews,
        totalPurchasedProducts,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Couldn't get user stats", error });
  }
});

// admin stats
router.get("/admin-stats", async (req, res) => {
  try {
    // Count total orders
    const totalOrders = await Order.countDocuments();

    // Count total products
    const totalProducts = await Products.countDocuments();

    // Count total reviews
    const totalReviews = await Reviews.countDocuments();

    // Count total users
    const totalUsers = await User.countDocuments();

    // Calculate total earnings by summing the 'amount' of all orders
    const totalEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
        },
      },
    ]);

    const totalEarnings =
      totalEarningsResult.length > 0 ? totalEarningsResult[0].totalEarnings : 0;

    // Calculate monthly earnings by summing the 'amount' of all orders grouped by month
    const monthlyEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          monthlyEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
      },
    ]);

    // Format the monthly earnings data for easier consumption on the frontend
    const monthlyEarnings = monthlyEarningsResult.map(entry => ({
      month: entry._id.month,
      year: entry._id.year,
      earnings: entry.monthlyEarnings,
    }));

    // Send the aggregated data
    res.status(200).json({
      totalOrders,
      totalProducts,
      totalReviews,
      totalUsers,
      totalEarnings,
      monthlyEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin stats", error });
  }
});

module.exports = router;
