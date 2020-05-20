/*
 * author:谢奇
 * create_day:2020-05-07
 * modified_day:2020-05-07
 * function:已登录用户发评论
 */
'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_comment = require('../../middleware/verify_comment.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.post("/", verify_login);
//验证评论权限
router.post("/", verify_comment);

//参数检查
router.post("/", function (req, res, next) {
    let museum_id_reg = new RegExp("^\\d+$");

    if (req.body.museum_id == undefined ||
        req.body.content == undefined ||
        req.body.exhibition_score == undefined ||
        req.body.environment_score == undefined ||
        req.body.service_score == undefined) {
        return next(new Error("100"));
    }

    if (!museum_id_reg.test(req.body.museum_id) ||
        req.body.exhibition_score < 0 || req.body.exhibition_score > 5 ||
        req.body.environment_score < 0 || req.body.environment_score > 5 ||
        req.body.service_score < 0 || req.body.service_score > 5) {
        return next(new Error("101"));
    }
    next();
})

//处理业务代码
router.post("/", function (req, res, next) {
    pool.getConnection(function (err, connect) {
        if (err) {
            console.error(err);
            return next(new Error("202"));
        }
        connect.beginTransaction(function (err) {
            if (err) {
                console.error(err);
                return next(new Error("203"));
            };
            async.waterfall([
                function (done) {
                    let sql = `
                    insert into comment(
                        time,
                        content,
                        exhibition_score,
                        environment_score,
                        service_score,
                        museum_id,
                        user_id,
                        is_illegal
                    ) value(?,?,?,?,?,?,?,1)`;
                    let now = new Date();
                    let time = now.getFullYear() + "-"
                    time += now.getMonth() + 1 + "-";
                    time += now.getDate() + "-";
                    time += now.getHours() + "-";
                    time += now.getMinutes();

                    let param_list = [
                        time,
                        req.body.content,
                        req.body.exhibition_score,
                        req.body.environment_score,
                        req.body.service_score,
                        req.body.museum_id,
                        req.session.uid
                    ];
                    connect.query(sql, param_list, function (err, result, filed) {
                        if (err) {
                            console.error(err);
                            return done(new Error("200"));
                        }
                        //插入成功
                        done(null);
                    });
                }, //step 1
                function (done) {
                    let sql = `
                    select 
                        avg(exhibition_score) as exhibition_avg_score,
                        avg(environment_score) as environment_avg_score,
                        avg(service_score) as service_avg_score
                    from 
                        comment 
                    where 
                        comment.museum_id = ? and
                        comment.is_illegal <= 1
                    `;
                    connect.query(sql, [req.body.museum_id], function (err, result, filed) {
                        if (err) {
                            console.error(err);
                            return done(new Error("200"));
                        }
                        done(null, result);
                    })
                }, //step 2
                function (result, done) {
                    let sql = `
                        update 
                            museum
                        set
                            exhibition_score = ?,
                            environment_score = ?,
                            service_score = ?
                        where
                            id = ?
                    `;
                    let param_list = [
                        result[0].exhibition_avg_score,
                        result[0].environment_avg_score,
                        result[0].service_avg_score,
                        req.body.museum_id
                    ];
                    connect.query(sql, param_list, function (err, result, fileds) {
                        if (err) {
                            console.error(err);
                            return done(new Error("200"));
                        }
                        done(null);
                    })
                } //step 3
            ],
                function (err, result) {
                    if (err) {
                        connect.rollback(() => connect.release());
                        return next(new Error(err.message));
                    }
                    connect.commit(function (err) {
                        if (err) {
                            connect.rollback(() => connect.release());
                            return next(new Error("204"));
                        }
                        connect.release();
                        res.send(return_obj.success({
                            msg: "发布评论成功"
                        }));
                    })
                }
            )
        }); //async.waterfall
    }); //connect.beginTransaction...
}); //pool.getConnection...

