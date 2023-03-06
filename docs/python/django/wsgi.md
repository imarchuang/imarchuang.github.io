# 深入理解一下WSGI

> 先来写高屋建瓴的理论，这篇[帖子](https://www.toptal.com/python/pythons-wsgi-server-application-interface)解释的简明扼要:
![](../pictures/django_request_lifecycle.png)
> 


## 小小的历史回忆
> 当年在学Perl的时候(当时在半导体生产厂GlobalFoundries)，那时候接触了一个东西叫做Common Gateway Interface，简称CGI。这个CGI就是能够是Perl的Scripts可以让你的内容和逻辑跟Web联系起来。当时的应用场景是这样的，生成个网站能够让用户对他们的生产规则进行克制化，并对一些SPC数据进行可视化，当时基本上所有人都告诉你有个内部网址提供了这个功能，但是**巨慢无比**！那时候就听说慢的原因是应为所有的Perl脚本相当于handler，然后CGI会把每个HTTP request都转化成这样一个指令：新启动一个Process，让后这个Process可以run一些Perl的脚步，这些Perl脚本其实就是handlers，基本上是对Response进行内容修改。
>
>