/*
* author:谢奇
* create_day:2020-05-11
* modified_day:2020-05-11
* function:提供给web查询评论数量的接口
*/
'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证用户登录状态
router.get("/", verify_login);

//参数检查
router.get("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (req.query.museum_id) {
        if (!id_reg.test(req.query.museum_id)) {
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
                count(*) as num
            from 
                user,
                comment,
                museum
            where
                comment.user_id = user.id and
                comment.museum_id = museum.id 
                ${req.query.museum_id ? "and comment.museum_id = ?" : ""}
                ${req.query.user_name ? "and user.name like ?" : ""}
            order by
                comment.time desc
            `;

            let param_list = [];

            if (req.query.museum_id) {
                param_list.push(req.query.museum_id);
            }
            if (req.query.user_name) {
                param_list.push("%" + req.query.user_name + "%");
            }


            pool.query(sql, param_list, function (err, comment_num, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"), null);
                }
                done(null, comment_num);
            });
        }
    ], function (error, comment_num) {
        if (error) {
            console.log(error);
            return next(error);
        }
        res.send(return_obj.success({
            msg: "获取评论数量成功",
            comment_num: comment_num[0].num
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