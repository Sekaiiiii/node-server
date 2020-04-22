/*
 * author:谢奇
 * create_day:2020-04-22
 * modified_day:2020-04-22
 * function:注册用户接口
 */
'use strict'
const express = require('express');
const crypto = require("crypto");
const bodyParser = require("body-parser");

const resObj = require("../../tool/return_obj.js");
const pool = require("../../tool/pool.js")

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded());

//参数检查
router.post("/", function (req, res, next) {
    if (req.body.name != undefined &&
        req.body.password != undefined &&
        req.body.mail_address != undefined) {
        //检查必须的参数是否存在

        //参数存在了对存在的参数进行检查
        var name_reg = new RegExp('.*');
        var password_reg = new RegExp('.*');
        var mail_address_reg = new RegExp('.*');

        if (name_reg.test(req.body.name) &&
            password_reg.test(req.body.password) &&
            mail_address_reg.test(req.body.mail_address)
        ) {
            console.log("通过验证");
            next();
        } else {
            res.send(resObj.fail('101', '传入参数格式不正确'));
        }
    } else {
        //必须参数不存在报错
        res.send(resObj.fail('100', '缺少必要的参数'));
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
        1,
        1,
        3
    ];
    pool.query(sql,[params],function(err,data,fileds){
        if(err){
            console.error(err);
            res.send(resObj.fail("200","发起数据库请求出错"));
        }else{
            console.log(data);
            res.send(resObj.success({"msg":"注册用户成功"}));
        }
    })
})




module.exports = router;


// 加密库测试
// var crypto = require("crypto");
// var content_1 = "123456"
// var content_2 = "123456"
// var result_1 = crypto.createHash('md5').update(content_1).digest("hex");
// console.log(result_1);
// var result_2 = crypto.createHash('md5').update(content_2).digest("hex");
// console.log(result_2);