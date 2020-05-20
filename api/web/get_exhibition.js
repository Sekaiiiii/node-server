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
    if (req.query.collection_id) {
        if (!id_reg.test(req.query.collection_id)) {
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
                exhibition.id as id,
                exhibition.name as name,
                exhibition.content as content,
                exhibition.start_time as start_time,
                exhibition.end_time as end_time,
                exhibition.time as time,
                exhibition.tag as tag,
                museum.id as museum_id,
                museum.name as museum_name
            from
                museum,
                exhibition
            where
                museum.id = exhibition.museum_id
                ${req.query.name ? "and exhibition.name like ?" : ""}
                ${req.query.exhibition_id ? "and exhibition.id = ?" : ""}
                ${req.query.museum_id ? "and exhibition.museum_id = ?" : ""}
            order by
                exhibition.id asc
            limit
                ?
            offset
                ?
            `;
            let param_list = [];

            if (req.query.name) param_list.push("%" + req.query.name + "%");
            if (req.query.exhibition_id) param_list.push(req.query.exhibition_id);
            if (req.query.museum_id) param_list.push(req.query.museum_id);

            let offset = 0;
            let limit = 15;
            if (req.query.ppn) limit = req.query.ppn * 1;
            if (req.query.page) offset = (req.query.page - 1) * limit;
            param_list.push(limit);
            param_list.push(offset);
            done(null, sql, param_list);
        },
        function getExhibitionList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, exhibition_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, exhibition_list);
            });
        },
        function addImageList(exhibition_list, done) {
            if (exhibition_list.length == 0) {
                return done(null, exhibition_list);
            }
            let exhibition_id_list = [];
            exhibition_list.forEach(exhibition => {
                exhibition_id_list.push(exhibition.id);
            });
            let sql = `
            select
                *
            from 
                image
            where
                image.exhibition_id in (?)
            `
            pool.query(sql, [exhibition_id_list], function (err, image_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("400"));
                }
                for (let i = 0; i < exhibition_list.length; i++) {
                    exhibition_list[i].image_list = new Array();
                    for (let j = 0; j < image_list.length; j++) {
                        if (image_list[j].exhibition_id == exhibition_list[i].id) {
                            exhibition_list[i].image_list.push(image_list[j].file);
                        }
                    }
                }
                done(null, exhibition_list);
            })
        }
    ], function (err, exhibition_list) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取展览列表成功",
            exhibition_list: exhibition_list
        }))
    })
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
        case "400":
            res.send(return_obj.fail("400", "没有检索到藏品"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})

module.exports = router;