# 坐标型动规

**坐标型动规是动规里最简单的一类。与子序型动规需要看前i的元素[0...i-1]的特征和前i-1个已经计算出来的子问题最优值来决定最优值相比，坐标型动规往往在dp[i][j]这个坐标上就只看常数个的其他已知最优值就能计算出当前子问题的最优值**

?> 借着本文希望能体将坐标型的动规问题扒扒皮，找出共性和解题套路来解答坐标型动规题。

!> **敲黑板** 。

### **刷题列表**
1. [931 下降路径最小和](#下降路径最小和)
1. [64 最小路径和](#最小路径和)
1. [174 地下城游戏](#地下城游戏)
1. [62 不同的路径](#不同的路径) 
1. [63 不同的路径II](#不同的路径II)
1. [980 不同的路径III](#不同的路径III)
1. [679. 领扣不同的路径III](#领扣不同的路径III)
1. [221 最大正方形](#最大正方形)

### 下降路径最小和
[931 下降路径最小和](https://leetcode.com/problems/minimum-falling-path-sum/)

### 最小路径和
[64 最小路径和](https://leetcode.com/problems/minimum-path-sum/)

### 地下城游戏
[174 地下城游戏](https://leetcode.com/problems/dungeon-game/)

### 不同的路径
[62 不同的路径](https://leetcode.com/problems/unique-paths/)

### 不同的路径II
[63 不同的路径II](https://leetcode.com/problems/unique-paths-ii/)

### 不同的路径III
[980 不同的路径III](https://leetcode.com/problems/unique-paths-iii/) --这个没什么好解法，就用回溯

### 领扣不同的路径III
[679. 领扣不同的路径III](https://www.lintcode.com/problem/679/)

### 最大正方形
[221. 最大正方形](https://leetcode.com/problems/maximal-square/)