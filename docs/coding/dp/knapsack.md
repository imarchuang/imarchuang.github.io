# 背包型动规

**背包型动规是动规里最难一眼看出来的一类。背包类问题的解法通常比较直接，但是如何把问题转化成背包问题就挺玄学。真是会得不难，难的不会**

?> 借着本文希望能体将背包型的动规问题扒扒皮，试图找出共性和解题套路。但是实话实话，到目前为止，背包类的问题对我来说还是玄学。

!> **敲黑板1** 背包问题的`状态`就是`背包的容量W`和`可选择的物品w[i]`，与这个些物品对应的，通常会有物品的对应价值v[i]，用这个价值来选择最优解。至于`选择`嘛很直接，就是`装入背包`和`不放人背包`。

!> **敲黑板2** 背包问题通常学要一个二维数组dp[i][j]来记录状态。i维是物品选择，表示前i个物品作为选择；j维是背包容量。物品的个数嘛，颗粒度肯定是1的，所以i维的话就能把物品缩小到1和没有（base case），至于j维嘛，给出的物品选择的重量通常是整数的，所以背包容量也是可以以整数1的颗粒度来进行穷举的。

!> **举个例子**：例1：给你一个物品，重量是2kg，给你一个背包，容量为3kg。这样我们就可以在j维上从0到3递增遍历，与之对应的dp[1]的数值就应该是这样的：`dp[1] = [0kg, 0kg, 2kg, 2kg]`; 

!> **举个例子**：例2：给你3个物品，重量分别是1kg,2kg,3kg，给你一个背包，容量为1kg。这样我们就可以在i维上从0到3递增遍历，**记住是前i个物品，所以3表示从前三个里选最优** 与之对应的dp[...][1]的数值就应该是这样的：`dp[...][1] = [0kg], [1kg], [1kg], [1kg]`; 

> **敲黑板3** 有了以上铺垫，现在来聊聊dp[i][j]的定义，这里定义会根据题目原语义来推，下面是几个常见的例子：
> 1. 能不能用前i个物品将容量j填满？
> 1. 从前i个物品选择，在不超过背包容量的情况下能得到的最大值？
> 1. 从前i个物品选择，将背包填满的选择一共有几种？

![](./pictures/knapsack.jfif)

https://leetcode-cn.com/problems/coin-change/solution/yi-pian-wen-zhang-chi-tou-bei-bao-wen-ti-sq9n/

### **刷题列表**
1. [416 分割等和子集](#分割等和子集)
1. [474] https://leetcode.com/problems/ones-and-zeroes/
1. [494 目标和] https://leetcode.com/problems/target-sum/
1. [518 零钱兑换II](#零钱兑换II)
1. [1049] https://leetcode.com/problems/last-stone-weight-ii/
-----------------------------------------------------------------------------------------------------
[198, 213, 337 打家劫舍i,ii,iii] https://leetcode.com/problems/house-robber/ 

### 分割等和子集
[416 分割等和子集](https://leetcode.com/problems/partition-equal-subset-sum/)

```js
var canPartition = function(nums) {
    let sum = nums.reduce((accum, b)=> accum+b, 0);
    
    if(sum%2!=0) return false;
    
    let target = sum/2;
    
    let dp=[...Array(nums.length+1)].map(x=>Array(target+1));
    
    //base case
    for(let j=0; j<target+1; j++){
        //没有物品可以选择
        dp[0][j] = false; 
    }
    for(let i=0; i<nums.length+1; i++){
        //背包容量为0，已经填满
        dp[i][0] = true; 
    }
    
    //状态转化
    for(let i=1; i<nums.length+1; i++){
        for(let j=1; j<target+1; j++){
            let num = nums[i-1];
            if(num>j){
                //只能选择不放进背包
                dp[i][j] = dp[i-1][j];
                continue;
            }
            
            dp[i][j] = dp[i-1][j] || dp[i-1][j-num];
        }
    }
    
    return dp[nums.length][target]
};
```

### 零钱兑换II
[518 零钱兑换II](https://leetcode.com/problems/coin-change-2/) 

> **思路** 这题呢，两个思考点。
> 1. 当背包容量为0的时候，要初始到选择数量为1，因为这个1代表`啥也不做`，也是一种选择。
> 1. 把第i个物品放入背包，也就是使用这个coins[i]，那么`dp[i][j]=dp[i][j-coins[i-1]]`，这样写同时说明第i个coin可以复用。如果不把第i个物品放入背包，那么`dp[i][j]=dp[i-1][j]`，所以dp[i][j]应该是以上两种情况的和。

```js
var change = function(amount, coins) {
    let m=coins.length;
    //是一个完全背包问题，因为coin可以复用
    let dp = [...Array(m+1)].map(x=>Array(amount+1).fill(0));
    
    //base case
    for(let j=0; j<amount+1; j++){
        //没有物品可以选择，那选择数量就是0
        dp[0][j] = 0;
    }
    for(let i=0; i<m+1; i++){
        //背包容量为0，选择数量就是1，因为可以无为而治
        dp[i][0] = 1;
    }
    
    //状态转化
    for(let i=1; i<m+1; i++){
        for(let j=1; j<amount+1; j++){
            let coin = coins[i-1];
            if(coin>j) {
                //只能选择不放人背包
                dp[i][j] = dp[i-1][j];
                continue;
            }
            
            dp[i][j] = dp[i-1][j]+dp[i][j-coin];
        }
    }
    
    return dp[m][amount];
};
```