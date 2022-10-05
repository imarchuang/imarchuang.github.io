# Python里的Lazinesses

> 个人觉得Python真的是Dynamic的语言，所有好多纯OOD里那些design patterns似乎在Python里就显得不是那么Pythonic，甚至说anti-pattern，因为OOD跟多的像是对一些比较优化的工程实践的一套总结，让人能约定俗成的遵守这些规则。
>
> 但是有一个东西Proxy的pattern在Python的工程实践里确实应用很广，主要是这个Proxy pattern可以是Python本身跑的慢的缺点在一定程度上得到缓解，这里就讲几种Python里实现lazy loading的比较常用的方式：
>1. 借助Descirptor，让转成Python object的时间延后；
>1. 借助Proxy，让Python的evaluation 延后；
>1. 借助closure，让Python的evaluation 延后；
>1. 借助Generator，让Python的evaluation 延后


### Python descriptor protocol
> 关于Python descriptor protocol，我在[这篇帖子]()里详细陈述过，这里就重点说说怎么让descriptor protocol让你的一些object延后eval。
>
>

```python


```

