import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

interface UserDocument extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm: string;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
}

const userSchema: Schema<UserDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (this: UserDocument, el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

// Using function declaration instead of arrow function to preserve 'this' context
userSchema.pre('save', async function (next) {
  if (!this.isModified('password'))
    return next(); /* this points to the current document */

  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined as any;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
