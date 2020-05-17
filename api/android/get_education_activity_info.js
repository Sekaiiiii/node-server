/*
* author:谢奇
* create_day:2020-05-08
* modified_day:2020-05-08
* function:已登录用户阔以调用该接口查看所有展览或者某个博物馆的展览
*/
'use strict'
const express = require('express');
const async = require('async');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

// //验证登录
// router.get("/", verify_login);

//参数检查
router.get("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");
    let page_reg = new RegExp("^\\d+$");
    let ppn_reg = new RegExp("^\\d+$");
    if (req.query.id != undefined) {
        if (!id_reg.test(req.query.id)) {
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
                education_activity.id as id,
                education_activity.name as name,           
                education_activity.start_time as start_time,
                education_activity.end_time as end_time,
                education_activity.time as time,
                education_activity.tag as tag,
                education_activity.content as content,
                education_activity.url as url,
                education_activity.cooperator as cooperator,
                museum.id as museum_id
            from 
                education_activity,
                museum
            where 
                education_activity.museum_id = museum.id
                ${req.query.id ? `and museum.id = ? ` : ``}
                ${req.query.name ? `and education_activity.name like ? ` : ``}
            order by
                education_activity.name asc
            limit ?
            offset ?
            `;

            let param_list = [];

            //参数构造
            if (req.query.id) {
                param_list.push(req.query.id);
            }
            if (req.query.name) {
                param_list.push("%" + req.query.name + "%");
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
        function getEducationActivityList(sql, param_list, done) {
            pool.query(sql, param_list, function (err, education_activity_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                };
                done(null, education_activity_list);
            });
        },
        function getImageList(education_activity_list, done) {
            if (education_activity_list.length == 0) {
                return done(new Error("400"));
            }
            let education_activity_id_list = new Array();
            education_activity_list.forEach(education_activity => {
                education_activity_id_list.push(education_activity.id);
            });
            let sql = 'select * from image where image.education_activity_id in (?)';
            pool.query(sql, [education_activity_id_list], function (err, image_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                };
                //构造结果
                for (let i = 0; i < education_activity_list.length; i++) {
                    education_activity_list[i].image_list = new Array();
                    for (let j = 0; j < image_list.length; j++) {
                        if (image_list[j].education_activity_id == education_activity_list[i].id) {
                            education_activity_list[i].image_list.push(image_list[j].file);
                        }
                    }
                }
                done(null, education_activity_list);
            })
        }
    ],
        function (err, education_activity_list) {
            if (err) {
                return next(err);
            }
            res.send(return_obj.success({
                msg: "获取教育活动信息成功",
                education_activity_list: education_activity_list
            }))
        }
    );//async.waterfall...
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
            res.send(return_obj.fail("400", "没有检索到教育活动"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})
module.exports = router;