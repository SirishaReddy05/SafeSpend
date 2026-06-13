import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const serializeUser = (user, token) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone ?? '',
  avatar: user.avatar ?? '',
  ...(token ? { token } : {}),
});

// Register new user
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;     
    try {   
        if(!firstName || !lastName  || !email || !password){
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        const userExists = await User.findOne({ email });   
        if (userExists) {     
            return res.status(400).json({ message: 'User already exists' });   
        }   
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });
        const token = generateToken(user._id);
        res.status(201).json(serializeUser(user, token))
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }     
});

// Login user
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json(serializeUser(user, token));

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}   

router.get("/me", protect, async (req, res) => {
  res.status(200).json(serializeUser(req.user));
});

router.put("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = req.body.firstName ?? user.firstName;
    user.lastName = req.body.lastName ?? user.lastName;
    user.phone = req.body.phone ?? user.phone;
    user.avatar = req.body.avatar ?? user.avatar;

    const updatedUser = await user.save();
    res.status(200).json(serializeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: "Unable to update profile" });
  }
});

export default router;
