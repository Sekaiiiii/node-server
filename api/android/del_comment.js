/*
* author:谢奇
* create_day:2020-05-08
* modified_day:2020-05-08
* function:已登录用户阔以调用该接口删除评论(自己的评论)
*/

'use strict'
const express = require('express');
const async = require("async");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录状态
router.post("/", verify_login);

//参数验证
router.post("/", function (req, res, next) {
    let id_reg = new RegExp("^\\d+$");

    if (req.body.id == undefined) {
        return next(new Error("100"));
    }
    if (id_reg.test(req.body.id)) {
        return next(new Error("101"));
    }

    next();
})

//业务处理
router.post("/", function (req, res, next) {
    next();
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
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;