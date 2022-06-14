# 坐标型动规

>**坐标型动规是动规里最简单的一类。与子序型动规需要看前i的元素[0...i-1]的特征和前i-1个已经计算出来的子问题最优值来决定最优值相比(或者相加)，坐标型动规往往在`dp[i][j]`这个坐标上就只看常数个的其他已知最优值就能计算出当前子问题的最优值，最经典例子就是杨辉三角，只取决于两个其他的状态**
>
>序列型动规在是说在前i的元素[0...i]里，第i个位置一定选的答案，比如说LIS最长子序列，前面的位置/元素是可以跳过的，所以才叫subsequence子序列嘛，而坐标型是不可以跳跃的，必须一步一步走。
>
>很多坐标型动规题是给一个起点找终点的类型，这种题的思路既可以按照start到target的思路，一步一步解，但可以逆向思考，按照从target到start的思路一步一步解题。
>
> 借鉴这篇[帖子](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns)，里面提到了一种类型的动规题，叫`到达目的地的最小、最大路径`，其实说的就是这类典型的坐标型动规题。
>
> 题目大多数长什么样子？**Given a target find minimum (maximum) `cost/path/sum` to reach the target**.
>
> 解法说起来也十分暴力穷举：**Choose minimum(maximum) path among all possible paths before the current state, then add value for the current state.** Psudocode大概长这样子：`routes[i] = min(routes[i-1], routes[i-2], ... , routes[i-k]) + cost[i]`.

> 当然我们所谓的坐标型动规并不一定让你找路径，换个问法比如说最大正方形啊，最大面积啊之类的，其实用的也是坐标型动规的思路。这个思路的关键就是说，当前的state可以根据上一个或者上两个的state来决定，而且求解每个state时候不能跳跃。
>
>
>
-----------------------------------------------------------------------------------------------

### **刷题列表**
1. [62 不同的路径](#不同的路径) 
1. [63 不同的路径II](#不同的路径II)
1. [980 不同的路径III](#不同的路径III)
1. [679. 领扣不同的路径III](#领扣不同的路径III)
1. [64 最小路径和](#最小路径和)
1. [120. 三角形最小路径和](#三角形最小路径和) https://leetcode.com/problems/triangle/
1. [931 下降路径最小和](#下降路径最小和)
1. [1289 下降路径最小和II](#下降路径最小和) https://leetcode.cn/problems/minimum-falling-path-sum-ii/
1. [174 地下城游戏](#地下城游戏)
-----------------------------------------------------------------------------------------------
1. [221 最大正方形](#最大正方形)
1. [79. 领扣最长公共子串](#最长公共子串)
1. [221. 最大正方形](https://leetcode.com/problems/maximal-square/)
1. [1277. 统计全为1的正方形子矩阵](https://leetcode.com/problems/count-square-submatrices-with-all-ones)
-----------------------------------------------------------------------------------------------

### 不同的路径
1. [62 不同的路径](https://leetcode.com/problems/unique-paths/) 
```java
class Solution {
    //暴力版
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];

        Arrays.fill(dp[0],1);
        for(int i=0; i<m; i++)
            dp[i][0]=1;

        for(int i=1; i<m; i++)
            for(int j=1; j<n; j++)
                dp[i][j]=dp[i-1][j]+dp[i][j-1];

        return dp[m-1][n-1];
    }
}
```
```java
class Solution {
    //压缩空间至O(n）版
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];

        Arrays.fill(dp,1);

        for(int i=1; i<m; i++)
            for(int j=1; j<n; j++)
                dp[j]=dp[j-1]+dp[j];

        return dp[n-1];
    }
}
```

1. [63 不同的路径II](#不同的路径II)
```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        //暴力版
        int m=obstacleGrid.length, n=obstacleGrid[0].length;
        int[][] dp = new int[m][n];
        for(int j=0; j<n; j++){
            if(obstacleGrid[0][j]==1) break;
            dp[0][j]=1;
        }
        for(int i=0; i<m; i++){
            if(obstacleGrid[i][0]==1) break;
            dp[i][0]=1;
        }

        for(int i=1; i<m; i++)
            for(int j=1; j<n; j++){
                if(obstacleGrid[i][j]==1){
                    dp[i][j]=0;
                    continue;
                }
                dp[i][j]=dp[i-1][j]+dp[i][j-1];
            }

        return dp[m-1][n-1];

    }
}
```
```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        //压缩空间至O(n）版
        int m=obstacleGrid.length, n=obstacleGrid[0].length;
        int[] dp = new int[n];
        for(int j=0; j<n; j++){
            if(obstacleGrid[0][j]==1) break;
            dp[j]=1;
        }
        int lineBreak = Integer.MAX_VALUE;
        for(int i=0; i<m; i++){
            if(obstacleGrid[i][0]==1) {
                lineBreak=i;
                break;
            }
        }

        for(int i=1; i<m; i++){
            dp[0] = i>=lineBreak?0:1;
            for(int j=1; j<n; j++){
                if(obstacleGrid[i][j]==1){
                    dp[j]=0;
                    continue;
                }
                dp[j]=dp[j-1]+dp[j];
            }
        }

        return dp[n-1];

    }
}
```

[64. Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/)

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
```java
public class Solution {
    /**
     * @param a: A string
     * @param b: A string
     * @return: the length of the longest common substring.
     */
    public int longestCommonSubstring(String a, String b) {
        // write your code here
        int m=a.length(), n=b.length();
        int[][] dp = new int[m+1][n+1];

        int res = 0;
        for(int i=1; i<m+1; i++){
            for(int j=1; j<n+1; j++){
                if(a.charAt(i-1)==b.charAt(j-1)){
                    dp[i][j] = dp[i-1][j-1]+1;
                    res = Math.max(res, dp[i][j]);
                } else {
                    dp[i][j] = 0;
                }
            }
        }

        return res;
    }

}
```