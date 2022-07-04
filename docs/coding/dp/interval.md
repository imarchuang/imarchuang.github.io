# 区间型动规

**区间型动规的特点就是涉及到把问题无限切小，但切小的过程中一直存在左右两个边界，也就是所谓的分阶段的划分问题**。所以说所有的区间型动规问题都是把小的区间最优解一层一层往上roll得到大区间的最优解。既然是区间，那么肯定存在`[i...j]`两个边界，如果将`f(i,j)`定义为区间`[i...j]`的最优解求值函数(e.g., 求最大值)，那么你就可以遵循这个思路在区间`[i...j]`里穷举式枚举**切分点**或者叫**合并点**，那么你就可以得到`f(i,j)=max{f(i,k)+f(k+1, j)+cost}`，这个cost就是将两组区间合并起来的代价，你体会体会，这是不是又是二分分治的精髓？而且我可以负责人的告诉你，面试中遇到的区间型动规题都是**两两合并**的，要是需要合并三个或者以上，那么在面试中就太难了。

区间型的动规题虽然算是难度比较高的，但是这类题的套路却特别常规，这里就来说说它的套路或者模板。至于你是如何快速的锁定一道题是区间型的动规，那就只能考你刷刷刷了。
1. **状态**：这个定义特别标准，就是`dp(i,j)`，它代表的是下标i，j这个区间内所需要的cost，或者分数；
1. **选择**：对区间`[i,j]`进行逼近，比如说下个状态是更小的区间`[i+1, j-1]`，这样就是两个选择；或者穷举k，把区间切割成`[i,k]`和`[k+1, j]`；
1. **状态转化方程**：这里的套路就是对区间`[i,j]`进行逼近，比如说下个状态是更小的区间`[i+1, j-1]`，或者需要切割区间成`[i,k]`和`[k+1, j]`；
1. **base case**：这里基本都是当区间大小变成1时候的值，比如说`[i,i]`也就是`dp[i][i]=1`之类的；所以你可以想象，我们自底而上写法中通常需要**斜着遍历**，这个能体会吗？

对于区间型的动规题，强烈建议使用记忆化搜索的模板解题：
```java
class Solution {
    private Integer[][] memo;
    public int maxCoins(int[] nums) {
        int n = nums.length;
        memo = new Integer[n][n];
        //注意边界的开或闭
        return dp(nums, 0, n-1);
    }
    
    //区间开始用start，区间结尾用end
    private int dp(int[] nums, int start, int end){
        if(start>end) return 0;
        if(memo[start][end]!=null) return memo[start][end];
        
        int max=Integer.MIN_VALUE;
        //遍历开始与结束简单所有可能值，颗粒度通常为1
        for(int k=start; k<=end; k++){
            int left=dp(nums, start, k-1);
            int right=dp(nums, k+1, end);
            //这里的意思是：当戳破了[start, k-1]和[k+1, end]所有气球，与看相邻的就是start和end了
            int cur = get(nums, k)*get(nums, start-1)*get(nums, end+1); 
            max = Math.max(max, left+cur+right);
        }
        
        return memo[start][end] = max;
    }
                                    
    private int get(int[] nums, int i){
        if(i==-1 || i==nums.length) return 1;
        return nums[i];
    }
}
```

