# Android端HTTP接口文档

## 更新日志
|       时间       | 更新人 | 更新内容                                 |
| :--------------: | :----: | :--------------------------------------- |
| 2020-04-25 04:32 |  谢奇  | 初步写了写                               |
| 2020-04-30 20:01 |  谢奇  | 修改了注册接口                           |
| 2020-05-04 05:48 |  谢奇  | 新增了4、5号接口                         |
| 2020-05-04 18:51 |  谢奇  | 稍微修改了4号接口的功能                  |
| 2020-05-05 04:49 |  谢奇  | 完成6号 讲解上传接口                     |
| 2020-05-06 23:30 |  谢奇  | 完成7号 博物馆信息获取接口               |
| 2020-05-07 15:03 |  谢奇  | 完成15号 发布评论接口                    |
| 2020-05-07 15:37 |  谢奇  | 完成12号 获取博物馆评论接口              |
| 2020-05-07 23:24 |  谢奇  | 完成8号 获取博物馆藏品信息接口，初略测试 |
| 2020-05-08 00:06 |  谢奇  | 完成11号 获取新闻的接口，初略测试        |
| 2020-05-08 00:29 |  谢奇  | 完成9号 获取展览的接口，初略测试         |
| 2020-05-08 01:45 |  谢奇  | 完成10号 获取教育活动的接口，初略测试    |
| 2020-05-08 02:28 |  谢奇  | 完成13号 获取讲解信息接口                |
| 2020-05-08 02:50 |  谢奇  | 完成14号 获取自己发布的讲解信息          |
| 2020-05-08 03:14 |  谢奇  | 完成18号 反馈信息的接口                  |
| 2020-05-08 21:40 |  谢奇  | 完成17号 用户删除讲解接口                |
| 2020-05-09 00:36 |  谢奇  | 完成16号 用户删除评论接口                |
| 2020-05-12 17:34 |  谢奇  | 补充接口 查询当前登录状态                |
| 2020-05-14 15:25 |  谢奇  | 完善7号接口 获取博物馆信息               |


## 老田老胡注意事项
1. 关于登录状态的问题，服务端会创建一个session,将sessionId以cookie的形式传过去,你们看看怎么处理cookie的问题。
2. 关于图片和讲解资源问题，我准备将所有图片和资源请求编写成统一的接口。所有涉及到返回图片的接口返回的图片均采用文件名的形式，你们显示图片的时候，再用图片名调用接口。
3. 类似获取博物馆信息，藏品的接口，在无参数的状态下默认返回全部，比如调用博物馆信息接口，获取所有博物馆信息的列表。如果涉及排序、检索、分页什么的，前端也是可以解决，按道理来说应该是后端解决比较好，你们看着吧，要是你们方便最好你们解决(要写的接口太多鸟)，如果实在8方便，再告诉我，我在修改文档。

## 接口文档说明
- path
  - baseUrl是服务器的ip地址+服务器开启的端口号，建议组长规范一下将baseUrl统一写在一个地方，文档中的path为路由路径。
  - 完整的请求路径格式为 `http://ip:port/path`
  - 举例子实现登录功能的请求地址为 `http://192.144.239.176:8080/api/android/login`
- method
  - 请求的方法举例子POST,GET,PUT,DELETE,OPTIONS等等
  - post
    - 一般情况下的Content-Type为`application/x-www-form-urlencoded`
    - 涉及到上传文件的接口Content-Type为`multipart/form-data`

- params说明
    - 加粗字体为必须参数，前端传的时候务必传过来，后端写代码的时候必须对这部分参数进行检查。
    - 不必须的参数，前端有需要的时候就传，不需要的时候，什么都不传(不能传null或者""这种数据过来)。
    - "**name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$)"
      - 加粗字体 必须传一个name参数
      - name参数是一个 字符串
      - 满足"^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$"这个正则表达式才通过。

- 返回数据格式定义
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
- 返回数据的数据类型说明
  - 返回数据的数据类型均采用Mysql数据库的类型说明,不懂的可以自行查阅，或者参考以下网址
  - 查阅地址:https://www.runoob.com/mysql/mysql-data-types.html

