const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const { generateToken } = require('../util/generateToken');
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdatePasswordInput,
} = require('../util/validators/userValidator');
const { verifyUser } = require('../middleware/verifyUser');

const userRouter = express.Router();

userRouter.get('/', verifyUser, async (req, res) => {
  try {
    console.log('id', id);
    const user = await User.findById(id);

    res.json({ message: 'User details', payload: user, status: 200 });
  } catch (err) {
    res.json({
      message: 'Something went wrong !!',
      err: error.message,
      status: 400,
    });
  }
});

userRouter.post('/register', async (req, res) => {
  let { username, email, password } = req.body;
  const { isValid, error } = await validateRegisterInput(
    username,
    email,
    password
  );

  if (isValid) {
    try {
      const userAlreadyExist = await User.findOne({ email });
      if (!userAlreadyExist) {
        // hash password and create an auth token
        password = await bcrypt.hash(password, 12);

        const user = await User.create({ username, email, password });
        const token = generateToken(user);

        return res.json({
          payload: { ...user._doc, token },
          status: 200,
          message: 'User register successfully',
        });
      }

      return res.json({ message: 'User Already Exist', status: 400 });
    } catch (error) {
      return res.json({
        message: 'Something went wrong !',
        err: error.message,
        status: 400,
      });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { isValid, error } = await validateLoginInput(email, password);

  if (isValid) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ message: 'User not found' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.json({ message: 'Email or password is wrong !' });
      }
      const token = generateToken(user);

      return res.json({
        payload: { ...user._doc, token },
        message: 'User login successfully',
        status: 200,
      });
    } catch (error) {
      return res.json({
        message: 'Something went wrong !',
        err: error.message,
        status: 400,
      });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

userRouter.put('/updatepassword', verifyUser, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const { isValid, error } = await validateUpdatePasswordInput(
    oldPassword,
    newPassword
  );

  if (isValid) {
    try {
      const { id } = req.decoded;
      if (id) {
        const user = await User.findById(id);
        if (user) {
          const match = await bcrypt.compare(oldPassword, user.password);
          if (!match) {
            return res.json({
              message: 'Please enter correct password !',
              status: 400,
            });
          }
          await User.findByIdAndUpdate(id, {
            password: await bcrypt.hash(newPassword, 12),
          });
          return res.json({
            message: 'Password updated successfully ',
            status: 200,
          });
        }
      }
    } catch (error) {
      return res.json({
        message: 'Something went wrong !',
        err: error.message,
        status: 400,
      });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

module.exports = userRouter;
