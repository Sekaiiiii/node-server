/*
* author:谢奇
* create_day:2020-05-20
* modified_day:2020-05-20
* function:验证登录用户评论权限中间件，具有权限则通过。
*/
'use strict'
const return_obj = require("../tool/return_obj.js")

module.exports = function (req, res, next) {
    if (req.session.no_comment != undefined) {
        if (req.session.no_comment == 0) {
            return next();
        }
        return res.send(return_obj.fail("98", "用户不具有发表评论权限"));
    }
    res.send(return_obj.fail("102", "用户未登录"))
}