/*
 * author:谢奇
 * create_day:2020-04-30
 * modified_day:2020-04-30
 * function:注册前发送验证码请求
 */
'use strict'
const express = require('express');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const mail = require("../../tool/mail.js");
const random = require("../../tool/random.js");
const router = express.Router();

//验证没有登录
router.post("/", verify_no_login);

//参数检查
router.post("/", function (req, res, next) {
    if (req.body.name != undefined &&
        req.body.password != undefined &&
        req.body.mail_address != undefined) {
        //检查必须的参数是否存在

        //参数存在了对存在的参数进行检查
        var name_reg = new RegExp('^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$');
        var password_reg = new RegExp('^[a-zA-Z0-9_]{6,18}$');
        var mail_address_reg = new RegExp('^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$');
        if (name_reg.test(req.body.name) &&
            password_reg.test(req.body.password) &&
            mail_address_reg.test(req.body.mail_address)
        ) {
            next();
        } else {
            res.send(return_obj.fail('101', '传入参数格式不正确'));
        }
    } else {
        //必要参数不存在报错
        res.send(return_obj.fail('100', '缺少必要的参数'));
    }
})

//对注册用户唯一性进行验证
router.post("/", function (req, res, next) {
    var sql = "select * from user where name = ? or mail_address = ?";
    pool.query(sql, [req.body.name, req.body.mail_address], function (err, data, fileds) {
        if (err) {
            return res.send(return_obj.fail("200", "验证用户信息时出错"));
        }
        if (data.length >= 1) {
            return res.send(return_obj.fail("106", "用户名或邮箱已存在"));
        }
        next();
    })
})

//通过用户唯一性验证，生成验证码，并发送验证码
router.post("/", function (req, res, next) {
    var code = random.randomNum(100000, 999999);
    console.log(req.body);
    //发送邮件
    mail.sendVerifyCode(req.body.mail_address, code, function (err) {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("300", "服务器发送邮件失败"));
        }
        var register_msg = {
            name: req.body.name,
            mail_address: req.body.mail_address,
            code: code,
            time: Date.now()
        }
        req.session.register_msg = register_msg;
        res.send(return_obj.success({
            "msg": "发送验证码成功"
        }))
    })
})

module.exports = router;
