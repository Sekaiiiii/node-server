/*
 * author:谢奇
 * create_day:2020-05-05
 * modified_day:2020-05-05
 * function:multer上传文件中间件的配置文件
 */
'use strict'
const multer = require("multer");

module.exports = {
    web: {

    },
    android: {
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/');
            },
            filename: function (req, file, cb) {
                cb(null, 'explain' + '-' + Date.now() + '.mp3');
            }
        }),
        fileFilter: function (req, file, cb) {
            if (file.mimetype != "audio/mpeg") {
                return cb(new Error("upload file mimetype error"), false);
            }
            return cb(null, true);
        },
        limits: {
            files: 1
        }
    }
};