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
router.use("/get_museum", require("./get_museum.js")); //(修改第一次)

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


//数据库相关(完成全部)
router.use("/mysql_dump", require("./mysql_dump.js"));
router.use("/get_mysql_dump", require("./get_mysql_dump.js"));
router.use("/recovery_database", require("./recovery_database.js"));

//修改用户信息相关接口
//修改用户权限
router.use("/set_user_permission", require("./set_user_permission.js"));
//修改管理员密码
router.use("/set_user_password", require("./set_user_password"));
//新增管理员
router.use("/ins_admin", require("./ins_admin.js"));

//获取管理员日志
router.use("/get_admin_log", require("./get_admin_log.js"));

// //以下 设计中


// //数据管理接口
// //博物馆
// router.use("/set_museum", require("./set_museum.js"));
// //藏品
// router.use("/set_collection", require("./set_collection.js"));
// //展览
// router.use("/set_exhibition", require("./set_exhibition.js"));
// //教育活动
// router.use("/set_education_activity", require("./set_education_activity.js"));
// //新闻
// router.use("/set_new", require("./set_new.js"));
// //评论
// router.use("/del_comment", require("./del_comment.js"));
// router.use("/set_comment", require("./set_comment.js"));
// //讲解
// router.use("/del_explain", require("./del_explain.js"));
// router.use("/set_explain", require("./set_explain.js"));



module.exports = router;