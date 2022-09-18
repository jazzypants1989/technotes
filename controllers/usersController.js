const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc    Get all users
// @route   GET /users
// @access  Private

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
});

// @desc    Create new user
// @route   POST /users
// @access  Private

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    // Confirm incoming data

    if (!username || !password || !roles.length || !Array.isArray(roles)) {
        return res.status(400).json({ message: 'All Fields are required' });
    }

    // Check if user already exists
    const duplicate = await User.findOne({ username }).lean().exec();

    if (duplicate) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt. Yum!

    // Define new user
    const userObject = {
        username,
        password: hashedPassword,
        roles,
    };

    // Create new user
    const user = await User.create(userObject);

    // Return new user
    if (user) {
    res.status(201).json({ message: `User ${username} created. You did it!` })
    } else {
        res.status(400).json({ message: 'You did not do it. Try fixing your data.' });
    }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data 
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc    Delete a user
// @route   DELETE /users
// @access  Private

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm incoming data
    if (!id) {
        return res.status(400).json({ message: 'User ID required' });
    }

    const note = await Note.findOne({ user: id }).lean().exec();
    if (note) {
        return res.status(400).json({ message: 'User has notes. Cannot delete.' });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const result = await user.deleteOne();

    if (result) {
        res.status(201).json({ message: `User ${result.username} deleted. Say Bye Bye!` })
    } else {
        res.status(400).json({ message: 'Hmm. You need to fix something there.' });
    }
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}