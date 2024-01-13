require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbConnect.js");
const mongoose = require('mongoose');
const cors = require("cors");
const corsOptions = require("./config/corsOption.js");
const cookieParser = require("cookie-parser");
const path = require("path");
const { escape } = require("querystring");
const PORT = process.env.PORT || 5000;
connectDB();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")))
app.use("/" , require("./routes/root.js"));
app.use("/auth", require("./routes/authRouter.js"));
app.use("/users", require("./routes/usersRouter.js"))

app.all("*", (req, res) => {
    res.status(404);
    if(req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"))
    } else if (req.accepts("json")) {
        res.send({message: "404 Not Found"})
    }else {
        res.type("txt").send("404 Not Found")
    }
})

mongoose.connection.once("open", () => {
    console.log("DB connected")
    app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`)
    });
})
mongoose.connection.on("error", (err) => {
    console.log(err)
})