- 错误码定义(明天再写)

    | 错误码 | 错误描述                                 |
    | :----: | :--------------------------------------- |
    |   95   | 用户不具有超级管理员权限                 |
    |   96   | 用户不具有管理员权限                     |
    |   97   | 用户不具有上传讲解权限                   |
    |   98   | 用户不具有发表评论权限                   |
    |   99   | 传入的id只能有1个                        |
    |  1**   | 用户输入类错误                           |
    |  100   | 缺少必要的参数                           |
    |  101   | 传入参数格式有误                         |
    |  102   | 用户未登录                               |
    |  103   | 用户已登录                               |
    |  104   | 用户不存在                               |
    |  105   | 用户账号密码不匹配                       |
    |  106   | 用户名或邮箱已存在                       |
    |  107   | 验证码已经失效                           |
    |  108   | 验证码不正确                             |
    |  109   | 获取验证码前后用户信息不一致             |
    |  110   | 用户名已存在                             |
    |  111   | 邮箱已存在                               |
    |  112   | 传入参数过多                             |
    |  113   | 新密码与旧密码相同                       |
    |  114   | 输入的旧密码与数据库不相同               |
    |  115   | 上传文件类型出错                         |
    |  116   | 找不到对应id的讲解                       |
    |  117   | 要删除的讲解不属于该用户                 |
    |  118   | 要删除的讲解服务端不存在                 |
    |  119   | 调用删除服务端讲解文件接口出错           |
    |  120   | 找不到对应id的评论                       |
    |  121   | 要删除的评论不属于该用户                 |
    |  122   | 数据库中找不到传入文件名对应的图片       |
    |  123   | 服务端中找不到传入文件对应的图片         |
    |  124   | 删除图片时出现出乎意料的错误             |
    |  2**   | 数据库类错误                             |
    |  200   | 发起数据库请求出错                       |
    |  201   | 验证用户信息时出错                       |
    |  202   | 获取数据库连接出错                       |
    |  203   | 开启事务失败                             |
    |  204   | 提交事务失败                             |
    |  205   | 没有修改博物馆数据                       |
    |  3**   | 其他错误                                 |
    |  300   | 服务器发送邮件失败                       |
    |  301   | 调用废弃接口                             |
    |  302   | 修改数据库出现异常错误，请及时通知开发者 |
    |  303   | 查询数据库出现异常错误，请及时通知开发者 |
    |  304   | 插入数据库出现异常错误，请及时通知开发者 |
    |  400   | 没有检索到(博物馆、展览、教育活动、藏品) |
    |  500   | 出乎意料的错误                           |

## 接口列表

### 1.注册功能(完成)
- （创建用户，默认角色为user，不具备管理员权限，可以发送评论，上传讲解）
#### 1.1 请求注册(发送验证码)(完成)
- path:/api/android/want_register
- method:post
- params
    - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$)
    - **mail_address**:string(^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$)
- data
    ```
    data:{
        msg:'发送验证码成功'
    }
    ```

#### 1.2 注册验证(提交相关信息和验证码)(完成)
- path:/api/android/register
- method:post
- params
  - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$)
  - **mail_address**:string(^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$)
  - **code**:string(^[1-9][0-9]{5}$)
  - **password**:string(^[a-zA-Z0-9_]{6,18}$)
- data
 ```
 data:{
     msg:'注册用户成功'
 }
 ```

### 2.登录功能(完成)
- function:未登录状态的用户可以通过账号密码进行登录，并在服务端设置session，保持用户登录态。
- path:/api/android/login
- method:post
- params
    - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,}$)
    - **password**:string(^[a-zA-Z0-9_]{6,18}$)
- data
    ```
    data:{
        msg:'登录成功'
    }
    ```

### 3.退出功能(完成)
- function:已登录状态用户调用接口，退出登录态
- path:/api/android/logout
- method:get
- params:
- data:
    ```
    data:{
        msg:'退出登录成功'
    }
    ```

### 4. 修改用户信息(有更改，修改邮箱比较麻烦，暂时不考虑。仅提供修改用户名接口)(已完成)
- function:已登录状态用户可以调用该接口修改用户信息，仅限于用户名,修改密码用另一个接口。
- path:/api/android/set_user_info
- method:post
- params:
    - **name**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{2,18}$)
    ~~- mail_address:string(^[a-zA-Z0-9_]+([-+.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$)~~
- data
    ```
    data:{
        msg:'修改用户信息成功'
    }
    ```

### 5. 修改用户密码(已完成)
- function:已登录状态用户可以调用该接口修改用户密码
- path:/api/android/set_user_password
- method:post
- params:
    - old_password:string(^[a-zA-Z0-9_]{6,18}$)
    - new_password:string(^[a-zA-Z0-9_]{6,18}$)
- data:
    ```
    data:{
        msg:'修改密码成功'
    }
    ```


### 6. 讲解上传(已完成)
- function:已登录状态用户可以调用该接口上传讲解，
- path:/api/android/upload_explain
- method:post
- params:
  - **music**:file(文件类型为.mp3,上传数量限制为1,文件名不超过100字节)
  - **title**:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)
  - artist:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)
  - album:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)
  - genre:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)
  - duration:string(^\d+$)
  - duration_unit:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)
  - album_art_res_id:string(^\d+$)
  - album_art_res_name:string(^[\u4E00-\u9FA5A-Za-z0-9_]{1,255}$)

  - 以下3个id必须有一个id存在，表示这个讲解是藏品|博物馆|展览讲解
  - collection_id:string(^\d+$)
  - exhibition_id:string(^\d+$)
  - museum_id:string(^\d+$)
