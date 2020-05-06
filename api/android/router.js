/*
 * author:谢奇
 * create_day:2020-04-20
 * modified_day:2020-04-20
 * function:路由配置
 */
"use strict"

const express = require("express");

const router = express.Router();


//路由列表
router.use("/login", require("./login.js"));
router.use("/want_register", require("./want_register.js"));
router.use("/register", require("./register.js"));
router.use("/logout", require("./logout.js"));
router.use("/set_user_info", require("./set_user_info.js"));
router.use("/set_user_password", require("./set_user_password"));
router.use("/upload_explain", require("./upload_explain.js"));
router.use("/get_museum_info",require("./get_museum_info.js"));
//测试接口
router.use("/get_position", require("./get_position.js"));


module.exports = router;