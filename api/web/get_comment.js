/*
* author:谢奇
* create_day:2020-05-11
* modified_day:2020-05-11
* function:提供给web查询评论的接口
*/
'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_admin_permission = require("../../middleware/verify_admin_permission");
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证用户登录状态
router.get("/", verify_login);

//验证权限
router.get("/", verify_admin_permission);

//参数检查
router.get("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");
    let num_reg = new RegExp("^\\d+$");

    if (req.query.museum_id) {
        if (!id_reg.test(req.query.museum_id)) {
            return next(new Error("101"));
        }
    }

    if (req.query.ppn) {
        if (!num_reg.test(req.query.ppn)) {
            return next(new Error("101"));
        }
        if (req.query.ppn < 1) {
            return next(new Error("101"));
        }
    }

    if (req.query.page) {
        if (!num_reg.test(req.query.page)) {
            return next(new Error("101"));
        }
        if (req.query.page < 1) {
            return next(new Error("101"));
        }
    }

    next();
})

//查询
router.get("/", function (req, res, next) {
    async.waterfall([
        function (done) {
            let sql = `
            select 
                comment.id as id,
                comment.time as time,
                comment.content as content,
                comment.exhibition_score as exhibition_score,
                comment.environment_score as environment_score,
                comment.service_score as service_score,
                user.id as user_id,
                user.name as name,
                user.mail_address as mail_address,
                museum.id as museum_id
            from 
                user,
                comment,
                museum
            where
                comment.user_id = user.id and
                comment.museum_id = museum.id 
                ${req.query.museum_id ? "and comment.museum_id = ?" : ""}
                ${req.query.user_name ? "and user.name like ?" : ""}
                ${req.query.user_id ? "and user.id = ?" : ""}
            order by
                comment.time desc
            limit
                ?
            offset
                ?
            `;

            let param_list = [];

            if (req.query.museum_id) {
                param_list.push(req.query.museum_id);
            }
            if (req.query.user_name) {
                param_list.push("%" + req.query.user_name + "%");
            }
            if (req.query.user_id) {
                param_list.push(req.query.user_id);
            }

            let offset = 0;
            let limit = 15;

            if (req.query.ppn) {
                limit = req.query.ppn * 1;
            }
            if (req.query.page) {
                offset = (req.query.page - 1) * limit;
            }
            param_list.push(limit);
            param_list.push(offset);

            pool.query(sql, param_list, function (err, comment_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"), null);
                }
                done(null, comment_list);
            });
        }
    ], function (error, comment_list) {
        if (error) {
            console.log(error);
            return next(error);
        }
        res.send(return_obj.success({
            msg: "获取评论数据成功",
            comment_list: comment_list
        }));
    });
})



//错误处理
router.use("/", function (err, req, res, next) {
    console.error(new Date());
    console.error(err);
    switch (err.message) {
        case '101':
            res.send(return_obj.fail("101", "传入参数格式有误"));
            break;
        case '200':
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
        case '400':
            res.send(return_obj.fail("400", "没有检索到博物馆"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;