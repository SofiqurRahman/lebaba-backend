const express =  require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const { 
  userRegistration, 
  userLoggedIn, 
  userLogout,
  getAllUsers,
  deleteUser,
  updateUserRole,
  editUserProfile
} = require('./user.controller');

// register endpoint
router.post('/register', userRegistration);

// login routes
router.post('/login', userLoggedIn);

// logout endpoint
router.post("/logout", userLogout);

// get all users endpoints (token verify and admin)
router.get('/users', verifyToken, verifyAdmin, getAllUsers);

// update user role(by admin)
router.patch('/users/:id', verifyToken, verifyAdmin, updateUserRole);

// edit user profile
router.patch('/edit-profile/:id', verifyToken, editUserProfile)

// delete user endpoint (only admin)
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;