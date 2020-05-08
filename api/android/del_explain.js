/*
* author:谢奇
* create_day:2020-05-08
* modified_day:2020-05-08
* function:已登录用户阔以调用该接口删除讲解(自己的讲解)
*/

'use strict'
const express = require('express');
const async = require("async");
const fs = require("fs");
const path = require("path");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录状态
router.post("/", verify_login);

//参数验证
router.post("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (req.body.id == undefined) {
        return next(new Error("100"));
    }
    if (!id_reg.test(req.body.id)) {
        return next(new Error("101"));
    }

    next();
})

//业务处理
router.post("/", function (req, res, next) {
    async.waterfall([
        function getConnection(done) {
            pool.getConnection(function (err, connect) {
                if (err) {
                    console.error(err);
                    return done(new Error("202"));
                }
                done(null, connect);
            })
        },
        function beginTransaction(connect, done) {
            connect.beginTransaction(function (err) {
                if (err) {
                    console.error(err);
                    connect.release();
                    return done(new Error("203"));
                }
                done(null, connect);
            })
        },
        function verifyId(connect, done) {
            let sql = "select * from \`explain\` where id = ?";
            connect.query(sql, [req.body.id], function (err, explain, fileds) {
                if (err) {
                    console.error(err);
                    connect.release();
                    return done(new Error("200"));
                }
                if (explain.length == 0) {
                    connect.release();
                    return done(new Error("116"));
                }
                if (explain[0].user_id != req.session.uid) {
                    connect.release();
                    return done(new Error("117"));
                }
                let file = explain[0].file;

                done(null, connect, file);
            })
        },
        function deleteExplainInDatabase(connect, file, done) {
            let sql = "delete from \`explain\` where id = ?";
            connect.query(sql, [req.body.id], function (err, result, fileds) {
                if (err) {
                    console.error(err);
                    connect.release();
                    return done(new Error("200"));
                }
                //成功判断
                done(null, connect, file);
            })
        },
        function accessFile(connect, file, done) {
            let filepath = path.join(__dirname, "..", "..", "uploads", file);
            fs.access(filepath, function (err) {
                if (err) {
                    console.error(err);
                    connect.rollback(function () { });
                    connect.release();
                    return done(new Error("118"));
                }
                done(null, connect, filepath);
            })
        },
        function deleteExplainInServer(connect, filepath, done) {
            fs.unlink(filepath, function (err) {
                if (err) {
                    console.error(err);
                    connect.rollback(function () { });
                    connect.release();
                    return done(new Error("119"));
                }
                done(null, connect);
            })
        }
    ], function (err, connect) {
        if (err) {
            return next(err);
        }
        connect.commit(function (err) {
            if (err) {
                connect.rollback(function () { });
                connect.release();
                return next(new Error("204"));
            }
        })
        res.send(return_obj.success({
            msg: "删除讲解成功"
        }));
    })
})

//错误处理
router.use("/", function (err, req, res, next) {
    console.error(err);
    switch (err.message) {
        case "100":
            res.send(return_obj.fail("100", "缺少必要的参数"));
            break;
        case "101":
            res.send(return_obj.fail("101", "传入参数格式有误"));
            break;
        case "116":
            res.send(return_obj.fail("116", "找不到对应id的讲解"));
            break;
        case "117":
            res.send(return_obj.fail("117", "要删除的讲解不属于该用户"));
            break;
        case "118":
            res.send(return_obj.fail("118", "要删除的讲解服务端不存在"));
            break;
        case "119":
            res.send(return_obj.fail("119", "调用删除服务端讲解文件接口出错"));
            break;
        case "200":
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
        case "202":
            res.send(return_obj.fail("202", "获取数据库连接出错"));
            break;
        case "203":
            res.send(return_obj.fail("203", "开启事务失败"));
            break;
        case "204":
            res.send(return_obj.fail("204", "提交事务失败"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;