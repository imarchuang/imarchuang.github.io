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

[这篇帖子](https://leetcode-cn.com/problems/coin-change/solution/yi-pian-wen-zhang-chi-tou-bei-bao-wen-ti-sq9n/)很好的总结了背包类问题的套路。

### **刷题列表**
1. [416 分割等和子集](#分割等和子集)
1. [474 一和零](#一和零) 
1. [494 目标和](#目标和]) 
1. [518 零钱兑换II](#零钱兑换II)
1. [1049 最后一块石头的重量II](#最后一块石头的重量II)

-----------------------------------------------------------------------------------------------------
### **打家劫舍类
!> **敲黑板4** 打家劫舍类不算背包问题，但背后的思路很相似。打家劫舍问题其实也是子集类问题，所以吧都算是聪明的穷举子集问题，只不过打家劫舍类是`有限制的子集`，所以有点像是在0/1背包问题是加了限制条件的感觉。

1. [198 打家劫舍i](#打家劫舍I) https://leetcode.com/problems/house-robber/ 
1. [213 打家劫舍ii](#打家劫舍II) (https://leetcode.com/problems/house-robber-ii/)
1. [337 打家劫舍iii](#打家劫舍III) (https://leetcode.com/problems/house-robber-iii/)

### 分割等和子集
[416 分割等和子集](https://leetcode.com/problems/partition-equal-subset-sum/)

> **思路** 这题的重点就是将题转化为背包问题。子集问题，通过刷题发现，极有可能是个背包问题。这题说可否分成两个子集使之和相等，换一种说法就是能不能找到一个子集成为总和的一半，那就穷举呗，暴力解法就是每种子集都穷举一遍，看有没有一种子集的和为总和一半。但是一种更聪明的穷举办法就是用背包问题思想，看看前i个物品能否装满容量为j的背包。这时候，选择就变成了装进背包和不装进背包的经典问题。

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
### 一和零
[474 一和零](https://leetcode.com/problems/ones-and-zeroes/) 

> **思路** 又是子集问题啊，子集的穷举能否聪明的穷举？很容易想到背包问题。这题呢，只不过是背包的限制不只是一个重量，而是`两个重量`，无他，那就`两个重量状态`呗。`dp[i][j][k]`表示用前i个物品，能凑出最多j个1和k个0的子集可含有的物品量是多少。

```js
var findMaxForm = function(strs, m, n) {
    let l = strs.length;
    let dp = [...Array(l+1)].map(x=> [...Array(m+1)].map(y=>Array(n+1).fill(0)));
    
    //dp[0][0][0] = 0;
    
    for(let i=0; i<l+1; i++){
        let ones, zeros;
        if(i>0) [ones, zeros] = getOnesNZeros(strs[i-1]);
        for(let j=0; j<m+1; j++){
            for(let k=0; k<n+1; k++){
                if(i==0){
                    dp[i][j][k] = 0;
                    continue;
                }
                
                if(ones>k || zeros>j) {
                    //只能不放入背包
                    dp[i][j][k] = dp[i-1][j][k];
                    continue;
                }
                
                dp[i][j][k] = Math.max(
                    dp[i-1][j-zeros][k-ones]+1, //放入背包
                    dp[i-1][j][k] //不放入背包
                );
            }
        }
    }
    
    return dp[l][m][n];
    
};

const getOnesNZeros = (str) => {
    let ones=0, zeros=0;
    for(const c of str){
        if(c=='1') ones++;
        if(c=='0') zeros++;
    }
    
    return [ones, zeros];
        
}
```

### 目标和
[494 目标和](https://leetcode.com/problems/target-sum/)

> **思路** 这题的记忆化搜索的解法可以refer[`这里`](./coding/memo/index?id=目标和)。这里呢主要讲讲把它转化成背包问题的思路。假设nums数组可以分成两个子集A和B，分别代表分配 `+` 的数和分配`-`的数，那么他们和target存在如下关系：
```
sum(A) - sum(B) = target
sum(A) = target + sum(B)
sum(A) + sum(A) = target + sum(B) + sum(A)
2*sum(A) = target + sum(nums)
```
> 综上，可以推出`sum(A) = (target + sum(nums)) / 2`，也就是把原问题转化成：nums 中存在几个子集 A，使得 A 中元素的和为 `(target + sum(nums)) / 2`？
>
> 这题的另一个难点在于j要从0开始遍历，并不能单纯的认为当背包容量为0时候，base case值为1（啥都不装就是一种方法），因为题中并没有说明物品的重量不能为0，所以当物品的重量可以为0时候，0也是一种选择。

```js
var findTargetSumWays = function(nums, target) {
    /*
    假设nums可以被分为两个组A和B，
    分别代表分配 `+` 的数和分配`-`的数，
    那么这题可以转化为
    sum(A) - sum(B) = target
    ==> sum(A) + sum(A) -sum(B) = sum(A) + target
    ==> 2*sum(A) = sum(A) + target + sum(B)
    ==> 2*sum(A) = target + sum(A&B==>nums)
    所以这题就转化为一个背包问题，看看能不能从nums选择元素凑数和为 (target + sum(nums))/2的组合
    */
    let sum = nums.reduce((accum, b)=> accum+b, 0);
    
    if(sum < Math.abs(target) || (sum+target)%2!=0) return 0;

    return subsets(nums, (sum + target) / 2);
    
};

/* 计算 nums 中有几个子集的和为 sum */
const subsets = (nums, sum) => {
    let n = nums.length;
    //明确dp定义
    let dp=[...Array(n+1)].map(x=>Array(sum+1).fill(0));
    // base case
    dp[0][0] = 1;
    
    for (let i = 1; i <= n; i++) {
        //注意这题的j要从0开始遍历
        for (let j = 0; j <= sum; j++) {
            if (j >= nums[i-1]) {
                // 两种选择的结果之和
                dp[i][j] = dp[i-1][j] + dp[i-1][j-nums[i-1]];
            } else {
                // 背包的空间不足，只能选择不装物品 i
                dp[i][j] = dp[i-1][j];
            }
        }
    }
    return dp[n][sum];
}
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
### 最后一块石头的重量II
[1049 最后一块石头的重量II](https://leetcode.com/problems/last-stone-weight-ii/) 

> **思路** 这道题看出是背包问题比较有难度。
> 1. 最后一块石头的重量：从一堆石头中,每次拿两块重量分别为x,y的石头,若x=y,则两块石头均粉碎;若x<y,两块石头变为一块重量为y-x的石头求最后剩下石头的最小重量(若没有剩下返回0)
> 1. 问题转化为：把一堆石头分成两堆,求两堆石头重量差最小值;
>      * 数学书咋证明这是对的呢？
> 1. 进一步分析：要让差值小,两堆石头的重量都要接近sum/2;我们假设两堆分别为A,B,A<sum/2,B>sum/2,若A更接近sum/2,B也相应更接近sum/2;
> 1. 进一步转化：将一堆stone放进最大容量为sum/2的背包,求放进去的石头的最大重量MaxWeight,最终答案即为sum-2*MaxWeight;

```js
var lastStoneWeightII = function(stones) {
    let m = stones.length;
    let sum = stones.reduce((accum, b) => accum+b, 0);
    
    let target = Math.floor(sum/2);
    
    let dp = [...Array(m+1)].map(x=>Array(target+1).fill(0));
    
    for(let i=0; i<m+1; i++){
        for(let j=0; j<target+1; j++){
            if(i==0 || j==0){
                dp[i][j]=0;
                continue;
            }
            
            if(stones[i-1]>j){
                //只能选择不放人背包
                dp[i][j] = dp[i-1][j];
                continue;
            }
            
            dp[i][j] = Math.max(dp[i-1][j], dp[i-1][j-stones[i-1]]+stones[i-1]);
        }
    }
    
    return sum - 2*dp[m][target];
};
```
### 打家劫舍I
[198 打家劫舍i](https://leetcode.com/problems/house-robber/)

```js
var rob = function(nums) {
    let n = nums.length;
    let dp = Array(n+1);
    
    dp[0] = 0;
    dp[1] = nums[0];
    
    for(let i=2; i<n+1; i++){
        //这里进行选与不选的较量
        //很像背包问题的装入背包和不装入背包
        dp[i] = Math.max(dp[i-1], dp[i-2]+nums[i-1]);
    }
    
    return Math.max(...dp);
};
```