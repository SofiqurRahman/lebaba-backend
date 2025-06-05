const Products = require("../products/product.model");
const Reviews = require("./review.model");

const postAReview = async (req, res) => {
  try {
    const {comment, rating, userId, productId} = req.body;
    if(!comment || !rating || !productId || !userId) res.status(400).send({ message: "Missing required fields" });

    const existingReview = await Reviews.findOne({ productId, userId });
    if(existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;
      await existingReview.save();
    } else {
      const newReview = new Reviews({ comment, rating, userId, productId })
      await newReview.save();
    }
    const reviews = await Reviews.find({ productId }).sort({ updatedAt: -1 });
    if(reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating =  totalRating / reviews.length;
      const product =  await Products.findById(productId);

      if(product) {
        product.rating =  averageRating;
        await product.save({ validateBeforeSave: false })
      } else {
        res.status(404).send({ message: "Product not found" });
      }
    }
    res.status(200).send({ message: "Review posted successfully", data: reviews });
  } catch (error) {
    res.status(500).send({ message: "Failed to post a review", error });
  }
}

const getUsersReview = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) res.status(400).send({ message: "Missing user ID" });
    const reviews = await Reviews.find({ userId: userId }).sort({ createdAt: -1 })
    if(reviews.length === 0) res.status(404).send({ message: "No reviews found for this user" });
    res.status(200).send({ message: "Reviews fetched successfully", data: reviews });
  } catch (error) {
    res.status(500).send({ message: "Failed to get users review", error });
  }
}

const getTotalReviewsCount = async (req, res) => {
  try {
    const totalReviews = await Reviews.countDocuments({});
    res.status(200).send({ message: "Total reviews fetched successfully", data: totalReviews });
  } catch (error) {
    res.status(500).send({ message: "Failed to get users review", error });
  }
}

module.exports = {
  postAReview,
  getUsersReview,
  getTotalReviewsCount
}