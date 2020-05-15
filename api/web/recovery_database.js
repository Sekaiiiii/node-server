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
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.post("/", verify_login);

//参数检查
router.post("/", function (req, res, next) {
    next();
})

//业务处理
router.post("/", function (req, res, next) {
    async.waterfall([
        function judgeCompressionFileExist(done) {
            let tar_path = path.join(__dirname, "..", "..", "shell", "db_dump", req.body.name);
            console.log(tar_path);
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
                console.log(stdout);
                done(null);
            })
        },
        function judgeSQLFileExist(done) {
            //对tar_path进行解析
            let sql_name = req.body.name.substr(2, 17) + ".sql";
            let sql_path = path.join(__dirname, "..", "..", "shell", "db_dump", sql_name);
            console.log(sql_name);
            console.log(sql_path);
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
                console.log("完成");
                console.log(stdout);
                done(null);
            })
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
    })
})

router.use("/", function (err, req, res, next) {
    if (err) {
        return res.send(return_obj.fail(err.message, "意料之中的错误"));
    }
})

module.exports = router;