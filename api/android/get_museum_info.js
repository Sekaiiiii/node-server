/*
 * author:谢奇
 * create_day:2020-05-06
 * modified_day:2020-05-06
 * function:已登录用户获取博物馆信息列表
 */
'use strict'
const express = require('express');
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
router.get("/", function (req, res) {
    let sql = "select * from museum";
    pool.query(sql, function (err, museum_list, fileds) {
        if (err) {
            console.error(err);
            return next(new Error("200"));
        }
        console.log(museum_list);
    })
})

//错误处理
router.use("/", function (err, req, res, next) {
    switch (err.message) {
        case '200':
            res.send(return_obj.fail("200", "调用数据库接口出错"));
            break;
    }
})


module.exports = router;