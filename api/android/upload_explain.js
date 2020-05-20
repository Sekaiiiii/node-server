/*
 * author:谢奇
 * create_day:2020-05-05
 * modified_day:2020-05-05
 * function:讲解上传接口
 */
'use strict'
const express = require('express');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_upload = require("../../middleware/verify_upload.js");
const return_obj = require('../../tool/return_obj.js');
const multer_conf = require("../../config/multer_conf.js");
const router = express.Router();

//验证登录态
router.post("/", verify_login);
//验证上传权限
router.post("/", verify_upload);

//创建mupload
const upload = multer(multer_conf.android).single('music');

//upload错误处理部分
router.post("/", function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            if (err.message == "upload file mimetype error") {
                return res.send(return_obj.fail("115", "上传文件类型出错"));
            }
            if (err.code == "LIMIT_FILE_COUNT") {
                return res.send(return_obj.fail("116", "上传文件超出数量限制"));
            }
            return res.send(return_obj.fail("500", "出乎意料的错误"));
        }
        next();
    })
});

//body参数检查部分
router.post("/", function (req, res, next) {
    const title_reg = new RegExp("^[\\u4E00-\\u9FA5A-Za-z0-9_]{1,255}$");
    const artist_reg = new RegExp("^[\\u4E00-\\u9FA5A-Za-z0-9_]{1,255}$");
    const album_reg = new RegExp("^[\\u4E00-\\u9FA5A-Za-z0-9_]{1,255}$");
    const genre_reg = new RegExp("^[\\u4E00-\\u9FA5A-Za-z0-9_]{1,255}$");
    const duration_reg = new RegExp("^\\d+$");
    const duration_unit_reg = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$");
    const album_art_res_id_reg = new RegExp("^\\d+$");
    const album_art_res_name_reg = new RegExp("^[\\u4E00-\\u9FA5A-Za-z0-9_]{1,255}$");
    const collection_id_reg = new RegExp("^\\d+$");
    const exhibition_id_reg = new RegExp("^\\d+$");
    const museum_id_reg = new RegExp("^\\d+$");

    //检查必须存在的参数

    //验证title
    if (req.body.title == undefined) {
        return next(new Error("100"));
    } else {
        if (!title_reg.test(req.body.title)) {
            return next(new Error("101"));
        }
    }
    if (req.body.collection_id == undefined && req.body.exhibition_id == undefined && req.body.museum_id == undefined) {
        return next(new Error("100"));
    }
    //验证museum_id
    if (req.body.collection_id == undefined && req.body.exhibition_id == undefined && req.body.museum_id != undefined) {
        if (!museum_id_reg.test(req.body.museum_id)) {
            return next(new Error("101"));
        }
    }
    //验证exhibition_id
    if (req.body.collection_id == undefined && req.body.exhibition_id != undefined && req.body.museum_id == undefined) {
        if (!exhibition_id_reg.test(req.body.exhibition_id)) {
            return next(new Error("101"));
        }
    }
    //验证collection_id
    if (req.body.collection_id != undefined && req.body.exhibition_id == undefined && req.body.museum_id == undefined) {
        if (!collection_id_reg.test(req.body.collection_id)) {
            return next(new Error("101"));
        }
    }

    //不一定存在的参数
    if (req.body.artist != undefined) {
        if (!artist_reg.test(req.body.artist)) {
            return next(new Error("101"));
        }
    }
    if (req.body.album != undefined) {
        if (!album_reg.test(req.body.album)) {
            return next(new Error("101"));
        }
    }
    if (req.body.genre != undefined) {
        if (!genre_reg.test(req.body.genre)) {
            return next(new Error("101"));
        }
    }
    if (req.body.duration != undefined) {
        if (!duration_reg.test(req.body.duration)) {
            return next(new Error("101"));
        }
    }
    if (req.body.duration_unit != undefined) {
        if (!duration_unit_reg.test(req.body.duration_unit)) {
            return next(new Error("101"));
        }
    }
    if (req.body.album_art_res_id != undefined) {
        if (!album_art_res_id_reg.test(req.body.album_art_res_id)) {
            return next(new Error("101"));
        }
    }
    if (req.body.album_art_res_name != undefined) {
        if (!album_art_res_name_reg.test(req.body.album_art_res_name)) {
            return next(new Error("101"));
        }
    }

    next();
});

//写入数据库
router.post("/", function (req, res, next) {
    const sql = `
        insert into \`explain\`(
            title,
            artist,
            album,
            genre,
            duration,
            duration_unit,
            file,
            album_art_res_id,
            album_art_res_name,
            is_illegal,
            user_id,
            collection_id,
            exhibition_id,
            museum_id
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `
    const param_list = [
        req.body.title,
        req.body.artist,
        req.body.album,
        req.body.genre,
        req.body.duration,
        req.body.duration_unit,
        req.file.filename,
        req.body.album_art_res_id,
        req.body.album_art_res_name,
        1,
        req.session.uid,
        req.body.collection_id,
        req.body.exhibition_id,
        req.body.museum_id
    ]
    pool.query(sql, param_list, function (err, result, fileds) {
        if (err) {
            console.error(err);
            return next(new Error("200"));
        }
        if (result.affectedRows == 1) {
            return res.send(return_obj.success({
                msg: "上传讲解成功",
                filename: req.file.filename
            }));
        }
        return next(new Error("304"))
    })
})


//错误处理部分
router.use("/", function (err, req, res, next) {
    //如果发生错误，公共操作就是删除写入的文件
    fs.unlink(path.join(__dirname, "..", "..", req.file.path), function (err) {
        if (err) {
            console.error(err);
        }
    })
    next(err);
});

//根据不同的错误码返回不同的错误消息
router.use("/", function (err, req, res, next) {

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
        case "304":
            res.send(return_obj.fail("304", "插入数据库出现异常错误，请及时通知开发者"));
            break;
        default:
            res.send(return_obj.fail("500", "出乎意料的错误"));
            break;
    }
})


module.exports = router;