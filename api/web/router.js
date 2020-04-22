/*
* author:谢奇
* create_day:2020-04-20
* modified_day:2020-04-22
* function:路由配置
*/
"use strict"
const express = require("express");

const router = express.Router();

//路由配置
router.use("/login",require("./login.js"));
router.use("/register",require("./register.js"));

module.exports = router;