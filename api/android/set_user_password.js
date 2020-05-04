/*
 * author:谢奇
 * create_day:2020-05-04
 * modified_day:2020-05-04
 * function:修改用户密码接口
 */
'use strict'
const express = require('express');
const crypto = require("crypto");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录状态
router.post("/", verify_login);

//参数检查
router.post("/", function (req, res, next) {
    let password_reg = new RegExp("^[a-zA-Z0-9_]{6,18}$");

    if (req.body.old_password != undefined &&
        req.body.new_password != undefined) {
        if (password_reg.test(req.body.old_password) &&
            password_reg.test(req.body.new_password)) {
            return next();
        }
        return res.send(return_obj.fail("101", "传入参数格式有误"));
    }
    return res.send(return_obj.fail("100", "缺少必要参数"));
})

//新旧密码逻辑上的检查
router.post("/", function (req, res, next) {
    if (req.body.old_password == req.body.new_password) {
        return res.send(return_obj.fail("113", "新密码与旧密码相同"));
    }
    return next();
})

//检查这个用户的旧密码和数据库的是否对应
router.post("/", function (req, res, next) {
    let sql = "select * from user where id = ?";
    req.new_password_md5 = crypto.createHash('md5').update(req.body.new_password).digest('hex');
    req.old_password_md5 = crypto.createHash('md5').update(req.body.old_password).digest('hex');
    pool.query(sql, [req.session.uid], function (err, user_list, fileds) {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("200", "调用数据库接口出错"));
        }
        if (user_list.length == 0) {
            return res.send(return_obj.fail("303", "查询数据库出现异常错误，请及时通知开发者"));
        }
        if (user_list[0].password == req.old_password_md5) {
            return next();
        }
        return res.send(return_obj.fail("114", "输入的旧密码与数据库不相同"));
    })
})

//检测成功
router.post("/", function (req, res) {
    let sql = "update user set password = ? where id = ?";
    pool.query(sql, [req.new_password_md5,req.session.uid], function (err, result, fileds) {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("200", "调用数据库接口出错"));
        }
        if (result.affectedRows == 1) {
            return res.send(return_obj.success({
                msg: "修改用户密码成功"
            }))
        }
        return res.send(return_obj.fail("302", "修改数据库出现异常错误，请及时通知开发者"));
    })
})

module.exports = router;