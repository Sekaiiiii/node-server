/*
 * author:谢奇
 * create_day:2020-05-06
 * modified_day:2020-05-06
 * function:已登录用户获取博物馆信息列表
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
    next();
})

//查询
router.get("/", function (req, res, next) {
    async.waterfall([
        function (done) {
            let sql = `
            select 
                museum.id as id,
                museum.name as name,
                museum.establishment_time as establishment_time,
                museum.open_time as open_time,
                museum.close_time as close_time,
                museum.time as time,
                museum.introduction as introduction,
                museum.visit_info as visit_info,
                museum.attention as attention,
                museum.exhibition_score as exhibition_score,
                museum.environment_score as environment_score,
                museum.service_score as service_score,
                position.name as position_name,
                position.longitude as longitude,
                position.latitude as latitude
            from 
                museum,position
            where
                museum.position_id = position.id
            `;
            pool.query(sql, function (err, museum_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"), null);
                }
                done(null, museum_list);
            });
        },
        function (museum_list, done) {
            let museum_id_set = new Set();
            let museum_id_list = new Array();
            museum_list.forEach(museum => {
                museum_id_set.add(museum.id);
            });
            museum_id_set.forEach(elem => {
                museum_id_list.push(elem);
            });

            let sql = "select * from image where museum_id in (?)";
            pool.query(sql, [museum_id_list], function (err, image_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"), null);
                }
                done(null, museum_list, image_list);
            });
        },
        function (museum_list, image_list, done) {
            for (let i = 0; i < museum_list.length; i++) {
                museum_list[i].image_list = new Array();
                for (let j = 0; j < image_list.length; j++) {
                    if (image_list[j].museum_id == museum_list[i].id) {
                        museum_list[i].image_list.push(image_list[j].file);
                    }
                }
            }
            done(null, museum_list);
        }
    ], function (error, museum_list) {
        if (error) {
            console.log(error);
            return next(error);
        }
        res.send(return_obj.success({
            msg:"获取数据成功",
            museum_list:museum_list
        }));
    });
})



//错误处理
router.use("/", function (err, req, res, next) {
    console.error(new Date());
    console.error(err);
    switch (err.message) {
        case '200':
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
    }
})


module.exports = router;