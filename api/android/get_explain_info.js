/*
* author:谢奇
* create_day:2020-05-08
* modified_day:2020-05-08
* function:已登录用户阔以调用该接口查看所有讲解或者某个博物馆|展览|藏品的讲解
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
    let page_reg = new RegExp("^\\d+$");
    let ppn_reg = new RegExp("^\\d+$");

    if (req.query.collection_id != undefined && (req.query.exhibition_id != undefined || req.query.museum_id != undefined)) {
        return next(new Error("112"));
    }
    if (req.query.museum_id != undefined && (req.query.collection_id != undefined || req.query.exhibition_id != undefined)) {
        return next(new Error("112"));
    }
    if (req.query.exhibition_id != undefined && (req.query.collection_id != undefined || req.query.museum_id != undefined)) {
        return next(new Error("112"));
    }


    //验证museum_id
    if (req.query.collection_id == undefined && req.query.exhibition_id == undefined && req.query.museum_id != undefined) {
        if (!id_reg.test(req.query.museum_id)) {
            return next(new Error("101"));
        }
    }
    //验证exhibition_id
    if (req.query.collection_id == undefined && req.query.exhibition_id != undefined && req.query.museum_id == undefined) {
        if (!id_reg.test(req.query.exhibition_id)) {
            return next(new Error("101"));
        }
    }
    //验证collection_id
    if (req.query.collection_id != undefined && req.query.exhibition_id == undefined && req.query.museum_id == undefined) {
        if (!id_reg.test(req.query.collection_id)) {
            return next(new Error("101"));
        }
    }


    if (req.query.page != undefined) {
        if (!page_reg.test(req.query.page)) {
            if (req.query.page < 1) {
                return next(new Error("101"));
            }
        }
    }
    if (req.query.ppn != undefined) {
        if (!ppn_reg.test(req.query.ppn)) {
            if (req.query.ppn < 0) {
                return next(new Error("101"));
            }
        }
    }
    next();
})

//查询查询
router.get("/", function (req, res, next) {
    async.waterfall([
        function structureSQL(done) {
            let sql = `
            select 
                \`explain\`.*,
                user.name,
                user.mail_address
            from 
                \`explain\`,
                user
            where
                user.id = \`explain\`.user_id
                ${req.query.museum_id ? `and \`explain\`.museum_id = ? ` : ``}
                ${req.query.exhibition_id ? `and \`explain\`.exhibition_id = ? ` : ``}
                ${req.query.collection_id ? `and \`explain\`.collection_id = ? ` : ``}
            order by
                \`explain\`.id asc
            limit ?
            offset ?
            `;

            //参数构造
            let param_list = [];

            if (req.query.museum_id) {
                param_list.push(req.query.museum_id);
            }
            if (req.query.exhibition_id) {
                param_list.push(req.query.exhibition_id);
            }
            if (req.query.collection_id) {
                param_list.push(req.query.collection_id);
            }

            let offset = 0; //偏移
            let limit = 10; //每页显示多少

            if (req.query.ppn != undefined) {
                limit = req.query.ppn * 1;
            }
            if (req.query.page != undefined) {
                offset = (req.query.page - 1) * limit;
            }

            param_list.push(limit);
            param_list.push(offset);

            done(null, sql, param_list);

        },
        function getNewList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, explain_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                };
                done(null, explain_list);
            });
        }
    ],
        function (err, explain_list) {
            if (err) {
                return next(err);
            }
            res.send(return_obj.success({
                msg: "获取讲解成功",
                explain_list: explain_list
            }))
        }
    );//async.waterfall...
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