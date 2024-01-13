const jwt = require("jsonwebtoken");
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith("Bearer ")) {
        return res.status(403).json({message: "Un authorized"})
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.status(403).json({message: "forbidden"});
        req.user = decoded.UserInfo.id;
        next()
    })
}
module.exports = verifyJwt