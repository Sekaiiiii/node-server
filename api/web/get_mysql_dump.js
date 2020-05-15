/*
* author:谢奇
* create_day:2020-05-14
* modified_day:2020-05-14
* function:获取数据库备份列表
*/
'use strict'
const express = require('express');
const fs = require("fs");
const path = require("path");

const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

//获取列表
router.get("/", function (req, res, next) {
    let dumpPath = path.join(__dirname, "..", "..", "shell", "db_dump");
    fs.readdir(dumpPath, function (err, dir_list) {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("602", "获取数据库备份列表失败"));
        }
        //dir_list进行筛选
        dir_list = dir_list.filter(item => {
            let targz_reg = new RegExp("^.*tar\.gz$");
            return targz_reg.test(item);
        })
        //将dir_list进行排序
        dir_list.sort(function (a, b) {
            if (a > b) {
                return -1;
            }
            return 1;
        })
        res.send(return_obj.success({
            msg: "获取数据库备份列表成功",
            dump_list: dir_list
        }));
    })
})

module.exports = router;