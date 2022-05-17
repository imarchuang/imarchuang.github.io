# 数组长得像柱状图

### 第一类：双指针
!> **敲黑板** 这里穷举问题多数都是子串切割问题，那么既然是子串（连续性），那算法复杂度就应该是控制在O(n^2)这样子。q这类穷举问题里通常会用到一种递归思想，那就是把一个字符串切割成两段子串：头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么假设头部符合某个条件（比如说头部是一个word），那么基于这个假设成立再证明尾部是正确的就可以了，这样这个问题的思路就很容易转化到递归思维已经证明尾部的问题。
1. [42. 接雨水](#接雨水)
1. [11. 盛最多水的容器](#盛最多水的容器)

### 第二类：单调栈
!> **敲黑板** 这类动规问题里通常会用到一种状态转化思想，那就是答案里不含有s1[i]，或者答案里不含有s2[j]，或者答案里不含有s1[i]和s2[j]，最后一种情况就当`s1[i]==s2[j]`时怎么处理。
>
1. [84. 柱状图中最大的矩形](https://leetcode.com/problems/largest-rectangle-in-histogram/) 
>   **思路** 这题看着就让人懵啊，不过还是按照套路来嘛，又是两个字符串的问题，凭经验也应该快速写出对应的dp函数`dp(s1, i, s2, j)`，然后顺着语义把这个dp函数定义清楚，`dp函数代表s1[0...i]和s2[0...j]之间的最小编辑距离`，然后接下来就是套我们记忆化搜索模板。这题需要**注意**的是，其实选择列表有四个选项，增删替，还有就是啥都不做，当`s1[i]==s2[j]`时，其实啥都不做就是最优的选择。这题的详解可以[看这里](./coding/dp/sebusequence?id=编辑距离)，而且这题的记忆化搜索解法可以[看这里](./coding/memo/index?id=编辑距离)。
>
1. [85. 最大矩形](https://leetcode.com/problems/maximal-rectangle/) 
>   **思路** 这题是子序动规里经典的问题了(LCS)。一共4种情况吧，情况1：如果`s1[i]==s2[j]`，说明此字符一定存在于公共子序中，所以就直接递归到下一层`1+dp(s1, i+1, s2, j+1);`。情况2：s1[i]不在最长公共子序中；情况3：s2[j]不在最长公共子序中；情况4：s1[i]和s2[j]都不在最长公共子序中；因为是求最长公共子序嘛，所以情况4已经被情况2和情况3涵盖了，所以当`s1[i]!=s2[j]`时，我们要取最优`Math.max(dp(s1, i+1, s2, j),dp(s1, i, s2, j+1));`。这题的详解可以[看这里](./coding/dp/sebusequence?id=最长公共子序列)。
>

### 第三类：扫描线
> 这类相关问题请阅读[这篇帖子](./coding/twopointer/sliding)。
