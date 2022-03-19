
# 系统设计大纲

> **在面试中，如何scale系统，其实约等于`如何scale database`，而且横向scale数据库更是最重要的考点。然后这个横向拆分数据库的秘密武器就是`consistent hashing`，这也是面试中的重中之重，请务必非常清楚的解释清楚。**

>? 不过呢，在进入重点的consistent hashing之前，还是先把套路走一遍，从下面的框架五步走去谈：
1. 纵向拆分(Vertical Sharding): 就是按功能拆分数据库，简单的例子，一张大表，User Table，把不经常改变的栏位放到一个表，比如说把`id, firstName, lastName, email, age`等放到User表，然后把一些用户登录相关的放到另一个表，暂且叫做`UserLogin表`，这个表里放诸如`userName, userId, passowrd, lastLoginTime, lastLoginDevice等`的栏位。其实呢，这就是所谓micro-service的重点，把耦合度高的功能放到一个域里，然后每个域有自己的数据库。
1. 横向切分：就是本文的重点介绍，把数据按照一定的规则拆分到不同数据库里，比如说按照用户的地理位置(East US, Central US, West US)，按照产品的客户等。但是这通常不是面试重点，重点还是怎么用这个通用的consistent hashing来拆分数据库。
1. 数据复拆: 这里重点考虑单点失效的问题，就是让一份数据能存在三台不同机器上。
1. 反范式化(Denormalization)：重点就是把analytics的数据存储分出去，那些analytics数据应该用负荷大量OLAP的Columnar Store来存储。
1. SQL Tuning: 用些Query Cache, indices, pre-aggregation, slow query logs, tightup schema等技巧让数据库的访问变快。


