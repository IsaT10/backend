import express from 'express';
import { login, signup, protect } from '../controller/authController';
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

// router.route('/logout').get(logout);

// router.use(protect, isAdmin);

router.route('/').get(protect, getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export { router };
