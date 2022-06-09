# 股票买卖之动态机

**坐标型动规是动规里最简单的一类。与子序型动规需要看前i的元素[1...i-1]的特征来决定最优值相比，坐标型动规往往在dp[i][j]这个坐标上就能计算出最优子结构的最优值**

?> 借着本文希望能体将子序型的动规问题扒扒皮，找出共性和解题套路来解答坐标型动规题。

!> **敲黑板** 回溯框架没有分治版的，我这里多次提到回溯框架的分治版实际上指的是带返回值的dp函数定义，这种定义写的时候非常像回溯模板，只不过`做选择`的结果会直接传入递归的下一层，所以也就没有必要`撤销选择`了。这些传入递归的下一层参数，自变量参数就是所谓的动规的`状态`，而dp函数本身通过`遍历选择`进行一个`状态转化方程`，这个dp函数的递归出口就是所谓的`base case`。

### **刷题列表**
1. [121. 买卖股票的最佳时间](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
1. [122. 买卖股票的最佳时间II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)
1. [714. 带交易费的买卖股票的最佳时间](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)
1. [309. 带冷冻期的买卖股票的最佳时间](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)
1. [123. 买卖股票的最佳时间III](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/)
1. [188. 买卖股票的最佳时间IV](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/)

> **思路** 如果你不知道所谓的状态机，这题是easy的，你只需要遍历每一个price，然后和之前已知的最小价格比较就好了，下面就是这种思路的写法。这种写法的关键就是在遍历过程中维护一个local minimal，`min= Math.min(min, price);`。
>
1. [121. Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

```js
var maxProfit = function(prices) {
    let res = 0, min = Number.MAX_VALUE;
    
    for(const price of prices){
        min= Math.min(min, price);
        res = Math.max(res, price-min);
    }
    return res;
};
```
> **思路** 以上的解法显然不是通用的，通用的解法其实是叫做状态机的东西。
>
> 假设股票的价格是这样的`prices = [7,11,1,5,3,6,4]`；我用1表示持有股票，0表示不持有股票；
> 1. 假设在第`-1`天，也就是说股市还没开始，那么不持有股票的状态应该是这样的`dp[-1][0]=0`，这个很容易理解吧？股市没开始，手上不持有任何股票，**利润肯定为零**。
> 1. 那么在第`-1`天（股市还没开始）持有股票的利润是多少呢？理论上这个状况是不可能出现的，但是为了方便计算，我们应该赋一个值：`dp[-1][1]=-infinity`,因为要求最大利润吗，所以当股市没开始时有股票的不可能情况就赋一个最小值吧：**利润为负无穷**。
> 1. 时间来到第`0`天，也就是说股市开始的第一天，那么今天不持有股票的状态应该是这样的`dp[0][0]=max(昨天就不持有dp[-1][0]，昨天持有今天卖dp[-1][1]+prices[i])`；类似的，今天持有股票的状态应该是这样的`dp[0][1]=max(昨天就不持有dp[-1][1]，昨天不持有今天买dp[-1][0]-prices[i])`；所以在股市开始的第一天，dp的最佳状态是这样的：`dp[0][0]=max(0, -infinity+prices[0])=0`, `dp[0][1]=max(-infinity, 0-prices[0])=-7`；
> 1. 你感受到了吗？我们需要**穷举**每一天持有和不持有股票的最佳状态，至于选择，每天其实只有两种选择：啥都不做或者`买入OR卖出（这个要看手里持不持有股票）`。
>
> 你大脑里能否展现出如下迭代结果：`[[0, -INF], [0,-7],[4,-7],[4,-1],[4,-1],[4,-1],[5,-1],[5,-1]]`，答案就是dp[n-1][0]，aka最后一天不持有股票，所以答案是5；今天的最佳状态，至于昨天的最佳状态相关；
>
```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int[][] dp = new int[n][2];
        
        for(int i=0; i<n; i++){
            if(i==0){
                dp[i][0] = 0;
                // 根据状态转移方程可得：
                //   dp[i][0] 
                // = max(dp[-1][0], dp[-1][1] + prices[i])
                // = max(0, -infinity + prices[i]) = 0

                dp[i][1] = -prices[i];
                // 根据状态转移方程可得：
                //   dp[i][1] 
                // = max(dp[-1][1], dp[-1][0] - prices[i])
                // = max(-infinity, 0 - prices[i]) 
                // = -prices[i]
                continue;
            }
            
            dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]);
            dp[i][1] = Math.max(dp[i-1][1], -prices[i]);
            
        }
        return dp[n - 1][0];
    }
}
```