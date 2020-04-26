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
        //必须参数不存在报错
        res.send(return_obj.fail('100', '缺少必要的参数'));
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
    pool.query(sql,[params],function(err,data,fileds){
        if(err){
            res.send(return_obj.fail("200","发起数据库请求出错"));
        }else{
            res.send(return_obj.success({"msg":"注册用户成功"}));
        }
    })
})



module.exports = router;