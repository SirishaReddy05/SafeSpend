import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/test', async (req, res) => {
    return "API is working";
});

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;     
    try {   
        if(!username || !email || !password){
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        const userExists = await User.findOne({ email });   
        if (userExists) {     
            return res.status(400).json({ message: 'User already exists' });   
        }   
        const token = generateToken(user._id);
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token
        })
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }       
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body; 
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }  
        const user = await User.findOne({ email });
        const token = generateToken(user._id);
        if(!user || !(await user.matchPassword(password))) {
            return  res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        token
        });
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
  res.status(200).json(req.user);
});

export default router;