### mongodb
* 官网下载windows版的msi，
* mongod --dbpath c:\data\db  //cmd中，在mongodb/bin目录下运行MongoDB 服务器
*       ----->>>>>              //命令即可连接上 MongoDB,27017端口即运行mongodb
```操作实例
打开cmd , 
D:
cd D:\Program Files\MongoDB\Server\3.4\bin
mongod --dbpath e:\data\db
```
* mongo.exe //运行 mongo.exe   //可以用来查询数据库或者运行robo 3T 可视化操作
```
show dbs 查看有哪些库 
-> use xxx 进入库
show collections 查看有哪些表
->db.xxx.find() 查看表里所有数据

```
