/*
* author:谢奇
* create_day:2020-05-20
* modified_day:2020-05-20
* function:路由配置
*/
"use strict"

const express = require("express");

const router = express.Router();

//路由配置

router.use("/start_scrapy", require("./start_scrapy.js"));
router.use("/get_new_info", require("./get_new_info.js"));

module.exports = router;