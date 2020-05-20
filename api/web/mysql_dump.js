/*
* author:谢奇
* create_day:2020-05-14
* modified_day:2020-05-14
* function:
*/
'use strict'
const express = require('express');
const { exec } = require("child_process");
const path = require("path");

const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_root_permission = require("../../middleware/verify_root_permission");
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

//验证权限
router.get("/", verify_root_permission);

router.use("/", function (req, res) {
    exec(path.join(__dirname, "..", "..", "shell", "db_dump.sh"), (err, stdout, stderr) => {
        if (err) {
            return res.send(return_obj.fail("600", "数据库备份失败"));
        }
        res.send(return_obj.success({
            msg: "数据库备份成功"
        }));
    })
})

module.exports = router;