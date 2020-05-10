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
router.use("/login", require("./login.js"));
router.use("/register", require("./register.js"));
router.use("/logout", require("./logout.js"));

//博物馆相关
router.use("/get_museum", require("./get_museum.js"));


//新闻相关
router.use("/get_new", require("./get_new.js"));
router.use("/get_new_num", require("./get_new_num.js"));

//评论相关
router.use("/get_comment", require("./get_comment.js"));
router.use("/get_comment_num", require("./get_comment_num.js"));

module.exports = router;