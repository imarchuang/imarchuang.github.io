# 数据库如何拆分

> **在面试中，如何 scale 系统，其实约等于`如何scale database`，而且横向 scale 数据库更是最重要的考点。然后这个横向拆分数据库的秘密武器就是`consistent hashing`，这也是面试中的重中之重，请务必非常清楚的解释清楚。**

> ? 不过呢，在进入重点的 consistent hashing 之前，还是先把套路走一遍，从下面的框架五步走去谈：

1. 纵向拆分(Vertical Sharding): 就是按功能拆分数据库，简单的例子，一张大表，User Table，把不经常改变的栏位放到一个表，比如说把`id, firstName, lastName, email, age`等放到 User 表，然后把一些用户登录相关的放到另一个表，暂且叫做`UserLogin表`，这个表里放诸如`userName, userId, passowrd, lastLoginTime, lastLoginDevice等`的栏位。其实呢，这就是所谓 micro-service 的重点，把耦合度高的功能放到一个**域**里，然后每个域有自己的数据库。有好多喜欢舞文弄墨故弄玄虚的人也喜欢把这个纵向切分称作 `Federation`。
    * 纵向拆分不是面试中的一个很好的考点，因为如何界定一个**域**实际上要对业务逻辑有一定的了解，不过总的切分原则也不过就是这两条：1. 某几个栏位是否从access pattern（frequency，grouping之类的）上来讲耦合度很高；2.某几个栏位是否从access control的角度上来说非常类似；
1. 横向切分：就是本文的重点介绍，把数据按照一定的规则拆分到不同数据shard里（通常每个shard都包在不同的物理主机上），比如说按照用户的地理位置(East US, Central US, West US)，按照产品的客户等。但是这通常不是面试重点，重点还是怎么用这个通用的 consistent hashing 来拆分数据库。
1. 数据复拆shard replication: 这里重点考虑单点失效的问题，就是让一份数据能存在三台不同机器上。
1. 反范式化(Denormalization)：重点就是把 analytics 的数据存储分出去，那些 analytics 数据应该用负荷大量 OLAP 的 Columnar Store 来存储。
1. SQL Tuning: 用些 Query Cache, indices, pre-aggregation, slow query logs, tightup schema 等技巧让数据库的访问变快。

### Consistent Hashing 一致性哈希

