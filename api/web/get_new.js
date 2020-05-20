/*
* author:谢奇
* create_day:2020-05-09
* modified_day:2020-05-09
* function:获取new列表
*/
'use strict'
const express = require('express');
const router = express.Router();
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_admin_permission = require("../../middleware/verify_admin_permission");
const return_obj = require('../../tool/return_obj.js');

//验证登录
router.get("/", verify_login);

//验证权限
router.get("/", verify_admin_permission);

//参数验证
router.get("/", function (req, res, next) {
    let num_reg = new RegExp("^\\d+$");
    let id_reg = new RegExp("^\\d+$");

    if (req.query.ppn != undefined) {
        if (!num_reg.test(req.query.ppn)) {
            return next(new Error("101"));
        }
    }
    if (req.query.page != undefined) {
        if (!num_reg.test(req.query.page)) {
            return next(new Error("101"));
        }
    }
    if (req.query.new_id != undefined) {
        if (!id_reg.test(req.query.new_id)) {
            return next(new Error("101"));
        }
    }
    if (req.query.museum_id != undefined) {
        if (!id_reg.test(req.query.museum_id)) {
            return next(new Error("101"));
        }
    }
    if (req.query.tag != undefined) {
        if (!num_reg.test(req.query.tag)) {
            return next(new Error("101"));
        }
    }
    next();
})

//查询数据
router.get("/", function (req, res, next) {
    async.waterfall([
        function structureSQL(done) {
            let sql = `
            select 
                new.id as new_id,
                new.title as title,
                new.author as author,
                new.time as time,
                new.description as description,
                new.content as content,
                new.url as url,
                new.tag as tag,
                museum.id as museum_id,
                museum.name as museum_name
            from 
                new 
                left join museum_has_new on new.id = museum_has_new.new_id 
                left join museum on museum_has_new.museum_id = museum.id
            where
                new.id >= 0
                ${req.query.new_id ? "and new.id = ? " : ""}
                ${req.query.museum_id ? "and museum.id = ? " : ""}
                ${req.query.title ? "and new.title like ? " : ""}
                ${req.query.tag ? "and new.tag = ? " : ""}
            order by 
                new.time desc
            limit
                ?
            offset
                ?

            `;

            //构造参数列表
            let param_list = [];

            if (req.query.new_id) param_list.push(req.query.new_id);
            if (req.query.museum_id) param_list.push(req.query.museum_id);
            if (req.query.title) param_list.push("%" + req.query.title + "%");
            if (req.query.tag) param_list.push(req.query.tag);

            let offset = 0;
            let limit = 10;
            if (req.query.ppn) limit = req.query.ppn * 1;
            if (req.query.page) offset = (req.query.page - 1) * limit;
            param_list.push(limit);
            param_list.push(offset)

            done(null, sql, param_list);
        },
        function getNewList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, new_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, new_list);
            })
        }
    ], function (err, new_list) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取新闻列表成功",
            new_list: new_list
        }));
    })
})

//返回数据
router.get("/", function (req, res) {
    next();
});


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
        case "200":
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
});


module.exports = router;