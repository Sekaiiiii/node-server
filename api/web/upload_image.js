/*
 * author:谢奇
 * create_day:2020-05-08
 * modified_day:2020-05-08
 * function:已登录用户阔以调用该接口删除讲解(自己的讲解)
 */

'use strict'
const express = require('express');
const multer = require('multer');
const async = require("async");
const fs = require("fs");
const path = require("path");
const pool = require('../../tool/pool.js');
const multer_conf = require("../../config/multer_conf");
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();


//验证登录状态
router.post("/", verify_login);


//创建upload
const upload = multer(multer_conf.web.image).array('image_list');

//upload错误处理部分
router.post("/", function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            if (err.message == "upload file mimetype error") {
                return res.send(return_obj.fail("115", "上传文件类型出错"));
            }
            if (err.code == "LIMIT_FILE_COUNT") {
                return res.send(return_obj.fail("116", "上传文件超出数量限制"));
            }
            return res.send(return_obj.fail("500", "出乎意料的错误"));
        }
        next();
    })
});

//参数验证
router.post("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (req.body.museum_id
        && !req.body.exhibition_id
        && !req.body.collection_id
        && !req.body.education_activity_id) {
        if (id_reg.test(req.body.museum_id)) {
            return next();
        }
        return next(new Error("101"));
    }
    if (!req.body.museum_id
        && req.body.exhibition_id
        && !req.body.collection_id
        && !req.body.education_activity_id) {
        if (id_reg.test(req.body.exhibition_id)) {
            return next();
        }
        return next(new Error("101"));
    }
    if (!req.body.museum_id
        && !req.body.exhibition_id
        && req.body.collection_id
        && !req.body.education_activity_id) {
        if (id_reg.test(req.body.collection_id)) {
            return next();
        }
        return next(new Error("101"));
    }
    if (!req.body.museum_id
        && !req.body.exhibition_id
        && !req.body.collection_id
        && req.body.education_activity_id) {
        if (id_reg.test(req.body.education_activity_id)) {
            return next();
        }
        return next(new Error("101"));
    }
    return next(new Error("99"));
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
        function insertToDatabase(connect, done) {
            let sql = `
            insert into
                image(
                    file
                    ${req.body.museum_id ? ",museum_id" : ""}
                    ${req.body.exhibition_id ? ",exhibition_id" : ""}
                    ${req.body.collection_id ? ",collection_id" : ""}
                    ${req.body.education_activity_id ? ",education_activity_id" : ""}
                )
                value ?
            `
            let ins_array = [];
            let id;
            if (req.body.museum_id) id = req.body.museum_id;
            if (req.body.exhibition_id) id = req.body.exhibition_id;
            if (req.body.collection_id) id = req.body.collection_id;
            if (req.body.education_activity_id) id = req.body.education_activity_id;
            req.files.forEach(file => {
                ins_array.push([file.filename, id])
            });
            connect.query(sql, [ins_array], function (err, result, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
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
                query: req.query,
                file: req.files
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
            msg: "上传图片成功"
        }));
    })
})

//错误处理部分
router.use("/", function (err, req, res, next) {
    //如果发生错误，公共操作就是删除写入的文件
    req.files.forEach(file => {
        fs.unlink(path.join(__dirname, "..", "..", file.path), function (err) {
            if (err) {
                console.error(err);
            }
        })
    });
    next(err);
});

//错误处理
router.use("/", function (err, req, res, next) {
    switch (err.message) {
        case "99":
            res.send(return_obj.fail("99", "传入的id只能有1个"));
            break;
        case "100":
            res.send(return_obj.fail("100", "缺少必要的参数"));
            break;
        case "101":
            res.send(return_obj.fail("101", "传入参数格式有误"));
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