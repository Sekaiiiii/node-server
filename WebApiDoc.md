# Web端HTTP接口文档

## 更新日志
|       时间       | 更新人 | 更新内容            |
| :--------------: | :----: | :------------------ |
| 2020-05-09 02:16 |  谢奇  | 1、2、3号接口已完成 |


## 返回数据格式定义
- 失败情况
```(json)
{
    "status":0  //状态码 0表示失败 1表示成功
    "error_code":"2000" //错误码
    “error_des":"身份验证失败"  //错误描述
}
```
- 成功情况
```
{
    "status":1 //状态码 0表示失败 1表示成功
    "data":{
        //返回的数据
    }
}
```

## 错误码定义
| 错误码 | 错误描述             |
| :----: | :------------------- |
|  1**   | 用户输入类错误       |
|  100   | 缺少必要的参数       |
|  101   | 传入参数格式有误     |
|  102   | 用户未登录           |
|  103   | 用户已登录           |
|  104   | 用户不存在           |
|  105   | 用户账号密码不匹配   |
|  2**   | 数据库类错误         |
|  200   | 调用数据库接口错误   |
|  3**   | 其他错误             |
|  300   | 调用退出接口发生错误 |

## 接口列表
- params说明
    - 加粗字体为必须参数，前端传的时候务必传过来，后端写代码的时候必须对这部分参数进行检查。
    - 不必须的参数，前端有需要的时候就传，不需要的时候，什么都不传(不能传null或者""这种数据过来)。
- data指的是成功时返回的data的包含的内容，举例子
```
文档内
- data
  - msg:"你好"
代码中返回的对象内容
{
    state:1,
    data:{
        msg:'你好'
    }
}
```
```
文档内
- data
  - musemu_info:[obj1,obj2]
代码中返回的对象内容
{
    state:1,
    data:{
        musemu_info:[obj,obj2]
    }
}
```
### 1.注册功能(谢奇)
- function:创建用户，默认角色为role，不具备管理员权限，可以发送评论，上传讲解
- path:/api/web/register
- method:post
- params
    - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$)
    - **password**:string(^[a-zA-Z0-9_]{6,18}$)
    - **mail_address**:string(^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$)
- data
    ```
    data:{
        msg:'注册用户成功'
    }
    ```

### 2.登录功能(谢奇)
- function:未登录状态的用户可以通过账号密码进行登录，并在服务端设置session，保持用户登录态。
- path:/api/web/login
- method:post
- params
    - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,12}$)
    - **password**:string(^[a-zA-Z0-9_]{6,18}$)
- data
    ```
    data:{
        msg:'登录成功'
    }
    ```

### 3.退出功能(谢奇)
- function:已登录状态用户调用接口，退出登录态
- path:/api/web/logout
- method:get
- params:
- data:
    ```
    data:{
        msg:'退出登录成功'
    }
    ```

### 4.用户管理相关接口(刘学海)
#### 4.1 获取用户信息列表
- function:已登录状用户可以调用该接口，获取所有用户信息。
- path:/api/web/get_user_info
- method:post
- params:
- data:
#### 4.2 修改用户信息
- function:已登录状态用户可以调用该接口，修改用户信息
- path:/api/web/set_user_info
- method:post
- data:
```
data:{
    'msg':"修改用户信息成功"
}
```
#### 4.3 修改用户权限
- function:已登录状态用户可以调用该接口，修改用户权限
- path:/api/web/set_user_permission
- method:post
- params:
    - **id**:int(用户id)
    - no_comment:tinyint(0/1)
    - no_upload_explain:tinyint(0/1)
- data:
```
data:{
    'msg':"修改用户权限成功"
}
```

### 5.管理员管理接口(龙俊至)
#### 5.1 显示管理员列表
- function:已登录状态可以调用该接口，查看管理员列表
- path:/api/web/get_admin_info
- method:get
- params:
- data:
```
```
#### 5.2 添加管理员
- function:已登录状态的Root用户可以调用该接口，添加新的管理员
- path:/api/web/add_admin
- method:get
- params:
    - 管理员信息的相关参数，我先省略
- data:
```
```
#### 5.3 删除管理员
- function:已登录状态的Root用户可以调用该接口，删除新的管理员
- path:/api/web/del_admin
- method:get
- params:
    - 管理员信息的相关参数，我先省略
- data:
```
```
#### 5.4 获取管理员日志
- function:已登录状态的Root用户可以调用该接口，获取管理员日志
- path:/api/web/get_admin_log
- method:get
- params:
    - id(管理员id)
- data:
```
```

### 6.新闻数据相关接口(谢奇)
#### 6.1 获取新闻信息
- function:获取新闻信息
- method:get
- param
    - ppn
    - page
    - title
    - new_id
    - museum_id
    - tag

#### 6.2 获取新闻信息的数量
- function:获取新闻信息的数量
- method:get
- param
    - title
    - museum_id
    - tag



### 7.博物馆相关接口

### 8.评论相关接口
#### 8.1 获取评论接口
- path:/api/web/get_comment
- method:get
- params:
    - museum_id:博物馆id
    - user_name:用户名
