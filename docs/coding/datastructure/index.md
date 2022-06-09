# 数据结构题，不是数据结构设计

**这章主要是讲几个技巧类的数据结构** 

**数据结构考点**
>1. 数据结构的考点主要就是怎么巧妙地善用HashMap/HashSet以及Heap/PriorityQueue来巧妙地用空间换时间。延伸一下的话可以考你怎么善用Trie或者UnionFind等数据结构来解一些题，比如说最小生成树MST类。
>1. 对于单调栈和单调队列的题，属于较难的，所以会分出来独立讲解。
>1. 本篇着重于用HashMap/HashSet以及Heap/PriorityQueue的技巧，当然也会扩展到LinkedHashMap以及TreeMap的巧用。

>刷题列表：
>1. [380. O(1) 时间插入、删除和获取随机元素](#获取随机元素) https://leetcode.cn/problems/insert-delete-getrandom-o1/
>1. [710. 黑名单中的随机数](#黑名单中的随机数) https://leetcode.cn/problems/random-pick-with-blacklist/
>1. [528. 按权重随机选择](#按权重随机选择) https://leetcode.cn/problems/random-pick-with-weight/
>1. [领扣642. 数据流滑动窗口平均值](#数据流滑动窗口平均值) https://www.lintcode.com/problem/642/
>1. [387. 字符串中的第一个唯一字符](#字符串中的第一个唯一字符) https://leetcode.cn/problems/first-unique-character-in-a-string/
>1. [973. 最接近原点的K个点](#最接近原点的K个点) https://leetcode.cn/problems/k-closest-points-to-origin/
>1. [347. 前K个高频元素](#前K个高频元素) https://leetcode.cn/problems/top-k-frequent-elements/
>1. [23. 合并K个升序链表](#合并K个升序链表) https://leetcode.cn/problems/merge-k-sorted-lists/
>1. [264. 丑数II](#丑数II) https://leetcode.cn/problems/ugly-number-ii/
>1. [146. LRU缓存](#LRU缓存) https://leetcode.cn/problems/lru-cache/
>1. [460. LFU缓存](#LFU缓存) https://leetcode.cn/problems/lfu-cache/
