/*
 * author:谢奇
 * create_day:2020-05-17
 * modified_day:2020-05-17
 * function:获取版本号
 */
'use strict'
const express = require('express');
const return_obj = require('../../tool/return_obj.js');
const release_conf = require("../../config/release_conf.js");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send(return_obj.success({
        msg: "获取版本号成功",
        version: release_conf.version
    }))
});

module.exports = router;