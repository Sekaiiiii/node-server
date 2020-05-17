/*
 * author:谢奇
 * create_day:2020-05-17
 * modified_day:2020-05-17
 * function:设置用户密码
 */
'use strict'
const express = require('express');
const async = require('async');
const crypto = require('crypto');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');

const router = express.Router();

//验证登录
router.post("/", verify_login);

//验证参数
router.post("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (!req.body.id) {
        return next(new Error("100"));
    }
    if (!id_reg.test(req.body.id)) {
        return next(new Error("101"));
    }

    if (!req.body.is_illegal) {
        return next(new Error("100"));
    }
    if (req.body.is_illegal != 0 && req.body.is_illegal != 2) {
        return next(new Error("101"));
    }
    next();
});

//处理业务
router.post("/", function (req, res, next) {
    async.waterfall([
        function getConnection(done) {
            pool.getConnection((err, connect) => {
                if (err) {
                    console.error(err);
                    return done(new Error("202"));
                }
                done(null, connect);
            })
        },
        function beginTranscation(connect, done) {
            connect.beginTransaction((err) => {
                if (err) {
                    console.error(err);
                    connect.release();
                    return done(new Error("203"));
                }
                done(null, connect);
            })
        },
        function setUserPassword(connect, done) {
            let sql = `
            update
                \`explain\`
            set
                is_illegal = ?
            where
                \`explain\`.id = ?
            `;
            let param_list = [];
            param_list.push(req.body.is_illegal);
            param_list.push(req.body.id);
            //修改
            connect.query(sql, param_list, (err, result, fileds) => {
                if (err) {
                    console.error(err);
                    connect.rollback(() => {
                        connect.release();
                    });

                    return done(new Error("200"));
                }
                if (result.changedRows == 1) {
                    return done(null, connect);
                } else {
                    connect.rollback(() => {
                        connect.release();
                    });
                    return done(new Error("500"));
                }
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
        connect.commit((err) => {
            if (err) {
                connect.rollback(() => connect.release());
                return next(new Error("204"));
            }
            connect.release();
            res.send(return_obj.success({
                msg: "修改讲解成功"
            }))
        })
    }) //async.waterfall
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
        case "120":
            res.send(return_obj.fail("120", "找不到对应id的评论"));
            break;
        case "121":
            res.send(return_obj.fail("121", "要删除的评论不属于该用户"));
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