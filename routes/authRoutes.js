const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
function isAuth(req, res, next) {
  if(req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Bạn cần đăng nhập' });
  }
}
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', isAuth, authController.profile);
module.exports = router;