const mongoose = require('mongoose')
const Joi = require('joi')
let userModel = mongoose.Schema({
    name: String,
    email: String,
    password: String,
})


// function validateUser(data)
// {
//     const schema = Joi.object({
//         name: Joi.string().min(3).max(10).required(),
//         email: Joi.string().email().min(3).max(10).required(),
//         password: Joi.string().email().min(3).max(10).required(),
//     })
//     return schema.validate(data, { abortEarly: false})
// }

// function validateUserLogin(data)
// {
//     const schema = Joi.object({
//         email: Joi.string().email().min(3).max(10).required(),
//         password: Joi.string().email().min(3).max(10).required(),
//     })
//     return schema.validate(data, { abortEarly: false})
// }

module.exports = mongoose.model('User', userModel)
// module.exports.validate = validateUser
// module.exports.validateLogin = validateUserLogin
