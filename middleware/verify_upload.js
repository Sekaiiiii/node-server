/*
* author:谢奇
* create_day:2020-05-20
* modified_day:2020-05-20
* function:验证登录用户上传权限中间件，具有权限则通过。
*/
'use strict'
const return_obj = require("../tool/return_obj.js")

module.exports = function (req, res, next) {
    if (req.session.no_upload_explain != undefined) {
        if (req.session.no_upload_explain == 0) {
            return next();
        }
        return res.send(return_obj.fail("97", "用户不具有上传讲解权限"));
    }
    res.send(return_obj.fail("102", "用户未登录"))
}