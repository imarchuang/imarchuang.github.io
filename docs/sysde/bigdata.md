
# 谷家的三驾马车

> 直接让你设计类似某个知名的系统这种状况，在面试中我到目前是还没碰到过。不过呢，我碰到了这些知名系统的某块的设计，比如说我有好几次碰到需要进行外排序的状况了，还有比如说两个链表让你找交集，一个比较短，另一个很长很长，这其实在谷家三驾马车中都有体现。
> 1. 在**文件存储层**，谷家有GFS，它的设计的最大特点就是从来就**不修改**文件，也就是著名的只写一次，读取多次。它解决了什么痛点呢？我个人觉得就是解决了Linux系统下把存储切得太小的痛点，by default，linux里预置block的size为4096Byte，所以你看看，这就说明它的初衷其实是说OS层里处理的数据最好是4KB左右，这样才不会让一个硬盘能够最大化的被utilized，主要源于那个时候刺头硬盘是很贵的。当数据越来越大，发现4KB作为计算单位就显得非常不靠谱了，当然第一个想到的肯定是在OS层的那个block size设置的大一些不就好了嘛？这么说没毛病，但是这样也同时意味着你的那些还不需要很大block size的操作(多数情况下我们社交网络里**每个人**产生的数据并非可以用128MB作为计算单位)，而且还有一个大问题就是，OS层多数只负责单机，所以挂在这个单机上的硬盘只有一大块，如果你想一份数据多个备份，这个在OS层看起来就写好几次。这里就提到硬盘厂商提供的解决方案，那就是他们想把**一存三份**这个操作封装到他们的Firmware里，比如说那个臭名昭著的RAID协议，然后呢，这个RAID硬盘在OS看起来跟传统的硬盘并无二异。其实大厂对于这种跨组织的RAID肯定是不买单的，他们的工程师就相当于把这块**大数据存储**的逻辑分了出来。
>   * 那么这些像GFS之类的分布式存储系统出现之前，那些传统的数据库厂商是咋做呢？他们其实很粗暴，他们直接建立在OS层的file协议(文件系统)之上的。比如说，你如果进入过安装了MySQL数据库的实体机上，你会发现那个实体机上附着的硬盘上是这么组织存储的：一个Schema对应一个高层文件夹folder，然后在每个schema里的每个Table都对应着一个第二次的文件夹，然后在这个文件夹里有两个文件：一个存内容数据(*.ibd)，一个存meta数据(*.frm)，但是他们对于文件的压缩和文件的编码做了处理，主要做的其实是为了有效利用硬盘，而并非有效读取和写入。
> 1. 来说说**数据存储层**，这里你可以简单的对应到传统的数据库厂商(Oracle，Microsoft之流)，他们基于OS层的文件系统，抽象出了一大堆的更适用于终端用户的API接口，避免了繁文缛节的跨多个文件操作时的细节，那么既然有了一种新的`大文件系统`，那就需要建立一个对应的高层API接口的系统对吧？这里的核心需求来自哪儿呢？我们之前提到过，**多数情况下我们社交网络里每个人产生的数据并非可以用128MB作为计算单位**的，也就是说我们面的的数据在日常生活中是很chatty的，可能就是那种16KB到1MB的流量是最多的，那么这时候面对这么散列的流量数据，我们还想用`大文件系统`做存储，就需要一个更合理的利用方式对吧？这就是传说中著名的**Key-Value store**的解决方案。谷家提供了BigTable，亚麻提供了DynamoDB，Meta家提供了Cassandra，开源大户家提供了HBase，MongoDB之类的。这些解决方案当然不是全部都用了GFS、HDFS类的`大文件系统`，但是都是基于`Key-Value store`这个概念。当然了，MongoDB之类的更像是中间派，他们称自己为`document database`，其实算是介于Key-Value store和传统关系型数据库之间。那么`Key-Value store`和关系型数据库的核心区别在哪儿呢？
>   * 纯个人观点：`Key-Value store`的唯一的query办法就是**Key**，
>   * 如果你让一些传统的RDBMS厂商用HDFS，这个基本上是不可能的，主要是因为他们的核心逻辑都是基于OS层的文件系统进行组织优化的。
>1. 谷家用BigTable来跟一些传统的RDBMS来竞争，使得`大文件系统`能够衔接到我们日常能用的一些application，比如说web application之类。但是呢，这并不能集中体现`大文件系统`的优势，也不是`大文件系统`创作初衷。GFS起初是为了解决海量数据的存储并合理读取加以计算的，于是谷家创作了一个叫MapReduce的计算框架，有个这个框架，就使得更多的**普通**程序员都能操作大数据了，敲击行代码就能算出500GB的数据里有多少个`红绿蓝`三种颜色的点，你说这在当时多么神奇？而当时用当时的Oracle的算这玩意儿的话，你的query一定会被你的DBA鸟一通，因为你很可能把整个数据库都搞挂了。这个框架主要解决了以下几个当时的痛点：
>   * 越来越多的程序员需要处理海量数据(现在叫大数据)，跟GFS这种`大文件系统`的底层API还是有点太底层，不是每个程序员都能尽快的精准掌握；
>   * 处理海量数据一定需要用到很多的机器(主要是谷家一直奉行**多个臭皮匠顶一个诸葛亮**的原则)，不是每个程序员都能bug free的写一些分布式计算的代码，比如说怎样处理容错机制，怎么处理网络层的断点重续之类的；
>1. 有了MapReduce框架，算是你能够democratize大数据带来的优势给**普通**程序员了，但是这类**普通**程序员毕竟还算是有脑子的人，但是现实社会告诉我们，在我们这个社交大网里有海量的数据，更有海量的**普通**数据分析员，这类人有个共同特点：`他们觉得他们写的SQL就是代码`，但是你让他写个程序读取两个文件然后找这两个文件内容的交集，他们会问你**这俩文件咋不在数据库里呢**？我说这些没有歧视的意思，主要就是想说明SQL的普及度已经可以说是相当相当高了，你给一些更加好用的DSL也不会让他们改变对SQL的忠诚。谷家显然也很快意识到了这点，所以他们就创建了`BigQuery`这个框架，这个框架用不太准确的描述就是在MapReduce之上开始支持SQL语法。
>
>大数据发展到今天，战争还在继续，不过有些东西已经有了结论。
>1. 谷家的三驾马车依旧没有开源，不过现在也已经不需要了，因为`开源`社区已经有了成熟的生态系统，对于GFS，Hadoop生态系统创建了HDFS；对于BigTable，开源系统有了HBase，基本算是照抄的BigTable；针对MapReduce，开源社区现有Hadoop，再接着有了Spark，这个Spark更像是青出于蓝而胜于蓝超过了谷家的MapReduce；针对BigQuery，开源社区有Hive。
>1. 在百家争鸣的那个年代(2009-2013)，NoSQL战场也基本形成了三种解决方案共存的今天：以DynamoDB，Redis为代表的Key-Value Store，以Cassandra，HBase为代表的Columnar Store，以MongoDB为代表的Document Store。
>1. 就像当年Apache Tomcat输送了Ant这样的好东西，在各种大数据系统百花齐放的过程中，也给我们带来了好多`意外的`惊喜，比如说Zookeeper，Chubby，Dapper(分布式系统追踪)，zipkin之类的。
>1. 数据流式实时计算也算是有了结论，Kafka显然变成了这领域的王者，但是Kafka显然不甘心只做个数据流计算处理框架，他们更想成为的还是让数据直接存在他们这个框架所附带的存储里，不过我个人认为这个原文可能不太好实现。
>
>说战争还在继续，主要体现在以下几个方面：
>1. 关于数据存储，不是每家公司都是FAANG这种体量的，所以怎么把HBase啊，Hive啊这种东西重新包装一下，推销给**芸芸众生**的中小型公司和那些呆若木鸡的大公司(银行啊，政府啊，大型制造商之类的)的战争还在继续。所以近几年动不动就有一个新的DBMS名字出来，告诉你他们的产品是如何如何的超过谷家的，举个例子就是MemSQL，他们MemSQL这名没坚持多久，现在就改名为SingleStore了，他会告诉他们家的产品牛逼到你的operational的DB和analytic的db可以合二为一，也就是说把BigTable和BigQuery合起来，而且他们的销售会告诉你，你只需要存一次operational的数据，转成analytical的数据的过程是自动的，跟虚假传销的程度不相上下。
>1. 数据LakeHouse的概念大家还在继续挣扎，挣扎的多数还是上面提到的中小型公司和那些个呆若木鸡的大公司，因为LakeHouse的核心痛点并不是把数据集中存储起来，而是集中起来以后的消费模式，比如说怎么让集中起来的数据可以拥有高质量(Data Quality)，怎么让集中起来的数据能让人很快地定位到(Data Catalogue)，怎么让集中起来的数据不被随意的滥用(Data Governance)。
>1. 还有一个领域也是尚未见分晓，那就是数据的visualization这块。这块虽然很大程度上取决于数据源头和LakeHouse的完事程度，但是对于**芸芸众生**的中小型公司和那些呆若木鸡的大公司来说，他们的相关负责人最容易让领导看到效益的部分也就是这块了，所以这块的相关厂商还是处于暴力阶段。

