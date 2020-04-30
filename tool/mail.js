/*
* author:谢奇
* create_day:2020-04-30
* modified_day:2020-04-30
* function:提供邮箱服务
*/
'use strict'

const nodemailer = require("nodemailer");

const mail_conf = require("../config/mail_conf.js");

var transporter = nodemailer.createTransport(mail_conf);

module.exports = {
    sendVerifyCode:function(to,code,cb){
        var mailOptions = {
            from:'"博物馆应用管理系统" sekaiiiii@163.com',
            to:to,
            subject:"萌萌哒验证码",
            html:`验证码:${code}`
        }
        transporter.sendMail(mailOptions,cb);
    }
}