> 借着本文希望能体将区间型动规问题扒扒皮，找出共性和解题套路来。按照惯例，直接阶梯性的聊一下这个话题吧。
> 
> 先来最简单地，就是[5 最长回文子串](https://leetcode.com/problems/longest-palindromic-substring/)，这题在双指针的那里讲的很仔细，就是所谓的背向双针来进行所谓的**中心扩散法**，不过这里呢，我想强调一下这题的区间型动规思维。这里呢，二维dp数组的初始化应该很容易吧？你只需要记住**空字符串是回文，当个字符也一定是回文**，那么`"ababd"`的初始化dp数组就是下面这样的：

| (i,j) | a | b | a | b | d |
| -- |:-:| :-:| :-:|:-:| :-:|  
| a  | T | ? | ? | ? | ?
| b  | T | T | ? | ? | ?
| a  | T | T | T | ? | ?
| b  | T | T | T | T | ?
| d  | T | T | T | T | T  
>那么所谓`状态转移方程`呢？很巧妙，就是：`当s.charAt(i)==s.charAt(j)时，dp(i，j)= dp(i+1，j-1)`，否则就一定不是回文串；这样你应该很容易的得出下面这个状态矩阵对吧？

| (i,j) | a | b | a | b | d |
| -- |:-:| :-:| :-:|:-:| :-:|  
| a  | T | F | T | F | F
| b  | T | T | T | F | F
| a  | T | T | T | F | F
| b  | T | T | T | T | F
| d  | T | T | T | T | T 
> 这里的区间思维呢？就是你对区间`[i,j]`进行逼近，当`s.charAt(i)==s.charAt(j)`时，你压缩至`[i+1,j-1]`，直到i==j时就是最小区间了；
>
>说完了子串了，我们进阶一下来个[516 最长回文子序](https://leetcode.com/problems/longest-palindromic-subsequence/)吧。这个在子序类动规那篇帖子里讲的也很细致了，但是这里在强调一下用到的区间型动规思维吧。对于区间`[i,j]`，如果`s.charAt(i)==s.charAt(j)`，这说明这个`s[i]`和`s[j]`一定存在最后的**最长回文子序**里，这时候你就可以压缩区间到`[i+1,j-1]`了，就是说这个区间`[i+1,j-1]`里最长回文子序的长度+2就是区间`[i,j]`最长回文子序的长度。如果不相等呢？那说明存在一下三种情况：
>1. `s[i]`不在最后的回文子序里，这时候就要压缩区间到`[i+1,j]`；
>1. `s[j]`不在最后的回文子序里，这时候就要压缩区间到`[i,j-1]`；
>1. `s[i]`和`s[j]`不在最后的回文子序里，这时候就要压缩区间到`[i+1,j-1]`，不过呢题目要求**最长**回文子序，那就是说这种情况可以忽略的，因为它的结果不可能大过上两种情况；
> 基于这些，我们脑子里应该能闪现以下状态：

| (i,j) |a|b|a|c|b|a|
| -- |:-:| :-:| :-:|:-:| :-:|:-:|  
| a  | 1 | 1 | 3 | 3 | 3 | 5
| b  |   | 1 | 1 | 1 | 3 | 3
| a  |   |   | 1 | 1 | 1 | 3
| c  |   |   |   | 1 | 1 | 1
| b  |   |   |   |   | 1 | 1
| a  |   |   |   |   |   | 1
>
> 以上呢，就展示了区间左右两端缩减的案例，现在我们再来看一些穷举k把区间切割成多组`[i,k]`和`[k+1, j]`的例子；
>
> 来个最经典的吧，也是我最爱的一道题：[312 戳气球](https://leetcode.com/problems/burst-balloons/)，这题也是我们的模板题来着。这题你如果不知道区间性动规的思路，那么暴力穷举应该能想到吧？**我们其实就是像穷举戳气球的顺序**，不同顺序对应不同的分数，我们就是要把所有可能的分数中最高的那个找出来最为答案，对吧？妥妥的一个**全排列**，发咋读肯定是阶乘级别的。那要是你往动规思路上考虑呢？先来说说**状态**吧，无他，就是i和j。i代表区间的左端，j代表区间的右端，有了这个我们爱找题意定义一下`dp(i, j)`函数吧：你戳破了i和j之间的所有气球，最多能得到的分数。反向思考一下，气球i和j之间最后一个被戳破的气球可能是哪个？答案显然是任何一个都有可能，这就有了**选择**，就是假设最后戳破的气球为k，穷举i和j之间的每一个作为k值，这样你是否就可以得到`dp(i,j)=dp(i,k-1)+dp(k+1,j)+points[i]*points[k]*point[j]`? 这就是**状态转移方程**。
>
>
>

### **刷题列表**
1. [5 最长回文子串](https://leetcode.com/problems/longest-palindromic-substring/)
1. [516 最长回文子序](https://leetcode.com/problems/longest-palindromic-subsequence/)
1. [1216 合法回文串III](https://leetcode.com/problems/valid-palindrome-iii/)
1. [312 戳气球](https://leetcode.com/problems/burst-balloons/)
1. [1039. 多边形三角剖分的最低得分](https://leetcode.com/problems/minimum-score-triangulation-of-polygon/)
1. [1547. 切棍子的最小成本](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/)