# 博弈类动规

>**博弈类动规从深层意义上来说其实也是子序类的一种，只不过有时候游戏规则里说你可以从前边拿，也可以从尾部拿，导致你的思路可能模糊的觉得这不是子序，但是我个人觉得从头部或者尾部下手的游戏规则你不过是在子序基础上加了点花样**
>
>博弈类动规问题的套路都差不多，下文参考这个印度小哥[YouTube视频](https://www.youtube.com/watch?v=WxpIHvsu1RI)的思路讲解，其核心思路是在`二维dp`的基础上使用元组分别存储两个人的博弈结果。掌握了这个技巧以后，别人再问你什么俩海盗分宝石，俩人拿硬币的问题，你就告诉别人：我懒得想，直接给你写个算法算一下得了。
> 从整体题型上来说，最常见的就是从一头拿，然后拿的规则各种限制；另外一种经典的就是从两头拿，从两头拿的时候通常就没有各种各样的花样规则的限制了。不管是那种题型，你只需要谨记这一点：**你的选择策略不是你当前最多能拿多少，而是想方设法限制对手下一次可取的值最小**。
>
> 最最基础的博弈的动规题的代表就是**硬币排成线**[领扣394. 硬币排成线](https://www.lintcode.com/problem/394/)，就是给你一行硬币，比如说`[X,X,X,X,X,X]`，你每次可以拿一个，也可以拿两个，谁能拿到最后一个谁就能赢，现在两个贼拉聪明的人Alice和Bob开始玩游戏，问你Alice作为先手能否能赢。Leetcode上的[292. Nim游戏](#Nim游戏)也是这个玩意儿，只不过它的游戏规则里说你也可以每次拿三个。为了方便讲解，我们就以最多可以拿俩硬币来解释。你脑子里是否闪现了二叉树？对的，这其实就是个二叉树的分解思路，只不过呢，在每一层都得清楚是先手层还是后手层。先手Alice能否确定能赢（因为Bob也贼拉聪明）是看后手Bob层的两支选择都一定会输，所以状态转化方程就是`dp[i]=!dp[i-1] || !dp[i-2]`。不过呢这题其实是一行代码就能解决的问题，如果你最多能每次拿俩，那就是`return n % 3 != 0;`，如果你每次最多能拿仨，那就是`return n % 4 != 0;`。
>
> 我们稍微加点难度，就是[领扣395. 硬币排成线II](https://www.lintcode.com/problem/395/)，这次不是给你统一面值的硬币了，而你给你不同面值的，比如说`[1, 2, 4]`，你还是可以每次拿一个，也可以拿两个，谁能拿到的面值和大谁就能赢，问你作为先手的Alice是否一定能赢。没错，你脑子里还是应该闪现那个二叉决策树！但是你做决策时候不应该是按照你当前最多能拿多少来决定，而是要以**我拿完了之后让后手能拿到的最少**为决策策略。显然你有两种选择，拿一个或者两个，然后你不管是拿一个还是两个，你的对手(后手)也都会对应的有两个选择，你希望到时候Bob后手能拿到的硬币是面值最少的。Base Case是啥呢？没有硬币的时候，那肯定就是0了，如果只有一枚硬币或者两枚硬币了，那必须就全拿了呀(有点贪心算法的意思)，那还剩3个硬币时候呢？往多了拿，就一定选前两个一块拿。状态转化方程如下：
```java
Math.max(
    Math.min(firstMaxValue(i-2), firstMaxValue(i-3))+values[n-i],
    Math.min(firstMaxValue(i-3), firstMaxValue(i-4))+values[n-i]+values[n-i+1]
);
```
>上边这个写法呢只适用于当给出的硬币面值全是整数的时候，不过Leetcode上的[1406. 石子游戏III](https://leetcode.com/problems/stone-game-iii/)呢，给出的石子堆可能是负数的，以上状态转化方程就不适用了。这时候一个更通用的解法就是`minimax`函数。策略是一样的，你的**最优策略就是让对手下一次可取的值最小**，这个minimax函数长这样：
```java
private int minimax(int stoneValue, int cur, Integer[] memo){
    if(cur==stoneValue.length) return 0;
    if(memo[cur] != null) return memo[cur];

    int res = Integer.MAX_VALUE;
    int score = 0;
    for(int i=cur; i<cur+3 && i<stoneValue.length; i++){
        score += stoneValue[i];
        res = Math.max(res, score- minimax(stoneValue, i+1, memo));
    }

    return memo[cur] = res;
}
```
>
> 我们再加点难度，就是[1025. 除数博弈](https://leetcode.cn/problems/divisor-game/)，这次不是告诉你做的可以跳几凳了，而是说你能跳的距离是有规则限制的，这里的限制就是你只能符合这个规则下跳：`0 < x < n 且 n % x == 0`，x表示你可以跳几步。比如说告诉你还剩`N=3`凳，那么你就只能选一凳，这样就留给后手还剩3-1=2凳，对手也只能选择跳一凳，那就只剩1了，对不起只剩1的时候先手限制就没凳可跳了，就代表Alice输了。base case你应该就一眼就看出来了，就是说谁先到达2谁就能赢，或者说谁先被逼到1谁就输。满足这个条件的`0 < x < n 且 n % x == 0`有多少？脑遍历不好整？那就穷举呗`for(int=1; i<=n/2; i++)`，这里边界条件是说如果`i>n/2`了说明 `n%i`一定不会是0了。在遍历的过程中，如果你发现了`n%i==0`的情况，这时候你还得检查后手的`dp(n-i)`是false才确定先手一定能赢。状态转化方程如下：
```java
for(int i=1; i<=n/2; i++){
    if(n%i==0 && !dp(n-i)){
        canWin = true;
        break;
    }
}
```
> 我们继续加难度，就是[1140. 石子游戏II](https://leetcode.com/problems/stone-game-ii/)，这次是说你能跳的距离是有规则限制的，这里的限制就是你要根据你的对手上次选择的X来决定你这次的选择。题目说了，给你一排的石子堆，比如说`[2,7,9,4,4]`，你可以每次从这些石头堆里去**前X堆**，但是这个X需要满足这个限制`1<=X<=2M`，M最初值是1，当然了这题额外的一个限制就是这个M实在变化的，`M=max(X, M)`，也就是说每次取的数量都可以是前两次的两倍，就是说这个M也是一个状态，所以这次你的memo数组不只要track堆的数量N，还得track这个M，就是上次对手选的数量限制。问你作为先手的Alice最多能拿到多少个石子。这里的思路其实也很直接，就是你取的时候**最优策略就是限制对手下一次可取的值最小**。题中告诉你当剩下的石头不够2*M时，你可以全部一次拿走(因为都是正整数，所以你肯定也是一次全部拿走做最大值)，这里有个小技巧，就是先提前算一个**后缀和**，这样你就可以很快地得到从index往后的数字之和。状态转化方程如下：
```java
for(int i=1; i<=2*M; i++){
    //限制对手下一次可取的值最小
    min = Math.min(min, helper(index+i, Math.max(M, i)))
}
```
> 讨论到这里了，你可能所有难度差不多了，那我们就再看看[1510. 石子游戏IV](https://leetcode.com/problems/stone-game-iv/)，这次是说你能跳的规则限制又有新花样了，它说你只能用正整数的倍数来跳了。比如说给你N堆石子，假设`N=2`的话，这时候你只能拿1堆，一位已有1是1的平方。这里的思路其实也很直接，跟[1025. 除数博弈](https://leetcode.cn/problems/divisor-game/)思路几乎是一模一样的，就是你取的时候**最优策略就是确定让对手输**。状态转化方程如下：
```java
for(int i=1; i<=n; i++)
    for(int k=1; k*k<=i; k++)
        if(!dp[i-k*k]){
            dp[i]=true;
            break;
        }
return dp[n];
```
>
> 以上几道题的博弈规则都是你可以**拿几个有多种选择，其中存在最优解**，是不是跟**跳几凳**有点类似？现在我们看看另一类常考的游戏规则，那就是你可以从**头部或者尾部**进行操作，这种情况下一定需要一个二维的dp数组来处理，第一位是i，代表取头部的状态，第二维为j，代表取尾部的状态。
>
> 我们先来找个最最基础的，[877 石子游戏](https://leetcode.cn/problems/stone-game/)。题目说了，给你一排的石子堆，比如说`[2,7,9,4,4]`，
```java
memo[i][j] = Math.max(
    piles[i] - dp(piles, i+1, j),
    piles[j] - dp(piles, i, j-1)
);
```
> 加点难度，来个最经典的博弈类的题。[486. 预测赢家](https://leetcode.com/problems/predict-the-winner/)，这题是说给你一个数列`[1,5,2]`，然后Alice和Bob轮流那一个元素，可以从**开始或者结尾**去拿，问你Alice最后能否会赢。这题其实可以套上题的模板，因为你可以选头部也可以选尾部嘛，那就直接比较一下选哪个比较好呗。直接上code吧：
```java
class Solution {

    private Integer[][] memo; // memo存的是Alice分数 和 Bob分数的差值
    private int[] nums;
    private int n=0;
    public boolean PredictTheWinner(int[] nums) {
        this.n=nums.length;
        this.nums = nums;
        memo = new Integer[n][n];
        
        return dp(0, n-1) >= 0;
    }
    
    private int dp(int i, int j){
        if(i>j) return 0;
        if(memo[i][j] != null) return memo[i][j];
        
        memo[i][j] = Math.max(nums[i]-dp(i+1, j),
                             nums[j]-dp(i, j-1));
        return memo[i][j];
    }
}
```
> 这里参考这个印度小哥[YouTube视频](https://www.youtube.com/watch?v=WxpIHvsu1RI)的思路讲解，是一种更通用的博弈类的思维方式，一行有时间再仔细讲解TODO. 这里先把代码放这儿：
```java
class Solution {
    /*
    dp[i][j].fir = max(piles[i] + dp[i+1][j].sec, piles[j] + dp[i][j-1].sec)
    dp[i][j].fir = max(     选择最左边的石头堆     ,     选择最右边的石头堆      )
    # 解释：我作为先手，面对 piles[i...j] 时，有两种选择：
    # 要么我选择最左边的那一堆石头，然后面对 piles[i+1...j]
    # 但是此时轮到对方，相当于我变成了后手；
    # 要么我选择最右边的那一堆石头，然后面对 piles[i...j-1]
    # 但是此时轮到对方，相当于我变成了后手。

    if 先手选择左边:
        dp[i][j].sec = dp[i+1][j].fir
    if 先手选择右边:
        dp[i][j].sec = dp[i][j-1].fir
    # 解释：我作为后手，要等先手先选择，有两种情况：
    # 如果先手选择了最左边那堆，给我剩下了 piles[i+1...j]
    # 此时轮到我，我变成了先手；
    # 如果先手选择了最右边那堆，给我剩下了 piles[i...j-1]
    # 此时轮到我，我变成了先手。
    */
    public boolean PredictTheWinner(int[] nums) {
        int n=nums.length;
        int dp[][][] = new int[n][n][2];
        
        for(int i=0; i<n; i++)
            dp[i][i] = new int[]{nums[i], 0};
        
        for(int i=n-2; i>=0; i--)
            for(int j=i+1; j<n; j++){
                int left = dp[i][j-1][1] + nums[j];
                int right = dp[i+1][j][1] + nums[i];
                
                if(left>right){
                   dp[i][j][0] = left;
                   dp[i][j][1] = dp[i][j-1][0];
                } 
                else {
                   dp[i][j][0] = right;
                   dp[i][j][1] = dp[i+1][j][0];
                }
            }
        
        return dp[0][n-1][0]>=dp[0][n-1][1];
    }
}
```
>
>

### 刷题列表
1. [292. Nim游戏](https://leetcode.com/problems/nim-game/)
1. [领扣394 硬币排成线](https://www.lintcode.com/problem/394/)
1. [领扣395 硬币排成线II](https://www.lintcode.com/problem/395/)
1. [1025. 除数博弈](https://leetcode.cn/problems/divisor-game/)
1. [877. 石子游戏](https://leetcode.com/problems/stone-game/)
1. [1140. 石子游戏II](https://leetcode.com/problems/stone-game-ii/)
1. [1406. 石子游戏III](https://leetcode.com/problems/stone-game-iii/)
1. [1510. 石子游戏IV](https://leetcode.com/problems/stone-game-iv/)
-------------------------------------------------------------------------------------
1. [486. 预测赢家](https://leetcode.com/problems/predict-the-winner/)