# 记录我的Django之路

## 先来写高屋建瓴的理论
>
> 从基础上说，一个HTTP request的生命周期跟其他语言的Web Framework是遵循了一个套路的，这篇[帖子](https://goutomroy.medium.com/request-and-response-cycle-in-django-338518096640)解释的简明扼要:
![](../pictures/django_request_lifecycle.png)
> 
>如果你想要再深入的了解一下的话，看看这个[短片](https://www.youtube.com/watch?v=Lwp73bSaplo)
>
> 跟其他的Web Framework一样，生产环境里需要一个类似于nginx的Web Server来作为Reverse Proxy。Reverse Proxy里能做啥和能做啥，个人经验是现在好多人不喜欢放太多功能在这儿，但是Nginx+一直拼命的推销越来越多功能让用户陷入混乱。经验法则上来说，大家对Reverse Proxy基本上只做这几块功能，比如说Load balancing, Web acceleration, Security and anonymity等。
>
> Python世界里呢，对于从HTTP到Python语言semantics的转化桥梁这块，单独进行了诠释，这个诠释使用协议的方式进行的，这个协议的全称叫做Web Server Gateway Interface，简称WSGI。比较模板式的WSGI实现叫做gunicorn。个人觉得跟其他语言相比呢，Python在这块切的比较干净，用户基本上不会觉得WSGI server做了Reverse Proxy应该做的事情。当年的J2EE就是一个反面典型，J2EE对Reverse Proxy基本上是和Apache Web绑定了，也没有专门一层来定义如何从Web Server(Reverse Proxy)到Application Server进行交互。
>
> WSGI Server到底做了啥呢？其实特别特别简单，就是来说多启动几个process，然后每个Process可以handle一个request at one time。比如说，你可以让gunicorn启动3个worker（每个worker对应一个Process），每个worker都有相应的**独立**的memory管理空间，然后每个worker都去跑一个Django的app，这个Django app指的是同一个app，虽然process管理的memory是独立的，但是因为是同一套程序代码，所有就有process之间竞争资源的事情，比如：当你的Django app指定把log写到一个固定的文件file里时候，那么3个process（并行跑的）就可能会同时去写进去同一个file里，那么log就可能没那么容易读了；再举个例子，那就是数据库的读写，假设你的Django app每次指定只打开一个固定db connection，那么就会跟上面写log去file里一样，会有资源竞争的问题。不过这块呢，Django本身对它所支持的Database都进行了concurrency（严格来讲应该叫**同时并发性**）支持；再举个例子，假设你需要把log写到datadog里，这里就建议你起一个deamon process来跑那个datadog agent，理论是一台物理机器跑一个agent，然后呢你的Django app就假设你所跑的物理机器上有个datadog agent process可以让你调用，这样即使你有3个process同时run你的Django app，那么也对于跟datadog agent process就没有所谓的资源竞争问题了，只要Django记得把自己所在的process_id信息传给datadog agent process，因为是interprocess communication (IPC)嘛，这个process_id信息是一定在的。

>
>后面呢几乎所有的Django的服务都是部署在
>
>


## 小小的历史回忆
> 当年在学Perl的时候(当时在半导体生产厂GlobalFoundries)，那时候接触了一个东西叫做Common Gateway Interface，简称CGI。这个CGI就是能够是Perl的Scripts可以让你的内容和逻辑跟Web联系起来。当时的应用场景是这样的，有个网站能够让用户对他们的生产规则进行克制化，并对一些SPC数据进行可视化，基本上所有人都告诉你有个内部网址提供了这个功能，但是巨慢无比！那时候就听说慢的原因是应为所有的Perl脚本相当于handler，然后CGI会把每个HTTP request都转化成这样一个指令：新启动一个Process，让后这个Process可以run一些Perl的脚步，这些Perl脚本其实就是handlers，基本上是对Response进行内容修改。
>
>