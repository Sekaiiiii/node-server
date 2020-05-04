/*
 * author:谢奇
 * create_day:2020-05-04
 * modified_day:2020-05-04
 * function:修改用户信息接口
 */
'use strict'
const express = require('express');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');

const router = express.Router();

//验证登录状态
router.post("/", verify_login);

//参数检查
router.post("/", function (req, res, next) {
    const name_reg = new RegExp('[\u4E00-\u9FA5A-Za-z0-9_]{2,18}');
    if (req.body.name != undefined) {
        if (name_reg.test(req.body.name)) {
            next();
        } else {
            return res.send(return_obj.fail("101", "传入参数格式有误"));
        }
    } else {
        return res.send(return_obj.fail("100", "缺少必要参数"));
    }
});

router.post("/", function (req, res, next) {
    let sql = "select * from user where name = ?";
    pool.query(sql, [req.body.name], function (err, user_list, fileds) {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("200", "发起数据库请求出错"));
        }
        if (user_list.length > 0) {
            return res.send(return_obj.fail("110", "用户名已存在"));
        }
        let sql = "update user set name = ? where id = ?";
        pool.query(sql, [req.body.name, req.session.uid], function (err, result, fileds) {
            if (err) {
                console.error(err);
                return res.send(return_obj.fail("200", "发起数据库请求出错"));
            }
            if (result.affectedRows == 1) {
                res.send(return_obj.success({
                    msg: "修改用户名成功"
                }))
            } else {
                res.send(return_obj.fail("302", "修改数据库出现异常错误，请及时通知开发者"));
            }
        })
    })
})

router.post("/mail_address", function (req, res, next) {
    res.send(return_obj.fail("301", "调用废弃接口"));
})

module.exports = router;