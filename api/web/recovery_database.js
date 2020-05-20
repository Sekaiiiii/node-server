/*
* author:谢奇
* create_day:2020-05-15
* modified_day:2020-05-15
* function:恢复数据库使用的接口
*/
'use strict'
const express = require('express');
const path = require("path");
const async = require("async");
const fs = require("fs");
const { exec } = require("child_process");

const pool = require('../../tool/pool.js');
const mysql_conf = require("../../config/mysql_conf.js");
const verify_login = require('../../middleware/verify_login.js')
const verify_root_permission = require("../../middleware/verify_root_permission");
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.post("/", verify_login);

//验证权限
router.post("/", verify_root_permission);

//参数检查
router.post("/", function (req, res, next) {
    next();
})

//业务处理
router.post("/", function (req, res, next) {
    async.waterfall([
        function judgeCompressionFileExist(done) {
            let tar_path = path.join(__dirname, "..", "..", "shell", "db_dump", req.body.name);
            fs.access(tar_path, function (err) {
                if (err) {
                    console.error(err);
                    return done(new Error("603"));
                }
                done(null, tar_path);
            })
        },
        function decompressionFile(tar_path, done) {
            let command = `tar -zxvf ${tar_path} -C ${path.join(__dirname, "..", "..", "shell", "db_dump")}`;
            exec(command, function (err, stdout, stderr) {
                if (err) {
                    console.error(err);
                    return done(new Error("604"));
                }
                done(null);
            })
        },
        function judgeSQLFileExist(done) {
            //对tar_path进行解析
            let sql_name = req.body.name.substr(2, 17) + ".sql";
            let sql_path = path.join(__dirname, "..", "..", "shell", "db_dump", sql_name);
            fs.access(sql_path, function (err) {
                if (err) {
                    console.error(err);
                    return done(new Error("605"));
                }
                done(null, sql_path);
            })
        },
        function recoveryDatabase(sql_path, done) {
            let command = `mysql -u${mysql_conf.user} -p${mysql_conf.password} ${mysql_conf.database} < ${sql_path}`;
            exec(command, function (err, stdout, stderr) {
                if (err) {
                    console.error(err);
                    return done(new Error("606"));
                }
                done(null);
            })
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "还原数据库成功"
        }))
    })
})

router.use("/", function (err, req, res, next) {
    switch (err.message) {
        case '603':
            res.send(return_obj.fail("603", "找不到对应的压缩文件"));
            break;
        case '604':
            res.send(return_obj.fail("604", "解压过程出现异常错误"));
            break;
        case '605':
            res.send(return_obj.fail("605", "找不到恢复数据库的sql文件"));
            break;
        case '606':
            res.send(return_obj.fail("606", "恢复数据库的过程出现异常错误"));
            break;
        default:
            res.send(return_obj.fail("500", "出现出乎意料的错误"));
            break;
    }
})

module.exports = router;