- data:
    ```
    data:{
        msg:"上传讲解成功",
        filename:上传的讲解在服务器的名字
    }
    ```
- ps:
  - 因为获取讲解的接口还没写好，你们要看上传的讲解，或者测试讲解播放的情况，你们采用如下方式`http://192.144.239.176:8080/filename`
  - 我返回的filename就是让你们测试的=。=
  - 因为上传文件和播放音频都比较占用带宽，emm，服务器比较糟糕，可能要等一会才有响应。

### 7. 获取博物馆信息(已完成）
- function:该接口获取博物馆信息列表
- path:/api/android/get_museum_info
- method:get
- params:
    - order_by: 可选值 0 1 2 3 
      - 0 按名字 我也不知道 什么序 排序
      - 1 按展览数量降序排序
      - 2 按藏品数量降序排序
      - 3 按评分降序排序
      - 不传入 按数据库默认检索排序
    - name:名字模糊查询
- data:
    ```
    data:{
        msg:"获取数据成功",
        museum_list:[
            {
                id:int,
                name:varchar(255),
                establishment_time:data,
                open_time:time,
                close_time:time,
                time:longtext,？
                introduction:longtext,
                visit_info:longtext,
                attention:longtext,
                exhibition_score:double,
                environment_score:double,
                service_score:double,
                position_name:varchar(255),
                longitude:double,
                latitude:double,
                image_list:[
                    'filename1.jpg',
                    'filename2.jpg',
                    ...
                ]
            },
            ...
        ]
    }
    ```

### 8. 获取博物馆藏品信息(排序按照名字排序 提供按名字模糊搜索)(已完成，缺少数据测试)
- function:调用该接口获取某个博物馆的藏品信息
  - 筛选功能:提供基于博物馆的筛选(比如某个博物馆的所有藏品)(默认显示所有博物馆的所有藏品)
  - 排序功能:默认按照名字排序
  - 搜索功能:提供名字的模糊查询
  - 分页功能:
- path:/api/android/get_collection_info
- method:get
- params:
    - id:int(需要检索的某个博物馆的id)
    - name:string(名字模糊查询时使用)
    - page:int(表示第几页 从1开始)(默认第一页)
    - ppn:int(每页显示多少条数据)(默认10条)
- data:
    ```
    data:{
        msg: "获取藏品信息成功",
        collection_list:[
            {
                id:int
                museum_id:int
                name:varchar(255),
                content:longtext,
                material:longtext,
                tag:int(一个映射表的key(这个表由曹锦华组给出)),
                image_list:[
                    'filename1.jpg',
                    'filename2.jpg',
                    ...
                ]
            },
            ...
        ]
    }
    ```

### 9. 获取博物馆展览信息(已完成)(排序 名字排序 搜索 名字搜索)
- function： 调用该接口获取某个博物馆的展览信息
- path:/api/android/get_exhibition_info
- method:get
- params:
    - id:int(需要检索的某个博物馆的id)
    - name:string(名字模糊查询时使用)
    - page:int(表示第几页 从1开始)(默认第一页)
    - ppn:int(每页显示多少条数据)(默认10条)
- data:
    ```
    data:{
        msg: "获取展览成功",
        exhibition_list:[
            {
                id:int,
                name:varchar(255),
                content:longtext,
                start_time:datetime,
                end_time:datetime,
                time:string,
                tag:int(一个映射表的key(这个表由曹锦华组给出)),
                image_list:[
                    'filename1.jpg',
                    'filename2.jpg',
                    ...
                ]
            },
            ...
        ]
    }
    ```

### 10. 获取博物馆教育活动信息(已完成)(排序 名字排序 搜索 名字搜索)
- function: 调用该接口获取某个博物馆的教育活动
- path：/api/android/get_education_activity_info
- params:
    - id:int(需要检索的某个博物馆的id)
    - name:string(名字模糊查询时使用)
    - page:int(表示第几页 从1开始)(默认第一页)
    - ppn:int(每页显示多少条数据)(默认10条)
- data:
    ```
    data:{
        msg: "获取教育活动信息成功",
        education_activity_list:[
            id:int,
            name:varchar(255),
            start_time:datetime,
            end_time:datetime,
            time:longtext,
            tag:int(一个映射表的key(这个表由老曹组给出)),
            content:longtext,
            url:longtext,
            cooperator:longtext,
            museum_id,
            image_list:[
                'filename1.jpg',
                'filename2.jpg',
                ...
            ]
        ]
    }
    ```

### 11. 获取新闻信息列表(已完成)(现没有在有和博物馆相关联的新闻测试)
- function: 调用该接口获取所有新闻信息或者某个博物馆的新闻信息
- path: /api/android/get_new_info
- params:
    - id:int(博物馆id)
    - name:string(新闻标题模糊查询使用)
    - page:int(>= 1)
    - ppn:int(>= 0)
