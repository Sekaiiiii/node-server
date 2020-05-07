/*
* author:谢奇
* create_day:2020-05-07
* modified_day:2020-05-07
* function:已登录用户阔以调用该接口查看所有藏品或者某个博物馆的藏品
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
    next();
})

//查询查询
router.get("/", function (req, res, next) {
    async.waterfall([
        function getExplainList(done) {
            let sql = `
            select 
                *
            from 
                \`explain\`
            where
                \`explain\`.user_id = ?
            order by
                \`explain\`.id asc
            `;
            pool.query(sql, [req.session.uid], function (err, explain_list, fileds) {
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
                msg: "获取讲解信息成功",
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