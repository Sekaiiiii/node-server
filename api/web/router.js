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
router.use("/logout",require("./logout.js"));

//新闻相关
router.use("/get_new",require("./get_new.js"));
router.use("/get_new_num",require("./get_new_num.js"));

module.exports = router;