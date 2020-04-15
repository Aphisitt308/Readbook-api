const express = require("express");
require("dotenv").config(); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const users = require("./routes/api/users");
// const cors = require("cors");
const app = express();

// app.use((req, res, next) => {
//    res.header('Access-Control-Allow-Origin', 'https://damp-beyond-98873.herokuapp.com')
//    res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS')
//    res.header('Access-Control-Allow-Headers','Content-Type, Option, Authorization')
//    return next()
// })
// app.use(cors({
//    origin: 'https://damp-beyond-98873.herokuapp.com'
// }));



//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db configuration
const MONGO_URI = process.env.MONGO_URI;
mongoose
   .connect(MONGO_URI, { useNewUrlParser: true })
   .then(() => console.log("Mongo Connection successful"))
   .catch(err => console.log("err"));

mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;

app.use(passport.initialize());
require("./middleware/passport")(passport);
app.use("/api/users", users);
app.use("/api/posts/", require("./routes/api/posts"));

if (process.env.NODE_ENV === "production") {
   app.use(express.static("client/build"));
   app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
   });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));