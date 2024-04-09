import express from 'express';
import {
  login,
  signup,
  protect,
  restricTo,
  forgotPassword,
} from '../controller/authController';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controller/userController';

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);

router.post('/forgotPassword', forgotPassword);
// router.patch('/resetPassword/:token', resetPassword);

// router.route('/logout').get(logout);

// router.use(protect, isAdmin);

router
  .route('/')
  .get(protect, restricTo('admin', 'restaurantAdmin'), getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(protect, restricTo('admin'), deleteUser);

export { router };
