/*
 * author:谢奇
 * create_day:2020-05-08
 * modified_day:2020-05-08
 * function:已登录用户阔以调用该接口删除评论(自己的评论)
 */

'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
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
            let sql = "select * from comment where id = ? ";
            connect.query(sql, [req.body.id], function (err, comment, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("203"));
                }
                if (comment.length == 0) {
                    connect.rollback(() => connect.release());
                    return done(new Error("120"));
                }
                if (comment[0].user_id != req.session.uid) {
                    connect.rollback(() => connect.release());
                    return done(new Error("121"));
                }
                done(null, connect, comment[0].museum_id);
            })
        },
        function deleteCommentInDatabase(connect, museum_id, done) {
            let sql = "delete from comment where id = ?";
            connect.query(sql, [req.body.id], function (err, result, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("200"));
                }
                //默认成功了
                done(null, connect, museum_id);
            })
        },
        function computeMuseumScore(connect, museum_id, done) {
            let sql = `
            select 
                avg(exhibition_score) as exhibition_avg_score,
                avg(environment_score) as environment_avg_score,
                avg(service_score) as service_avg_score
            from 
                comment 
            where 
                comment.museum_id = ? and
                comment.is_illegal <= 1
            `
            connect.query(sql, [museum_id], function (err, score, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("200"));
                }
                done(null, connect, museum_id, score);
            })
        },
        function upadateMuseumScore(connect, museum_id, score, done) {
            let sql = `
            update 
                museum 
            set 
                exhibition_score = ?,
                environment_score = ?,
                service_score = ?
            where
                museum.id = ?
            `;
            let param_list = [
                score[0].exhibition_avg_score,
                score[0].environment_avg_score,
                score[0].service_avg_score,
                museum_id
            ];
            connect.query(sql, param_list, function (err, result, fileds) {
                if (err) {
                    console.error(err);
                    connect.rollback(() => connect.release());
                    return done(new Error("200"));
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
                connect.rollback(() => connect.release());
                return next(new Error("204"));
            }
            connect.release();
            res.send(return_obj.success({
                msg: "删除评论成功"
            }));
        })
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