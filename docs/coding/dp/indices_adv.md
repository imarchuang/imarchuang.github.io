# 非典型坐标型动规

>之前说过坐标型动规是动规里最简单的一类，是因为坐标型动规每一步都存在最优子结构的最优解，而且最优解通常**存于之前有限个状态值**。
>
> 1. 比如说第62题在一个矩阵里找路径总数，这个思路很直接，就是根据它的左边的单元格`grid[i][j-1]`和上边的单元格`grid[i-1][j]`确定到达当前单元格`grid[i][j]`的路径总和。然后遍历的步骤也一是非常规律的按每行一个一个单元格的走，所以你想想stepSize其实是每个单元格；
> 1. 再比如说第66题在一个矩阵里找到达右下角的最短路径和，这个思路也很直接，就是根据它的左边的单元格`grid[i][j-1]`的最短路径和和上边的单元格`grid[i-1][j]`的最短路径和，取其小并加上当前单元格`grid[i][j]`的值来确定当前最短路径和。遍历的步骤嘛，就是按每行一个一个单元格的走，所以stepSize其实是每个单元格；至于按照start到target的思路，还是逆向思考按照从target到start的思路，都是以单元格为stepSize一步一步解题。
> 1. 再看看第1289题在一个矩阵里找最小的下降路径和II，这个思路也很直接，也是一行一行的遍历，可以上往下也可以从下往上，只要保证每行选择的最小最近和是不同列的即可。所以stepSize也其实是每个单元格；
>
> **小结** 在矩阵里找东西，基本上都是按照一个单元格一个单元格走的。
>
> 那么我们看看什么情况下，这个stepSize不是那么直接的例子。

-----------------------------------------------------------------------------------------------

### **刷题列表**
1. [139 单词拆分](#单词拆分) https://leetcode.com/problems/word-break/
1. [983. 最低票价](#最低票价) 
-----------------------------------------------------------------------------------------------

### 单词拆分
[139 单词拆分](https://leetcode.com/problems/unique-paths/) 
```java

```
```java

```

### 最低票价
[983. 最低票价](https://leetcode.com/problems/minimum-cost-for-tickets/)
```java
public int mincostTickets(int[] days, int[] costs) {
    int end = days[days.length-1];
    int[] dp = new int[end+1];
    Set<Integer> daysSet = new HashSet<>(Arrays.stream(days).boxed().toList());

    for(int i=1; i<end+1; i++){
        if(daysSet.contains(i)){
            int minValue = dp[i-1]+costs[0];
            int weeklyCost = i>=7?dp[i-7]:0;
            minValue = Math.min(minValue, weeklyCost+costs[1]);
            int monthlyCost = i>=30?dp[i-30]:0;
            minValue = Math.min(minValue, monthlyCost+costs[2]);
            dp[i] = minValue;
            //System.out.println(dp[i]);
        }
        else {
            dp[i] = dp[i-1];
        }
    }

    return dp[end];
}
```
```java

```