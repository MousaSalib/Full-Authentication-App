const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJwt = require("../middleWare/verifyJwt");
router.use(verifyJwt)
 router.route("/allUsers").get(usersController.getAllUsers)
module.exports = router;