### 言归正传 -- 面试技巧
?> BigTable的系统里涉及了一下几个重要的知识点：
1. 怎样通过一个offset来读取一个硬盘上的文件的一部分内容，或者从一个offset起读取文件到一个终点target。读[这篇帖子](https://stackoverflow.com/questions/736556/binary-search-in-a-sorted-memory-mapped-file-in-java)看java的实现。
1. SSTable里可以创建一个`Key:Offset`的映射，这样就可以快速利用offset索引爱读取文件的一部分内容。
1. 一个小数组a1文件，一个巨大的"数组"组a2文件，让你找这两个文件的交集，你咋整？这就是要对a2文件建key:offset的索引；当然大的系统就是要外排序；
1. 内存里存的是个有序的数据结构，这里利用的就是SkipList跳跃表，要清楚这个跳跃表数据结构的基本原理；
1. 判读一个元素是否在一个Set集合里，要用BloomFilter先进行过滤，要清楚这个BloomFilter的基本原理；
1. 如果BigTable的一张表太大了，就需要拆分sharding到多个机器上；

### 硬盘上的外排序
> 这个考点的主要目的是看你会不会有效利用**有限的内存**。比如说给你一台机器，它的内存只有**4.2GB**，然后你有8GB的数据需要排序，咋整？
>1. 首先你可以简单地把这个8GB数据想成一个很大file(当然即使是一大堆小的file道理也是一样)，你会想到先读文件的前半部分4GB，然后内存里排好序了然后写回去硬盘(e.g., `file1.txt`)，同理也把后半部分读进来排序在写回去(e.g., `file2.txt`)，这里有个考点就是**怎么只读一个文件的后半部分进内存**，这个跟面试官简单解释一下就好，说OS的文件系统里是提供从一个offset点起开始读一个file的内容的。
>   * 如果面试官真的想深入看看你对文件系统的理解的话，这里建议就是用一个特定的语言来细聊一下。比如你可以这么表达：Java里有个File的概念，这个File的new出实体化只需要一个**路径**，它只会将OS层的文件的`metadata`元数据读进来，比如说file的`大小`，file的`行数`，file的`owner`，file的`创建时间`之类的，然后你告诉面试官这就是相当于我们在一个terminal里做了个`ls`的command，文件的实体内容是没有读入内存的。将文件内容读入内存，需要用到所谓的`FileInputStream`，这实际上是打开了一个IO的`channel`，你可以用`fileInputStream.getChannel()`来拿到这个diskIO的`channel`，然后呢这个channel提供一个叫做`map()`的函数，你可以告诉你想读的起始offset点和长度来进行**部分内容**读取，比如说`channel.map(READ_ONLY, start, length)`。
>1. 现在你成功的把一个文件劈成两半并进行了排序，现在你需要做的就是**k路归并**操作，只不过这个k路归并需要点小小的分配，因为内存不够用。这里的解法是这样的：你先将前半部分`file1.txt`这个文件读一半(2GB)进内存叫做`list1`，同样的再读`file2.txt`这个文件的前半部分(2GB)进内存叫做`list2`，注意的是你的两个diskIO的channel不要关掉。这样你还剩200MB的内存，你可以让这个200MB的内存当做你的write buffer。现在进行二路归并，`list1`和`list2`两个排序好的链表归并，这个应该很容易理解吧？归并的结果存在`list3`(就是我们上边提到的buffer)，注意归并到list3的元素要从对应的list1或者list2中删除。当你的list3到达了200MB了，你要做这个几个操作：1. 把buffer里的内容一下flush到硬盘上；2. 比如说这个200MB里有150MB是list1贡献的，另外50MB是list2贡献的，那么你要利用之前没关的两个channel进行补充对应的缺口。就这样，你就可以一直进行二路归并，知道list1和list2为空。
>   * 这里有个小小的细节，那就是你是不可以强制JVM进行GC的，那么你怎么保证你flush到disk的那200MB从内存里也删除呢？
>
>这个地方可以衍生出很多很好的考题，这里就举几个例子吧。
>1. 给你一个8G的文件，文件里的内容就是无数个`key-value pairs`，你可以想象成这个key是一个32Byte的string，而value的size会大很多很多(但最多一个value的上限不会超过5MB)。然后给你一台内存只有**4.2GB**的机器，现在让你在这台机器上run一个服务，这个服务能让**快速**告诉你一个`key`所对应的`value`是什么。
>   * 这题是个trick题，上边讲了一堆**外排序**，这儿你其实完全用不到。因为这题的意思其实是key是unique的，所以你只要建这么一个`key:address`的映射索引就好了，你只要把这个映射所以(hashmap)load到内存里(因为题里说了key的size比value要小的多)，然后每次先在那个map找对应的key，找到了就可以用对应的address去原文件里只读那一个对应value就好了。
>1. 再极端一点儿，跟上题的其他条件都一样，只不过这次限制了你application服务能用的内存只有**10MB**，你怎么能让你这个服务**快速**告诉你一个`key`所对应的`value`呢？
>   * 这题的核心是内存真的太有限了，可能一个value就填满了内存的一半，这时候剩下的5MB就不能存下所有的`key:address`的映射索引了。这时候你就需要更**聪明的**对这个索引进行剪枝。答案就是要对原来的8GB文件先进行**外排序**，这儿虽然你的内存只有10MB，但是也是可以做到对8GB文件进行排序的，因为**外排序**算法的空间复杂度理论上是可以做到O(1)的，只不过时间会很长。当你对8GB文件进行了**外排序**之后，因为你只有5MB内存可用，那么你可以利用**二分思路**将文件中关键的key存成一个`TreeMap`，然后你每次根据要找的key进行二分查找了。
>1. 给你一个大约200MB的数据，然后另外一个8GB的数据，让你利用一个内存只有**4.2GB**机器将这**两组数据的交集**找出来。
>   * 这题出来你要先问面试官，这两组数据是不是`key-value pairs`对吧？如果是的话，然后二者的交集纯粹是key相等，那你就不用麻烦了什么外排序了，就直接把两组所有的key都load到内存里，然后剩下的就是找两个hashmap的交集，这个应该够简单了吧？
>   * 如果面试官告诉你这两组数据不是什么`key-value pair`，意思就是整个元素(这里你可以先想象成两个csv文件，只有整”行“相等才可以)都要比较彻底才能确定是否算交集，这时候你就需要先将那个8GB的文件进行**外排序**手术了，然后建个`”key“:address`映射索引了。这里比较极端的是如果让你的"key"是每行的一部分数据，比如说每行的开头16个字母之类的。
>

### BigTable读取数据三步走
>1. 在BigTable的服务器内存里，一定有一个**元数据catalog**，这里存在这么一堆数据`[sstable0|address0|index0|bloomfilter0,sstable1|address1|index1|bloomfilter1, ...]`，然后内存里还存有一个有序的跳跃表SkipList结构的有序链表。然后读取的顺序就是先用内存有序链表查找，这里借助跳跃表O(logn)的查询操作判断某个key是否存在于SkipList里；如果找不到，进行以下操作：
>1. 从**元数据catalog**先将某个SSTable对应的bloomfilter里读出来，然后用这个bloomFilter判断某个key是否存于这个table里，bloomfilter的特性是：**False is always False, True maybe True**，所以如果bloomfilter说这个key不存在那就是直接去找下一个SSTable...
>1. 如果bloomfilter说key可能存在于这个SSTable，那就进行第二步，用key-address映射索引去找对应的key的address，如果找到了那就用对应的address去硬盘上将value读进内存；但是这个key可能找不到对应的映射address，这说明bloomfilter误判了。
>1. 对应有些很老的很老的SSTable，这个映射所以可能不存于内存里，这时候就要借助硬盘上的**二分查找**来找对应的key了。
>
>


### 就事论事
* [Scenario层](#Scenario层)
* [Service层](#Service层)
* [Storage层](#Storage层)
* [Scale层](#Scale层)

