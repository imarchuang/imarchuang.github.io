# 数据库如何拆分

!> 重点说一下这篇主要涉及数据库该如何拆分，属于Scale方面的考点，至于如何设计数据层的schema，需要分贴来展示。

> **在面试中，如何 scale 系统，其实约等于`如何scale database`，而且横向 scale 数据库更是最重要的考点。然后这个横向拆分数据库的秘密武器就是`consistent hashing`，这也是面试中的重中之重，请务必非常清楚的解释清楚。**

?> 不过呢，在进入重点的 consistent hashing 之前，还是先把套路走一遍，从下面的框架五步走去谈：

1. 纵向拆分(Vertical Sharding): 就是按功能拆分数据库，简单的例子，一张大表，User Table，把不经常改变的栏位放到一个表，比如说把`id, firstName, lastName, email, age`等放到 User 表，然后把一些用户登录相关的放到另一个表，暂且叫做`UserLogin表`，这个表里放诸如`userName, userId, passowrd, lastLoginTime, lastLoginDevice等`的栏位。其实呢，这就是所谓 micro-service 的重点，把耦合度高的功能放到一个**域**里，然后每个域有自己的数据库。有好多喜欢舞文弄墨故弄玄虚的人也喜欢把这个纵向切分称作 `Federation`。
    * 纵向拆分不是面试中的一个很好的考点，因为如何界定一个**域**实际上要对业务逻辑有一定的了解，不过总的切分原则也不过就是这两条：1. 某几个栏位是否从access pattern（frequency，grouping之类的）上来讲耦合度很高；2.某几个栏位是否从access control的角度上来说非常类似；
1. 横向切分：就是本文的重点介绍，把数据按照一定的规则拆分到不同数据shard里（通常每个shard都包在不同的物理主机上），比如说按照用户的地理位置(East US, Central US, West US)，按照产品的客户等。但是这通常不是面试重点，重点还是怎么用这个通用的 consistent hashing 来拆分数据库。
1. 数据复拆shard replication: 这里重点考虑单点失效的问题，就是让一份数据能存在三台不同机器上。
1. 反范式化(Denormalization)：重点就是把 analytics 的数据存储分出去，那些 analytics 数据应该用负荷大量 OLAP 的 Columnar Store 来存储。
1. SQL Tuning: 用些 Query Cache, indices, pre-aggregation, slow query logs, tightup schema 等技巧让数据库的访问变快。

### 重要考点
1. 读流量出现了hotspot；


### 核心思想
> 1. 如果一台数据库服务器挂了，怎么做能到你的服务继续运行？你可以说我cluster的master多启动几台进行failover就好了；
> 1. 如果很不幸整个的数据库服务器master cluster都挂了，保证你的服务还部分运行？这就是数据拆分(sharding)的好处了；Note：**我这里说的数据拆分包括横向拆分和纵向拆分**；
> 1. 数据拆分(sharding)还有一个好处就是**分摊写请求（当然也适用于读请求）**，理想状态下，你的数据是均分在各个shard里的，所以所有的读写流量（前提是没有hotspot的情况下）应该是均分在各个shard上的；
> 1. 再进阶一下，现实世界里，**写流量一般是远少于读流量的**，如果大量的读流量影响了写流量的速度的话，那么就涉及到**读写分离**的概念了，这就是所谓**数据复拆(shard replication)**的用武之地了。一个shard多个备份，这样就可以**分摊读流量**了；
> 1. 现实世界里，我们不太讨论**写流量出现了hotspot**，因为这种情况真的很少发生，如果某段sharding key出现了写的hotspot，通常说明我们或者是sharding key选的不好，或者说需要在hotspot的sharding段进行更进一步拆分；但是**读流量出现了hotspot**的情况却在现实世界里经常发生，这里的解决方案也是很暴力：那就在**读流量hotspot**的sharding段进行更多的备份来分摊读流量；
> 1. 基于上一个**读流量出现了hotspot**的问题，另外一个思考方向就是目前大数据数据库设计里比较流行的**compute cluster和storage cluster分类**，比较常见的大数据数据库产品如BigQuery，AzureSQL等都是基于这种架构。其实这个思想很早就出现了，比如说谷家的三驾马车的两架：GFS和MapReduce，HDFS就是storage层的解决方案，保证数据的可用性；MapReduce就相当于compute层，如果度流量很大（也或者很重）的话，那就在MapReduce多启几个并行运算吧。
> 1. 上一条的概念在今天这阶段已经更通用化了，比如说Presto就是一个纯SQL优化，然后Presto可以把相应的计算运行中各种各样的数据库上，比如说pinot，SQL，MongoDB，DynamoDB等等；

### Consistent Hashing 一致性哈希
1. 想象一个很大很大的环，上面的每个点都对应着某个物体。假设环上一共有2^64个点，这个数字其实足以**模拟宇宙中的每个沙子**；
1. 再想象一个很强大的函数（哈希函数），这个函数能够将任意某个数值换算成环上的某个点；
1. 这里这个哈希函数还有一个
