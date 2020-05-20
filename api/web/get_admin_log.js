/*
 * author:谢奇
 * create_day:2020-05-17
 * modified_day:2020-05-17
 * function:获取管理员日志
 */
'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_root_permission = require('../../middleware/verify_root_permission.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

router.get("/", verify_root_permission);

//参数验证
router.get("/", function (req, res, next) {
    next();
})

//业务处理
router.get("/", function (req, res, next) {
    async.waterfall([
        function structureSQL(done) {
            let sql = `
            select
                log.*,
                user.id as user_id
            from
                log,
                user
            where
                log.user_id = user.id
                and user.id = ?
            order by
                log.time desc
            limit
                ?
            offset
                ?
            `;
            let param_list = [];
            let limit = 15;
            let offset = 0;
            if (req.query.ppn) limit = req.query.ppn * 1;
            if (req.query.page) offset = (req.query.page - 1) * limit;
            param_list.push(req.query.user_id);
            param_list.push(limit);
            param_list.push(offset);
            done(null, sql, param_list);
        },
        function getLog(sql, param_list, done) {
            pool.query(sql, param_list, (err, log_list, fileds) => {
                if (err) {
                    console.error(err);
                    return done(new Error("200"));
                }
                done(null, log_list);
            })
        }
    ], function (err, log_list) {
        if (err) {
            return next(err);
        }
        res.send(return_obj.success({
            msg: "获取日志成功",
            log_list: log_list
        }))
    });
});

//错误处理
router.use("/", function (err, req, res, next) {
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