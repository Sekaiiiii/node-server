/*
* author:谢奇
* create_day:2020-04-24
* modified_day:2020-04-24
* function:验证登录态中间件，未登录则通过。
*/
'use strict'
const return_obj = require("../tool/return_obj.js")

module.exports = function (req, res, next) {
    if ("is_login" in req.session) {
        res.send(return_obj.fail('103', '用户已登录'));
    } else {
        next();
    }
}