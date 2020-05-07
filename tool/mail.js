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
    sendVerifyCode: function (to, code, cb) {
        var mailOptions = {
            from: '"博物馆应用管理系统" sekaiiiii@163.com',
            to: to,
            subject: "萌萌哒验证码",
            html: `验证码:${code}`
        }
        transporter.sendMail(mailOptions, cb);
    },
    sendFeedBack: function (title, content, mail_address, cb) {
        let mailOptions = {
            from: '"博物馆应用管理系统" sekaiiiii@163.com',
            to: "738359456@qq.com",   //管理员账号
            subject: "博物馆应用管理系统反馈信息",
            html: `
                <h1>${title}</h1>
                <p>正文:</p>
                <p>${content}</p>
                <p>反馈者邮箱:</p>
                <p>${mail_address}</p>
            `
        }
        transporter.sendMail(mailOptions, cb);
    }
}