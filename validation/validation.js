"use-strict";
const Joi = require("joi");

exports.signupValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .normalize()
    .messages({ "string.email": " Email must be a valid email." }),
  name: Joi.string().required().trim().min(2),
  password: Joi.string().required().min(6),
  confirmPassword: Joi.valid(Joi.ref("password")).messages({
    "any.only": "Passwords do not match.",
  }),
}).unknown();

exports.loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .normalize()
    .messages({ "string.email": " Enter a valid email." }),
  password: Joi.string().required().min(6),
}).unknown();

exports.productValidation = Joi.object({
  title: Joi.string().trim().min(3),
  price: Joi.number(),
  description: Joi.string().trim().min(5).max(1000),
  productId: Joi.string(),
}).unknown();