//错误处理
router.use("/", function (err, req, res, next) {
    console.error(err);
    switch (err.message) {
        case "100":
            res.send(return_obj.fail("100", "缺少必要的参数"));
            break;
        case "101":
            res.send(return_obj.fail("101", "传入参数格式错误"));
            break;
        case "200":
            res.send(return_obj.fail("200", "发起数据库请求出错"));
            break;
        case "202":
            res.send(return_obj.fail("202", "获取数据库连接出错"));
            break;
        case "203":
            res.send(return_obj.fail("203", "开启事务失败"));
            break;
        case "204":
            res.send(return_obj.fail("204", "提交事务失败"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})

module.exports = router;

// //处理业务业务
// router.post("/", function (req, res, next) {
//     async.waterfall([
//         getConnection,
//         beginTransaction
//     ], finishTransaction);
// })


// //获取连接
// function getConnection(req, res, done) {
//     pool.getConnection(function (err, connect) {
//         if (err) {
//             console.error(err);
//             return done(new Error("202"));
//         }
//         done(null, req, res, connect);
//     })
// }

// //开启事务
// function beginTransaction(req, res, connect, done) {
//     connect.beginTransaction(function (err) {
//         if (err) {
//             console.error(err);
//             return done(new Error("203"));
//         }
//         //事务处理
//         // async.waterfall([
//         //     insertComment,
//         //     computeScore
//         // ],function(err,result){
//         //     if(err){
//         //         //如果发生错误
//         //         done(err)
//         //     }
//         //     console("内层成功完成");
//         // })
//         async.waterfall([
//             function (req, connect, done) {
//                 let sql = `
//                 insert into comment(
//                     time,
//                     content,
//                     exhibition_score,
//                     environment_score,
//                     service_score,
//                     museum_id,
//                     user_id
//                 ) value(?,?,?,?,?,?,?)`;
//                 let param_list = [
//                     Date(),
//                     req.body.content,
//                     req.body.exhibition_score,
//                     req.body.environment_score,
//                     req.body.service_score,
//                     req.body.museum_id,
//                     req.session.uid
//                 ]
//                 connect.query(sql, param_list, function (err, result, filed) {
//                     if (err) {
//                         console.err(err);
//                         return done(new Error("200"));
//                     }
//                     //插入成功
//                     done(null);
//                 });
//             },
//             function (done) {
//                 let sql = `
//                 select 
//                     avg(exhibition_score) as exhibition_avg_score,
//                     avg(environment_score) as environment_avg_score,
//                     avg(service_score) as service_score
//                 from 
//                     comment 
//                 where 
//                     comment.museum_id = ?,
//                     comment.is_illegal <= 1;
//                 `
//                 connect.query(sql, function (err, result, filed) {
//                     if (err) {
//                         console.error(err);
//                         return done(new Error("200"));
//                     }
//                     console.log(result);
//                     done(null);
//                 })
//             }
//         ], function (err, result) {
//             if (err) {
//                 //如果发生错误
//                 done(err)
//             }
//             console("内层成功完成");
//         })
//     })
// }

//插入新评论
// function insertComment(done) {
//     let sql = `
//     insert into comment(
//         time,
//         content,
//         exhibition_score,
//         environment_score,
//         service_score,
//         museum_id,
//         user_id
//     ) value(?,?,?,?,?,?,?)`;
//     let param_list = [
//         Date(),
//         req.body.content,
//         req.body.exhibition_score,
//         req.body.environment_score,
//         req.body.service_score,
//         req.body.museum_id,
//         req.session.uid
//     ]
//     connect.query(sql, param_list, function (err, result, filed) {
//         if (err) {
//             console.err(err);
//             return done(new Error("200"));
//         }
//         //插入成功
//         done(null);
//     });
// }

// //计算博物馆新评分
// function computeScore(done) {
//     let sql = `
//     select 
//         avg(exhibition_score) as exhibition_avg_score,
//         avg(environment_score) as environment_avg_score,
//         avg(service_score) as service_score
//     from 
//         comment 
//     where 
//         comment.museum_id = ?,
//         comment.is_illegal <= 1;
//     `
//     connect.query(sql, function (err, result, filed) {
//         if (err) {
//             console.error(err);
//             return done(new Error("200"));
//         }
//         console.log(result);
//         done(null);
//     })
// }

// //事务结束
// function finishTransaction(err, connect) {
//     if (err) {
//         switch (err.message) {
//             case "202":
//             case "203":
//                 next(err);
//                 break;
//             case "200":
//                 connect.rollback(function () { });
//                 next(err);
//                 break;
//         }
//         return;
//     }
//     connect.commit(function (err) {
//         if (err) {
//             connect.rollback(function () { });
//             return next(new Error("204"));
//         }
//         console.log("ok");
//     })
// }