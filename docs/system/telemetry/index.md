# 浅谈一下所谓的Telemetry

### 高屋建瓴
> 奇怪的是，Telemetry这词没有一个非常合适的中文翻译，直接翻译的话就是**遥测**或者**自动检测**,其实都不是很精确。
>
> 目前在系统telemetry的产品方面，Datadogs绝对是最大的独角兽，其他的小虾米诸如Splunk，AppDynamics，Dynatrace已经开源的ELK stack，Graphana之类的，这些小虾米想着短期之内抗衡datadog还是有点难度的。
>
> 那么说的Telemetry，具体到软件服务系统里具体都设计了哪些方面呢？其实说大不大说小不小，包括五大领域：
>  1. **Log**: 这个重要性就不言而喻了，我还记得我当年在GlobalFoundries做的第一个项目就是让Applied Material一款商用软件(叫Activitity Manager，说白了就是一个比较好看的job scheduler，用来整和一组指令组成一个Job)能够输出log到服务器的文件系统里，我记得当时我用的是log4j这个lib来实现的；
>     - 这块其实已经很成熟的领域，核心的思想就是不要让这些log的IO占用太多了的系统资源，当系统IO繁忙的时候要*让路*给其他任务。大多数产品的实现办法其实都是让服务自己按自己的偏好把log写到本地文件系统里，然后产品的agent去定期的pull这些file然后推给产品服务里；
>     - 针对每条log，需要附加很多元数据，比如说log是生产的服务器ip是什么，log是什么环境(e.g., prod, staging or dev)生成的？log是哪个kube-namspace产生的等等；
>     - 还记得当年在GlobalFoundries的时候，每个服务器都有自己的rolling log文件，但是每次产问题时候都是先知道相应的log在哪台服务器上。当时想让两台服务器同时写log去Shared Drive里的同一个文件里，发现根本不行，因为文件会被锁。后来就像能不能额外加一个cron job来定期的k merge所有的log文件，但是当时一个要求就是merge完的文件里要有每条log是从哪个服务器来的，这其实就是tagging的概念。
>     - 文件的一大难点就是搜索，这就是为什么商业的产品比较牛的一个原因。其实几乎所有商用产品都会把你的log内容进行索引建立，这里建索引的时候当然会把你的所有tag都index了，而且对于你写的每个log也会加索引，这就是为什么你用datadog搜索lgo时候总是那么快了。当然这些索引其实是很costly的，所以通常只index过去1个月的log。
>  1. **Metrics**: Log还是量太大，不进行个思考和搜索的话，还是无法快速的定位问题，这在issue escalation的时候是很失效的；再有一个，好多时候我们希望回头分析telemetry的数据，如果只给你一大串的log，然后让你自己去aggregate，这显然也是失效的；综上所述，metrics的概念应声而生了，它的好处就是它本身就是个aggregation了。下面思考几个问题：
>     - 过去的4个小时里，我们服务器的CPU，RAM和DiskIO的utilization是怎样的？
>     - 过去的两周时间里，我们主要服务的endpoint ABC的访问量是怎样分布的？peak访问量是多少？
>     - 我们前端的page 123目前的load time是多少，它对应的后端api里哪一个是瓶颈？
>     - 过去的几个小时里，我们后端服务里有没有hotspot？
>
>  1. **Trace/Profling或者统称APM**: 
>  1. **Dashboards and Alerting**: 
>

> [**思考**]
> 1. **Log**是给程序员用的，算是个历史遗留产物，因为当年开发者把artifact丢给Ops之后就完活了，然后当系统出了问题时候呢，Ops的人最先看的就是log，然后希望通过log的一些迹象判断出来哪段逻辑出了问题。随着DevOps的兴起，现在Ops也参与到Dev的过程中，虽然Ops的人还是不经常开发code，但是让他们看懂code已经是个基本要求了，这也就大大的issue escalation的过程
>
>
>
>
