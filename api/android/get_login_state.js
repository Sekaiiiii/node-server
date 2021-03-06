/*
* author:谢奇
* create_day:2020-05-12
* modified_day:2020-05-12
* function:获取登录状态
*/
'use strict'
const express = require('express');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();


router.get("/", function (req, res, next) {
    if ('is_login' in req.session) {
        res.send(return_obj.success({
            msg: "用户已登录",
            is_login: true
        }))
    } else {
        res.send(return_obj.success({
            msg: "用户未登录",
            is_login: false
        }));
    }
})

module.exports = router;