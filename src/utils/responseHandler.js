const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).send({ success: true, message, data });
}

const errorResponse = (res, statusCode, message, error = null) => {
  console.error(error);
  return res.status(statusCode).send({ success: false, message, error: error ? error.message : null });
}

module.exports = { successResponse, errorResponse }