- data:
    ```
    data:{
        new_list:[
            {
                id:int,
                title:varchar(255),
                author:varchar(255),
                time:datetime,
                description:longtext,
                content:longtext,
                url:longtext,
                tag:int(一个映射表的key(这个表由老孟组给出))
                museum_id:int
            },
            ...
        ]
    }
    ```

### 12.获取博物馆的评论(排序 默认按时间顺序排序)(已完成)
- function:可以调用该接口查看某个博物馆的评论
- path:/api/android/get_museum_comment
- params:
    - **id**:int(博物馆id)
- data:
    ```
    data:{
        msg:"获取评论成功",
        comment_list:[
            {
                id:int,
                time:datetime,
                content:longtext,
                exhibition_score:double,
                environment_score:double,
                service_score:double,
                name:varchar(255),
                mail_address:varchar(255)
            },
            ...
        ]
    }
    ```

### 13.获取讲解信息(已完成)
- function:阔以通过调用该接口查看所有讲解或者某个博物馆的讲解
- path:/api/android/get_explain_info
- method:get
- param:
    - 以下3个id,要是全部不存在表示查询所有的讲解,若存在其中1个表示查询对应的讲解,不能同时传多个id
      - museum_id:int(博物馆id)
      - exhibition_id:int(展览id)
      - collection_id:int(藏品id)
    - page:int(>= 1)
    - ppn:int(>= 0)
- data:
  ```
  data:{
    //以下是测试的例子
    data:{
        "msg": "获取讲解成功",
        "explain_list": [
            {
                "id": 2,
                "title": "ABC12",
                "artist": null,
                "album": null,
                "genre": null,
                "duration": null,
                "duration_unit": null,
                "file": "Quadro Nuevo - Kommissar Maigret.mp3-1588624513614.mp3",
                "album_art_res_id": null,
                "album_art_res_name": null,
                "is_illegal": 1,
                "user_id": 31,
                "collection_id": null,
                "exhibition_id": null,
                "museum_id": 123,
                "name": "XQ1",
                "mail_address": "738359456@qq.com"
            },
            ...
    }
  }
  ```

### 14.用户查看自己的发布的讲解(已完成)(因为发的应该不会太多所以所以就不写参数了)
- function:已登录用户查看自己发过的讲解
- path:/api/android/get_myself_explain
- params:
- data:
    ```
    data:{
        "msg": "获取讲解信息成功",
        "explain_list": [
            {
                "id": 2,
                "title": "ABC12",
                "artist": null,
                "album": null,
                "genre": null,
                "duration": null,
                "duration_unit": null,
                "file": "Quadro Nuevo - Kommissar Maigret.mp3-1588624513614.mp3",
                "album_art_res_id": null,
                "album_art_res_name": null,
                "is_illegal": 1,
                "user_id": 31,
                "collection_id": null,
                "exhibition_id": null,
                "museum_id": 123
            },
    }
    ```

### 15.用户发表评论(已完成)
- function: 已登录用户阔以对某个博物馆进行评价
- method:post
- path:/api/android/comment
- param:
    - **museum_id**:string(^\d+$);
    - **content**:longtext(不做检查)
    - **exhibition_score**:float(0-5)
    - **environment_score**:float(0-5)
    - **service_score**:float(0-5)
- data:
    ```
    data:{
        msg:"发布评论成功"
    }
    ```

### 16. 用户删除评论(已完成)
- function:已登录用户阔以对自己已经发布的评论进行删除
- method:post
- path:/api/android/del_comment
- params:
  - **id**:(需要删除的评论的id)
- data:
  ```
  data:{
      msg:"删除评论成功"
  }
  ```

### 17. 用户删除讲解(已完成)
- function:已登录用户阔以对自己已经发布的讲解进行删除
- method:post
- path:/api/android/del_explain
- params:
  - **id**:(需要删除的讲解的id)
- data:
  ```
  data:{
      msg:"删除讲解成功"
  }
  ```

### 18. 客户反馈(已完成)
- function:登录状态下的用户阔以调用改接口，将反馈信息以邮箱方式发送给管理员，由管理员进行解决回复
- method:post
- path:/api/android/feedback
- param:
    - title:string
    - content:string
- data
    ```
    data:{
        msg:"反馈信息发送成功"
    }
    ```

### 19.忘记密码(设计中)
- function：暂时先搁置一哈

### 20.查询登录状态(已完成)
- function:调用该接口查看当前请求的cookie是否是已登录状态
- method:get
- path:/api/android/get_login_state
- data
  ```
  //已登录
  data:{
      msg:"用户已登录",
      is_login:true
  }
  //未登录
  data:{
      msg:"用户未登录",
      is_login:false
  }
  ```