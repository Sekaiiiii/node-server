/*
* author:谢奇
* create_day:2020-05-07
* modified_day:2020-05-07
* function:已登录用户阔以调用该接口查看某个博物馆的评论
*/
'use strict'
const express = require('express');
const async = require('async');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

//参数检查
router.get("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");
    if (req.query.id == undefined) {
        return next(new Error("100"));
    }
    if (!id_reg.test(req.query.id)) {
        return next(new Error("101"));
    }
    next();
})

//查询评论
router.get("/", function (req, res, next) {
    let sql = `
    select 
        comment.id as id,
        comment.time as time,
        comment.content as content,
        comment.exhibition_score as exhibition_score,
        comment.environment_score as environment_score,
        comment.service_score as service_score,
        user.name as name,
        user.mail_address as mail_address
    from 
        user,
        comment,
        museum
    where
        comment.user_id = user.id and
        comment.museum_id = museum.id and
        museum.id = ?
    order by
        comment.time desc
    `;
    pool.query(sql, [req.query.id], function (err, comment_list, fileds) {
        if (err) {
            console.error(err);
            return next(new Error("200"));
        }
        res.send(return_obj.success({
            msg: "获取评论成功",
            comment_list: comment_list
        }))
    });
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
        case "200":
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
        default:
            res.send(return_obj, fail("500", "出乎意料的错误"));
            break;
    }
})
module.exports = router;