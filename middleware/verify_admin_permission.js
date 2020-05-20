/*
* author:谢奇
* create_day:2020-05-20
* modified_day:2020-05-20
* function:验证登录用户的管理员权限中间件，具有权限则通过。
*/
'use strict'
const return_obj = require("../tool/return_obj.js")

module.exports = function (req, res, next) {
    if (req.session.admin_permission != undefined) {
        if (req.session.admin_permission == 1) {
            return next();
        }
        return res.send(return_obj.fail("96", "用户不具有管理员权限"));
    }
    res.send(return_obj.fail("102", "用户未登录"))
}