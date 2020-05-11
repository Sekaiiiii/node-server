/*
* author:谢奇
* create_day:2020-05-11
* modified_day:2020-05-11
* function:获取用户列表
*/
'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

//验证参数

router.get("/", function (req, res, next) {
    next();
})


//业务处理
router.get("/", function (req, res, next) {
    async.waterfall([
        function structureSQL(done) {
            let sql = `
            select
                user.id as id,
                user.name as name,
                user.no_comment as no_comment,
                user.no_upload_explain as no_upload_explain,
                user.mail_address as mail_address,
                role.name as role_name,
                role.comment_permission as comment_permission,
                role.upload_explain_permission as upload_explain_permission,
                role.root_permission as root_permission,
                role.admin_permission as admin_permission
            from 
                user,
                role
            where
                user.role_id = role.id
                ${req.query.user_name ? "and user.name like ?" : ""}
                ${req.query.mail_address ? "and user.mail_address like ?" : ""}
                ${req.query.no_comment ? "and user.no_comment = ?" : ""}
                ${req.query.no_upload_explain ? "and user.no_upload_explain = ?" : ""}
                ${req.query.user_id ? "and user.id = ?" : ""}
            order by
                user.id
            limit
                ?
            offset 
                ?
            `
            let param_list = [];
            if (req.query.user_name) param_list.push("%" + req.query.user_name + "%");
            if (req.query.mail_address) param_list.push("%" + req.query.mail_address + "%");
            if (req.query.no_comment) param_list.push(req.query.no_comment);
            if (req.query.no_upload_explain) param_list.push(req.query.no_upload_explain);
            if (req.query.user_id) param_list.push(req.query.user_id);

            let limit = 15;
            let offset = 0;
            if (req.query.ppn) limit = req.query.ppn * 1;
            if (req.query.page) offset = (req.query.page - 1) * limit;
            param_list.push(limit);
            param_list.push(offset);
            done(null, sql, param_list);
        },
        function getUserList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, user_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, user_list);
            });
        }
    ], function (err, user_list) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取用户列表成功",
            user_list: user_list
        }))
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
        case "112":
            res.send(return_obj.fail("112", "传入参数过多"));
            break;
        case "200":
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})

module.exports = router;


