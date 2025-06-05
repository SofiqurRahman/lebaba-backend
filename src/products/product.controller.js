const Reviews = require("../reviews/review.model");
const Products = require("./product.model");

const createNewProduct = async (req, res) => {
  try {
    const newProduct = new Products({ ...req.body });
    const savedProduct = await newProduct.save();
    // calculate average rating
    const reviews = await Reviews.find({ productId: savedProduct._id });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      savedProduct.rating = averageRating;
      await savedProduct.save();
    }
    res
      .status(201)
      .send({ message: "Product created successfully", data: savedProduct });
  } catch (error) {
    res.status(500).send({ message: "Failed to create new product", error });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      color,
      minPrice,
      maxPrice,
      page = 1,
      limit = 8,
    } = req.query;
    const filter = {};

    if (category && category !== "all") filter.category = category;
    if (color && color !== "all") filter.color = color;

    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && !isNaN(max)) filter.price = { $gte: min, $lte: max };
    }

    console.log(filter);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const products = await Products.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "email username")
      .sort({ createdAt: -1 });
      
    res
      .status(200)
      .send({
        message: "Products fetched successfully",
        data: { products, totalProducts, totalPages },
      });
  } catch (error) {
    res.status(500).send({ message: "Failed to get all products", error });
  }
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Products.findById(id).populate(
      "author",
      "username email"
    );
    if (!product) res.status(404).send({ message: "Product not found" });
    const reviews = await Reviews.find({ productId: id }).populate(
      "userId",
      "username email"
    );
    res
      .status(200)
      .send({
        message: "Single Product and reviews",
        data: { product, reviews },
      });
  } catch (error) {
    res.status(500).send({ message: "Failed to get single product", error });
  }
};

const updateProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true }
    );
    if (!updatedProduct) res.status(404).send({ message: "Product not found" });
    res
      .status(200)
      .send({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).send({ message: "Failed to update product", error });
  }
};

const deleteProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const deletedProduct = await Products.findByIdAndDelete(productId);
    if (!deletedProduct) res.status(404).send({ message: "Product not found" });
    await Reviews.deleteMany({ productId });
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete product", error });
  }
};

module.exports = {
  createNewProduct,
  getAllProducts,
  getSingleProduct,
  updateProductById,
  deleteProductById,
};
