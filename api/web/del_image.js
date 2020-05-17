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
        function verifyFile(connect, done) {
            let sql = "select * from image where file = ?";
            connect.query(sql, [req.body.file], function (err, image_list, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("200"));
                }
                if (image_list.length == 0) {
                    connect.rollback(() => connect.release());
                    return done(new Error("122"));
                }
                done(null, connect, image_list[0]);
            })
        },
        function deleteImageInDatabase(connect, image, done) {
            let sql = "delete from image where id = ?";
            connect.query(sql, [image.id], function (err, result, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("200"));
                }
                //成功判断
                done(null, connect, image);
            })
        },
        function accessFile(connect, image, done) {
            let filepath = path.join(__dirname, "..", "..", "uploads", image.file);
            fs.access(filepath, function (err) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("123"));
                }
                done(null, connect, filepath);
            })
        },
        function deleteImageInServer(connect, filepath, done) {
            fs.unlink(filepath, function (err) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("124"));
                }
                done(null, connect);
            })
        },
        function addAdminLog(connect, done) {
            //添加成功后向管理员日志添加信息
            let sql = `insert into log(id,content,time,user_id) value(null,?,?,?);`
            //构造参数列表
            let param_list = [];
            //构造日志字符串
            //构造日志对象
            let content_obj = {
                admin_id: req.session.user_id,
                baseurl: req.baseUrl,
                method: req.method,
                body: req.body,
                query: req.query
            }
            let content = JSON.stringify(content_obj);
            let time = new Date();
            let time_str = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
            param_list.push(content);
            param_list.push(time_str);
            param_list.push(req.session.user_id);
            connect.query(sql, param_list, (err, result, fileds) => {
                if (err) {
                    console.error(err);
                    connect.rollback(() => {
                        connect.release();
                    });
                    return done(new Error("200"));
                }
                if (result.affectedRows == 1) {
                    done(null, connect);
                } else {
                    connect.rollback(() => {
                        connect.release();
                    });
                    return done(new Error("500"));
                }
            })
        }
    ], function (err, connect) {
        if (err) {
            return next(err);
        }
        connect.commit(function (err) {
            if (err) {
                connect.rollback(() => connect.release());
                return next(new Error("204"));
            }
            connect.release();
        })
        res.send(return_obj.success({
            msg: "删除图片成功"
        }));
    })
})

//错误处理
router.use("/", function (err, req, res, next) {
    switch (err.message) {
        case "100":
            res.send(return_obj.fail("100", "缺少必要的参数"));
            break;
        case "101":
            res.send(return_obj.fail("101", "传入参数格式有误"));
            break;
        case "122":
            res.send(return_obj.fail("122", "数据库中找不到传入文件名对应的图片"));
            break;
        case "123":
            res.send(return_obj.fail("123", "服务端中找不到传入文件对应的图片"));
            break;
        case "124":
            res.send(return_obj.fail("124", "删除图片时出现出乎意料的错误"));
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