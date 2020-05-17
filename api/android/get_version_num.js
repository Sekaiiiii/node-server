/*
 * author:谢奇
 * create_day:2020-05-17
 * modified_day:2020-05-17
 * function:获取版本号
 */
'use strict'
const express = require('express');
const fs = require("fs");
const path = require("path");
const return_obj = require('../../tool/return_obj.js');


const router = express.Router();

router.get("/", function (req, res, next) {
    let json_file = fs.readFileSync(path.join(__dirname,"..", "..", "config", "release_conf.json"));
    let json_obj = JSON.parse(json_file);
    res.send(return_obj.success({
        msg: "获取版本号成功",
        version: json_obj.version,
        name: json_obj.name,
        description: json_obj.description
    }))
});

module.exports = router;