const { BASE_URL } = require("../utils/baseURL");
const Order = require("./order.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const makePaymentRequest = async (req, res) => {
  const { products } = req.body;
  try {
    const lineItems = products.map(product => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,
    });
    // console.log(session);
    res
      .status(201)
      .send({ message: "Successfully create payment session", id: session.id });
  } catch (error) {
    res.status(500).send({ message: "Failed to create payment session", error });
  }
};

const confirmPayment = async (req, res) => {
  const {session_id} = req.body;
  // console.log(session_id)
  try {
    const session =  await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"]
    })
    console.log(session);
    const paymentIntentId = session.payment_intent.id;
    let order =  await Order.findOne({orderId: paymentIntentId})

    if(!order){
      const lineItems = session.line_items.data.map((item) => ({
        productId: item.price.product,
        quantity: item.quantity
      }))

      const amount = session.amount_total / 100;
      
      order= new Order({
        orderId: paymentIntentId,
        products:lineItems,
        amount: amount,
        email: session.customer_details.email,
        status: session.payment_intent.status === "succeeded" ? "pending" : "failed",
      })

    } else {
      order.status = session.payment_intent.status === "succeeded" ? "pending" : "failed"
    }

    await order.save()
    res.status(200).send({ message: "Order confirmed successfully", data: order });
  } catch (error) {
    res.status(500).send({ message: "Failed to confirmed payment", error });
  }
}

const getOrdersByEmail = async (req, res) => {
  const email = req.params.email;
  try {
    if(!email) res.status(400).send({ message: "Email is required" });
    const orders = await Order.find({email}).sort({createdAt: - 1})
    if(orders.length === 0 || !orders) res.status(404).send({ message: "No orders found for this email" });
    res.status(200).send({ message: "Orders fetched successfully", data: orders });
  } catch (error) {
    res.status(500).send({ message: "Failed to get orders", error });
  }
}

const getOrdersByOrderId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if(!order) res.status(404).send({ message: "Order not found" });
    res.status(200).send({ message: "Order fetched successfully", data: order });
  } catch (error) {
    res.status(500).send({ message: "Failed to get order", error });
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders =  await Order.find().sort({createdAt: -1});
    if(orders.length === 0 || !orders) res.status(404).send({ message: "No orders found" });
    res.status(200).send({ message: "Orders fetched successfully", data: orders });
  } catch (error) {
    res.status(500).send({ message: "Failed to get all orders", error });
  }
}

const updateOrderStatus = async (req, res) => {
  const {id} = req.params;
  const {status} = req.body;
  if(!status) res.status(400).send({ message: "Status is required" });
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id, { status, updatedAt: Date.now() }, { new: true, runValidators: true }
    )

    if(!updatedOrder) res.status(404).send({ message: "Order not found" });
    res.status(200).send({ message: "Order status updated successfully", data: updatedOrder });
  } catch (error) {
    res.status(500).send({ message: "Failed to update order status", error });
  }
}

const deleteOrderById = async (req, res) => {
  const {id} = req.params;
  try {
    const deletedOrder = await Order.findByIdAndDelete(id);
    if(!deletedOrder) res.status(404).send({ message: "Order not found" });
    res.status(200).send({ message: "Order deleted successfully", data: deletedOrder });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete order", error });
  }
}

module.exports = {
  makePaymentRequest,
  confirmPayment,
  getOrdersByEmail,
  getOrdersByOrderId,
  getAllOrders,
  updateOrderStatus,
  deleteOrderById
};