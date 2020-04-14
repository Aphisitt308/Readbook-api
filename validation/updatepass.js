const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = validateUpdatepass = data => {
   let errors = {};

   let { password } = data;
   password = !isEmpty(password) ? password : "";

   if (Validator.isEmpty(password)) {
      errors.password = "Password is required";
   } else if (!Validator.isLength(password, { min: 6, max: 30 })) {
      errors.password = "Password must be at least 6 characters";
   }

   return {
      errors,
      isValid: isEmpty(errors)
   };
};