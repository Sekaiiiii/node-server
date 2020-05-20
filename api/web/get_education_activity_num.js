/*
* author:谢奇
* create_day:2020-05-11
* modified_day:2020-05-11
* function:获取用户列表
*/
'use strict'
const express = require('express');
const async = require('async');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_admin_permission = require("../../middleware/verify_admin_permission");
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get('/', verify_login);

//验证权限
router.get("/", verify_admin_permission);

//验证参数
router.get('/', function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (req.query.museum_id) {
        if (!id_reg.test(req.query.museum_id)) {
            return next(new Error("101"));
        }
    }
    if (req.query.education_activity_num) {
        if (!id_reg.test(req.query.education_activity_num)) {
            return next(new Error("101"));
        }
    }

    next();
})

//业务处理
router.get('/', function (req, res, next) {
    async.waterfall([
        function structureSQL(done) {
            let sql = `
            select
                count(*) as education_activity_num
                from
                museum,
                education_activity
            where
                museum.id = education_activity.museum_id
                ${req.query.name ? "and education_activity.name like ?" : ""}
                ${req.query.education_activity_id ? "and education_activity.id = ?" : ""}
                ${req.query.museum_id ? "and education_activity.museum_id = ?" : ""}
            `;
            let param_list = [];

            if (req.query.name) param_list.push("%" + req.query.name + "%");
            if (req.query.education_activity_id) param_list.push(req.query.education_activity_id);
            if (req.query.museum_id) param_list.push(req.query.museum_id);


            done(null, sql, param_list);
        },
        function getEducationActivityNum(sql, param_list, done) {
            pool.query(sql, param_list, function (err, education_activity_num, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, education_activity_num);
            });
        },
    ], function (err, education_activity_num) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取藏品数量成功",
            education_activity_num: education_activity_num[0].education_activity_num
        }))
    })
})

//错误处理
router.use("/", function (err, req, res, next) {
    console.log(err);
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
        case "400":
            res.send(return_obj.fail("400", "没有检索到藏品"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})

module.exports = router;