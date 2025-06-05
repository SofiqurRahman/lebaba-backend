const jwt =  require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    const token =  req.cookies.token;
    // const token = req.headers.authorization?.split(' ')[1]
    // console.log("Token from cookies:", token);
    if(!token) res.status(401).send({ message: "Unauthorized Access!" })
    const decoded = jwt.verify(token,  JWT_SECRET);
    // console.log(decoded)
    if(!decoded.userId) res.status(403).send({ message: "Access denied!" })
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(500).send({ message: "Invalid Token!", error });
  }
}

module.exports = verifyToken;