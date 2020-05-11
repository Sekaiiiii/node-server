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
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get('/', verify_login);

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
                collection.id as id,
                collection.name as name,
                collection.content as content,
                collection.material as material,
                collection.tag as tag,
                museum.id as museum_id,
                museum.name as museum_name
            from
                museum,
                collection
            where
                museum.id = collection.museum_id
                ${req.query.name ? "and collection.name like ?" : ""}
                ${req.query.collection_id ? "and collection.id = ?" : ""}
                ${req.query.museum_id ? "and collection.museum_id = ?" : ""}
            order by
                collection.id asc
            limit
                ?
            offset
                ?
            `;
            let param_list = [];

            if (req.query.name) param_list.push("%" + req.query.name + "%");
            if (req.query.collection_id) param_list.push(req.query.collection_id);
            if (req.query.museum_id) param_list.push(req.query.museum_id);

            let offset = 0;
            let limit = 15;
            if (req.query.ppn) limit = req.query.ppn * 1;
            if (req.query.page) offset = (req.query.page - 1) * limit;
            param_list.push(limit);
            param_list.push(offset);
            done(null, sql, param_list);
        },
        function getCollectionList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, collection_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, collection_list);
            });
        },
        function addImageList(collection_list, done) {
            if (collection_list.length == 0) {
                return done(null, collection_list);
            }
            let collection_id_list = [];
            collection_list.forEach(collection => {
                collection_id_list.push(collection.id);
            });
            let sql = `
            select
                *
            from 
                image
            where
                image.collection_id in (?)
            `
            pool.query(sql, [collection_id_list], function (err, image_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("400"));
                }
                for (let i = 0; i < collection_list.length; i++) {
                    collection_list[i].image_list = new Array();
                    for (let j = 0; j < image_list.length; j++) {
                        if (image_list[j].collection_id == collection_list[i].id) {
                            collection_list[i].image_list.push(image_list[j].file);
                        }
                    }
                }
                done(null, collection_list);
            })
        }
    ], function (err, collection_list) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取藏品列表成功",
            collection_list: collection_list
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