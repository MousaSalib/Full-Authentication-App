const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const register = async (req, res) => {
    const {first_name, last_name, email, password} = req.body;
    if(!first_name || !last_name || !email || !password) {
        return res.status(400).json({message: "All fields is required"})
    }
    const foundedUser = await User.findOne({email}).exec();
    if(foundedUser) {
        return res.status(401).json({message: "User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword
    })

    const accessToken = jwt.sign({
        UserInfo: {
            id: user._id
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({
        UserId: {
            id: user._id
        }
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge:  7 * 24 * 60 * 60 * 1000
    })
    res.json({message: "Registered successfully",accessToken, email: user.email, first_name: user.first_name, last_name: user.last_name, password: user.password})
}
const login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({message: "All fields is required"})
    }
    const foundedUser = await User.findOne({email}).exec();
    if(!foundedUser) {
        return res.status(401).json({message: "You must register"})
    }
    const matched = await bcrypt.compare(password, foundedUser.password);
    if(!matched) {
        return res.status(401).json({message: "Password is not matched"})
    }
    const accessToken = jwt.sign({
        UserInfo: {
            id: foundedUser._id
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "13m"});
    const refreshToken = jwt.sign({
        UserInfo: {
            id: foundedUser._id
        }
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
        accessToken,
        email: foundedUser.email,
        
    })
}
const refresh = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) res.status(400).json({message: "Un authorized"});
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodded) => {
            if(err) return res.status(403).json({message: "forbidden"});
            const foundedUser = await User.findById(decodded.UserInfo.id).exec();
            if(!foundedUser) return res.status(401).json({message: "Un authorized"});
            const accessToken = jwt.sign({
                UserInfo: {
                    id: foundedUser._id
                },
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
            res.json({accessToken})
        }
    )
}
const logout = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true
    });
    res.status(200).json({message: "Logged out successfully"})
}
module.exports = {
    register,
    login,
    refresh,
    logout
}

