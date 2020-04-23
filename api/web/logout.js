/*
 * author:谢奇
 * create_day:2020-04-24
 * modified_day:2020-04-24
 * function:销毁session,服务端退出登录态。
 */
'use strict'
const express = require('express');
const router = express.Router();
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');


router.get("/", verify_login);

router.get("/", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.send(return_obj.fail("300", "调用退出接口发生错误"));
        }
        res.send(return_obj.success({
            "msg": "退出成功"
        }));
    })
})

module.exports = router;