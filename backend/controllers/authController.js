import Citizen from '../models/Citizen.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper to generate JWT Token
const generateToken = (id, role, district, userType) => {
  return jwt.sign({ id, role, district, userType }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new citizen
// @route   POST /api/v1/auth/citizen/register
// @access  Public
const registerCitizen = async (req, res) => {
  try {
    const { fullName, nic, phoneNumber, password, district, homeAddress, userType } = req.body;

    // 1. Check if user already exists
    const existingCitizen = await Citizen.findOne({
      $or: [{ nic: nic.toUpperCase() }, { phoneNumber }],
    });

    if (existingCitizen) {
      return res.status(400).json({
        success: false,
        message: 'Citizen with this NIC or Phone Number already exists',
      });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Citizen Record
    const citizen = await Citizen.create({
      fullName,
      nic,
      phoneNumber,
      password: hashedPassword,
      district,
      homeAddress,
      userType: userType || 'CITIZEN',
    });

    // 4. Generate Token & Send Response
    const token = generateToken(citizen._id, citizen.role, citizen.district, citizen.userType);

    res.status(201).json({
      success: true,
      message: 'Citizen registered successfully',
      token,
      user: {
        id: citizen._id,
        fullName: citizen.fullName,
        nic: citizen.nic,
        phoneNumber: citizen.phoneNumber,
        district: citizen.district,
        userType: citizen.userType,
        role: citizen.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login citizen
// @route   POST /api/v1/auth/citizen/login
// @access  Public
const loginCitizen = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be NIC or Phone Number

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide NIC/Phone Number and Password',
      });
    }

    // Find citizen by NIC or Phone Number
    const citizen = await Citizen.findOne({
      $or: [{ nic: identifier.toUpperCase() }, { phoneNumber: identifier }],
    });

    if (!citizen) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate Token
    const token = generateToken(citizen._id, citizen.role, citizen.district, citizen.userType);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: citizen._id,
        fullName: citizen.fullName,
        nic: citizen.nic,
        phoneNumber: citizen.phoneNumber,
        district: citizen.district,
        userType: citizen.userType,
        role: citizen.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged-in Citizen Profile
// @route   GET /api/v1/auth/citizen/me
// @access  Private (Citizen)
const getMe = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id).select('-password');
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }
    res.status(200).json({ success: true, user: citizen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerCitizen,
  loginCitizen,
  getMe,
};