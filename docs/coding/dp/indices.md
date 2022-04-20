# 坐标型动规

**坐标型动规是动规里最简单的一类。与子序型动规需要看前i的元素[0...i-1]的特征和前i-1个已经计算出来的子问题最优值来决定最优值相比，坐标型动规往往在dp[i][j]这个坐标上就只看常数个的其他已知最优值就能计算出当前子问题的最优值**

?> 借着本文希望能体将坐标型的动规问题扒扒皮，找出共性和解题套路来解答坐标型动规题。

!> **敲黑板** 

### **刷题列表**
1. [931 下降路径最小和](#下降路径最小和)
1. [64 最小路径和](#最小路径和)
1. [174 地下城游戏](#地下城游戏)
1. [62 不同的路径](#不同的路径) 
1. [63 不同的路径II](#不同的路径II)
1. [980 不同的路径III](#不同的路径III)
1. [679. 领扣不同的路径III](#领扣不同的路径III)
1. [221 最大正方形](#最大正方形)
1. [79. 领扣最长公共子串](#最长公共子串)

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

### 最长公共子串
[79. 领扣最长公共子串](https://www.lintcode.com/problem/79/)

> **思路** 这题核心是个数学归纳法。跟[最长递增子序](./coding/dp/subsequence?id=#最长递增子序)那题里用到数学归纳法很类似，另外这题有个兄弟题[最长公共子序](./coding/dp/subsequence?id=#最长公共子序)也有异曲同工之妙。首先`子串`嘛，肯定是连续的相邻字母的问题，所以与子集（或者不回头的子序列）问题有很大区别，某种意义上说，是更简单版本的子集问题。解决子串问题吧，就要谨记连续这个词，所以整着遍历字符串，看看以这个数结尾的子串最长公共子序是多少是多少？这是不是就好找多了？所以思路变得很简单，如果`s1[i]==s2[j]`，那就看dp[i-1][j-1]的值，直接是`dp[i][j] = 1+dp[i-1][j-1];`，因为前一个字母结尾的最长公共子串再加1才是当前的最长公共子串。同理，如果`s1[i]!=s2[j]`，那就`dp[i][j] = 0`。

```js
export class Solution {
  /**
   * @param A: A string
   * @param B: A string
   * @return: the length of the longest common substring.
   */
  longestCommonSubstring(A, B) {
    // write your code here
    //这题好dp啊
    let m = A.length, n=B.length;
    let dp = [...Array(m+1)].map(x=> Array(n+1).fill(0));

    //base case
    //一个子串长度为0时候，公共子串肯定是0

    for(let i=1; i<m+1; i++){
      for(let j=1; j<n+1; j++){
        if(A[i-1]==B[j-1]){
          dp[i][j] = 1 + dp[i-1][j-1];
        }
        else {
          dp[i][j] = 0;
        }
      }
    }

    let res = 0;
    for(let i=0; i<m+1; i++){
      for(let j=0; j<n+1; j++){
        res = Math.max(res, dp[i][j]);
      }
    }

    return res;

  }
}
```