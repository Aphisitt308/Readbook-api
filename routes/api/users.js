const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const passport = require("passport");

const validateSignUpInput = require("../../validation/signup");
const validateLoginInput = require("../../validation/login");
const validateUpdatepass = require("../../validation/updatepass");
const User = require("../../models/User");

router.post("/signup", (req, res) => {
   const { errors, isValid } = validateSignUpInput(req.body);
   const { user_name, email, password } = req.body;
   if (!isValid) {
      return res.status(400).json(errors);
   }
   User.findOne({ $or: [{ email }, { user_name }] }).then(user => {
      if (user) {
         if (user.email === email)
            return res.status(400).json({ email: "Email already exists" });
         else
            return res
               .status(400)
               .json({ user_name: "Username already exists" });
      } else {
         const newUser = new User({ user_name, email, password });
         
         bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
               if (err) throw err;
               newUser.password = hash;
               newUser
                  .save()
                  .then(user => res.json(user))
                  .catch(err =>
                     console.log({ error: "Error creating a new user" })
                  );
            });
         });
      }
   });
});

router.get('/Profile', (req, res) => {
   const decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
   User.findOne({
     _id: decoded._id
   })
     .then(user => {
       if (user) {
         res.json(user)
       } else {
         res.send('User does not exist')
       }
     })
     .catch(err => {
       res.send('error: ' + err)
     })
 })
 

router.patch(
   "/editProfile/",
   passport.authenticate("jwt", { session: false }),
   (req, res) => {
      const author = req.user.user_name;
      const { errors, isValid } = validateUpdatepass(req.body);
      if (!isValid) {
         return res.status(400).json(errors);
      }
      const { user_name, password } = req.body;
      Post.findOneAndUpdate(
         { author, _id: req.params.id },
         { $set: { user_name, password } },
         { new: true }
      )
         .then(doc => res.status(200).json(doc))
         .catch(err =>
            res.status(400).json({ update: "Error updating existing profile" })
         );
   }
);


router.post("/login", (req, res) => {
   const { errors, isValid } = validateLoginInput(req.body);
   if (!isValid) {
      return res.status(400).json(errors);
   }
   const { email, password } = req.body;
   User.findOne({ email }).then(user => {
      if (!user) {
         return res.status(404).json({ email: "Email not found" });
      }

      bcrypt.compare(password, user.password).then(isMatch => {
         if (isMatch) {
            const payload = {
               id: user.id,
               user_name: user.user_name
            };
            jwt.sign(payload, SECRET, { expiresIn: 3600 }, (err, token) => {
               if (err) {
                  console.log(err);
               }
               return res.json({
                  success: true,
                  token: "Bearer " + token
               });
            });
         } else {
            return res.status(400).json({ password: "Password Incorrect" });
         }
      });
   });
});

module.exports = router;