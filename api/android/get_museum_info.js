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

// //验证用户登录状态
// router.get("/", verify_login);

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
                ${req.query.name ? "and museum.name like ?" : ""}
            `;

            let param_list = [];
            if (req.query.name) {
                param_list.push("%" + req.query.name + "%");
            }

            pool.query(sql, param_list, function (err, museum_list, fileds) {
                if (err) {
                    console.error(err);
                    return done(new Error("200"), null);
                }
                done(null, museum_list);
            });
        },
        function (museum_list, done) {

            if (museum_list.length == 0) {
                return done(null, museum_list);
            }

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

                for (let i = 0; i < museum_list.length; i++) {
                    museum_list[i].image_list = new Array();
                    for (let j = 0; j < image_list.length; j++) {
                        if (image_list[j].museum_id == museum_list[i].id) {
                            museum_list[i].image_list.push(image_list[j].file);
                        }
                    }
                }
                return done(null, museum_list);
            });
        },
        function (museum_list, done) {
            //0名字首字母 
            if (req.query.order_by == 0) {
                museum_list.sort(function (a, b) { return a.name.toString().localeCompare(b.name, "zh") })
                return done(null, museum_list);
            }
            //1展览数量
            if (req.query.order_by == 1) {
                let sql = `
                select
                    museum.id as id,
                    count(*) as exhibition_num
                from
                    museum,
                    exhibition
                where
                    museum.id = exhibition.museum_id
                group by
                    museum.id
                `;
                pool.query(sql, function (err, exhibition_num_list, fileds) {
                    if (err) {
                        console.error(err);
                        return done(new Error("200"));
                    }

                    for (let i = 0; i < museum_list.length; i++) {
                        museum_list[i].exhibition_num = 0;
                        for (let j = 0; j < exhibition_num_list.length; j++) {
                            if (exhibition_num_list[j].id == museum_list[i].id) {
                                museum_list[i].exhibition_num = exhibition_num_list[j].exhibition_num;
                            }
                        }
                    }

                    museum_list.sort(function (a, b) {
                        if (a.exhibition_num > b.exhibition_num) {
                            return -1;
                        }
                        return 1;
                    })

                    return done(null, museum_list);
                })

            }
            //2藏品数量
            if (req.query.order_by == 2) {
                let sql = `
                select
                    museum.id as id,
                    count(*) as collection_num
                from
                    museum,
                    collection
                where
                    museum.id = collection.museum_id
                group by
                    museum.id
                `;
                pool.query(sql, function (err, collection_num_list, fileds) {
                    if (err) {
                        console.error(err);
                        return done(new Error("200"));
                    }

                    for (let i = 0; i < museum_list.length; i++) {
                        museum_list[i].collection_num = 0;
                        for (let j = 0; j < collection_num_list.length; j++) {
                            if (collection_num_list[j].id == museum_list[i].id) {
                                museum_list[i].collection_num = collection_num_list[j].collection_num;
                            }
                        }
                    }

                    museum_list.sort(function (a, b) {
                        if (a.collection_num > b.collection_num) {
                            return -1;
                        }
                        return 1;
                    })
                    return done(null, museum_list);
                })
            };
            //3用户综合评分
            if (req.query.order_by == 3) {
                museum_list.sort(function (a, b) {
                    if (a.environment_score + a.exhibition_score + a.service_score >=
                        b.environment_score + b.exhibition_score + b.service_score) {
                        return -1;
                    }
                    return 1;
                })
                return done(null, museum_list);
            }
            if (!req.query.order_by) {
                return done(null, museum_list);
            }
        }
    ], function (error, museum_list) {
        if (error) {
            console.log(error);
            return next(error);
        }
        res.send(return_obj.success({
            msg: "获取数据成功",
            museum_list: museum_list
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
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;