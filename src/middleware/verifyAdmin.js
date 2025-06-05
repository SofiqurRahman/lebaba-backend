const verifyAdmin = (req, res, next) => {
  if(req.role !== 'admin') res.status(403).json({ message: "Unauthorized, Access denied!" });
  next();
}

module.exports = verifyAdmin;