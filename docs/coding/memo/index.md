# 记忆化搜索 --> 就是动规
##### **先BB两句**.
**记忆化搜索就是动规。从本质上讲，这两个是完全一个东西，都是对最优子结构问题处理方式。记忆化搜索是自顶而下的一种思维，而传统的动态规划则是一种自底向上的思维方式。记忆化搜索的思维似乎看着不是那么玄乎，但是据我个人经验，不是每道题都能将记忆化搜索转化成自底向上的动规思维，尤其是题中的起点或者终点不容易确定的时候，或者子问题的个数不能提前确定的时候**

借着本文希望能体现记忆化搜索高大上的地方。

#### **刷题列表**
1. [494. 目标和（中等）](#目标和) https://leetcode.com/problems/target-sum/
1. [514. 自由之路（困难）](#自由之路) https://leetcode.com/problems/freedom-trail/
1. [787. K站中转内最便宜的航班（中等）](#K站中转内最便宜的航班) https://leetcode.com/problems/cheapest-flights-within-k-stops/
1. [10. 正则表达式匹配（困难）](#正则表达式匹配) https://leetcode.com/problems/regular-expression-matching/
1. [44. 通配符匹配（困难）](#通配符匹配) https://leetcode.com/problems/wildcard-matching/
1. [651. 四键键盘（中等）](#四键键盘) https://leetcode.com/problems/4-keys-keyboard/

