/*
 * author:谢奇
 * create_day:2020-04-26
 * modified_day:2020-04-26
 * function:提供安卓端的注册接口
 */
'use strict'
const express = require('express');
const crypto = require("crypto");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证没有登录
router.post("/", verify_no_login);

//参数检查
router.post("/", function (req, res, next) {
    if (req.body.name != undefined &&
        req.body.password != undefined &&
        req.body.mail_address != undefined &&
        req.body.code != undefined) {
        //检查必须的参数是否存在

        //参数存在了对存在的参数进行检查
        var name_reg = new RegExp('^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$');
        var password_reg = new RegExp('^[a-zA-Z0-9_]{6,18}$');
        var mail_address_reg = new RegExp('^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$');
        var code_reg = new RegExp('[1-9][0-9]{5}')
        if (name_reg.test(req.body.name) &&
            password_reg.test(req.body.password) &&
            mail_address_reg.test(req.body.mail_address) &&
            code_reg.test(req.body.code)
        ) {
            next();
        } else {
            res.send(return_obj.fail('101', '传入参数格式不正确'));
        }
    } else {
        //必须参数不存在报错
        res.send(return_obj.fail('100', '缺少必要的参数'));
    }
})


//验证验证码
router.post("/", function (req, res, next) {
    //拿session和req.body里的数据进行比较
    if (req.session.register_msg.mail_address == req.body.mail_address &&
        req.session.register_msg.name == req.body.name
    ) {
        if (req.session.register_msg.code == req.body.code) {
            if (Date.now() - req.session.register_msg.time <= 1000 * 60 * 10) {
                next();
            } else {
                return res.send(return_obj.fail("107", "验证码已经失效"));
            }
        } else {
            return res.send(return_obj.fail("108", "验证码不正确"));
        }
    } else {
        return res.send(return_obj.fail("109","获取验证码前后用户信息不一致"));
    }
})



//操作数据库
router.post("/", function (req, res) {
    //参数都没问题了，那好说
    //构造加密后的密码
    var password_md5 = crypto.createHash('md5').update(req.body.password).digest('hex');
    var sql = "insert into user(name,password,mail_address,no_comment,no_upload_explain,role_id) value (?)";
    var params = [
        req.body.name,
        password_md5,
        req.body.mail_address,
        0,
        0,
        3
    ];
    pool.query(sql, [params], function (err, data, fileds) {
        if (err) {
            if (err.errno == 1062) {
                res.send(return_obj.fail("106", "用户名或邮箱已存在"));
            } else {
                console.error(err);
                res.send(return_obj.fail("200", "发起数据库请求出错"));
            }
        } else {
            res.send(return_obj.success({
                "msg": "注册用户成功"
            }));
        }
    })
})

module.exports = router;