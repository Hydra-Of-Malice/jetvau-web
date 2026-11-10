const jwt = require("jsonwebtoken");

const signToken = (userId, expiresIn) =>
    jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn,
    });

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
});

module.exports = { signToken, publicUser };
