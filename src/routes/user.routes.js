const router = require('express').Router();
const {createUser, getUser, updateUser, deleteUser, login, logout} = require('./../utils/user.utils');
const {verifyToken, isLoggedIn} = require('./../controllers/auth.controller');
const validateFields = require('./../controllers/validation.controller');

// Basic DB operations
router.post('/user', isLoggedIn, validateFields, createUser);

router.get('/user', verifyToken, getUser);

router.put('/user', verifyToken, validateFields, updateUser);

router.delete('/user', verifyToken, deleteUser);

// Requirements functions
router.post('/login', isLoggedIn, login);

router.post('/logout', verifyToken, logout);

router.get('/auth', verifyToken, (req, res) => res.json({auth: true}));  // Just for testing

module.exports = router;