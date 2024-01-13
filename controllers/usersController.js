const User = require("../models/User")
const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password").lean();
    if(!users) {
        return res.status(400).json({message: "Users is not founded"})
    }else {
        return res.status(200).json(users)
    }
}
module.exports = {
    getAllUsers
}