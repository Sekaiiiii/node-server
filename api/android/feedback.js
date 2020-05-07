/*
* author:谢奇
* create_day:2020-05-08
* modified_day:2020-05-08
* function:提供用户反馈
*/
'use strict'
const express = require('express');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const mail = require("../../tool/mail.js");
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.post("/", verify_login);


//参数检查
router.post("/", function (req, res, next) {
    if (req.body.title == undefined) {
        return next(new Error("100"));
    }
    if (req.body.content == undefined) {
        return next(new Error("100"));
    }
    next();
});

//调用邮件函数发生邮件
router.post("/", function (req, res, next) {
    mail.sendFeedBack(req.body.title, req.body.content, req.session.mail_address, function (err) {
        if (err) {
            console.error(err);
            return next(new Error("300"));
        }
        res.send(return_obj.success({
            'msg': "反馈信息发送成功"
        }));
    })
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
        case "300":
            res.send(return_obj.fail("300", "服务器发送邮件失败"));
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;