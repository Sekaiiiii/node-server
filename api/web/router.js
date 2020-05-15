/*
* author:谢奇
* create_day:2020-04-20
* modified_day:2020-04-22
* function:路由配置
*/
"use strict"
const express = require("express");

const router = express.Router();

//路由配置
router.use("/login", require("./login.js"));
router.use("/register", require("./register.js"));
router.use("/logout", require("./logout.js"));

//博物馆相关
router.use("/get_museum", require("./get_museum.js"));//(修改第一次)

//藏品相关
router.use("/get_collection", require("./get_collection.js"));
router.use("/get_collection_num", require("./get_collection_num.js"));

//展览相关
router.use("/get_exhibition", require("./get_exhibition.js"));
router.use("/get_exhibition_num", require("./get_exhibition_num.js"));

//教育活动相关
router.use("/get_education_activity", require("./get_education_activity.js"));
router.use("/get_education_activity_num", require("./get_education_activity_num.js"));

//新闻相关
router.use("/get_new", require("./get_new.js"));
router.use("/get_new_num", require("./get_new_num.js"));

//评论相关
router.use("/get_comment", require("./get_comment.js"));
router.use("/get_comment_num", require("./get_comment_num.js"));

//讲解相关
router.use("/get_explain", require("./get_explain.js"));
router.use("/get_explain_num", require("./get_explain_num.js"));

//用户相关
router.use("/get_user", require("./get_user.js"));
router.use("/get_user_num", require("./get_user_num.js"));

//管理员相关
router.use("/get_admin", require("./get_admin.js"));
router.use("/get_admin_num", require("./get_admin_num.js"));


//数据库相关
router.use("/mysql_dump", require("./mysql_dump.js"));
router.use("/get_mysql_dump", require("./get_mysql_dump.js"));
router.use("/recovery_database", require("./recovery_database.js"));
module.exports = router;