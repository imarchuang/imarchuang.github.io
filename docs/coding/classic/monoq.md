# 单调栈问题
>先BB两句，单调栈解决了什么问题呢？其实单调栈是一种`巧妙`的算法让你能在O(n)的时间复杂度里处理一类很特别的`**子序列类**`的问题，而暴力的解这种问题通常是要O(n^2)复杂度的。所以算是`奇淫异巧`的东东，不过呢，这类问题实际中是常存在的，所以单调栈又有一定的`通用性`。话说到这儿，你从纯数学上思考，如果能找到让一些集合从单调有序（递增或者递减）的方式，你的问题理论上就已经是线性的了，肯定比一些复杂的多项式级别的问题要容易解多了，你说对吗？你回忆一下，让你的一些东西单调了，你是不是甚至可以apply二分法思维了？还记得二分答案类的题吗？

**单调栈三步走**
1. 维护一个递增或者递减的stack；
1. 遍历原数组，正着遍历还是倒着遍历也根据递减还是递增的情况，已经求得是最大值还是最小值，如果stack非空，就比较当前元素值和栈顶元素值，根据维持的是递增还是递减单调栈，来判定要不要pop出栈顶元素；
1. 把当前元素push进栈；

> 每次面试遇到了，似乎才能真正理解某类型题的原理。今天(**2022-06-16**)Uber的面试中真的出现了单调栈的问题，才发现理解确实不够深入啊。首先值得肯定的一点是，给出问题后，我很快的想到了是个单调栈的问题，然后却在给解法的过程中磕磕巴巴的。主要问题在两个地方，一是没有及时的思考正着遍历还是倒着遍历；二是对单调栈里现存state和结果之间的关系没有很快地把握到真谛。
>
> 1. 说起第一个问题，正着遍历还是倒着遍历，这里我的建议是先考虑一下倒着遍历，然后再分别思考是升序递增还是降序递减，两个思路都过一下脑子；
> 1. 第二个问题，因为要根据题的原意来具体分析，这里我觉得可以用这个思考框架：
>       * 单调栈里存什么值？是输入数组的元素值还是元素位置？还是两个都需要（不常见）？
>       * 在维持这个单调栈的过程中，也就是需不需要pop弹栈操作，要在这个操作之前和这个操作之后对目前单调栈的状态进行一些记录？
>       * pop弹栈操作完成了，要不要根据栈是否为空来做一些特殊处理？
>       * 当输入数组元素遍历完了，而且栈里还有状态，这是要判读是否需要用一个特殊值将栈里的剩余元素pop弹栈以清空？

**单调栈应用模板**
```java
int[] getNextElement(int[] nums){
    int n = nums.length;
    // 存放答案的数组
    int[] res = new int[n];
    // 单调栈；面试的时候可以跟面试官提一下建议用ArrayDeque因为Stack毕竟已经被deprecate了
    Stack<Integer> s = new Stack<>();

    //倒着遍历
    for(int i=n-1; i>=0; i--){
        // 判定个子高矮
        while (!s.isEmpty() && s.peek() <= nums[i]) {
            // 矮个起开，反正也被挡着了。。。
            s.pop();
        }
        // nums[i] 身后的 next great number
        res[i] = s.isEmpty() ? -1 : s.peek();
        s.push(nums[i]);
    }
    return res;
}
``` 
![](./pictures/monoq1.jpeg)

### 刷题列表
1. [Uber真题 - 能看到的人头个数](#能看到的人头个数)
1. [496. 下一个更大元素I](https://leetcode.com/problems/remove-duplicate-letters/)
1. [503. 下一个更大元素II](https://leetcode.com/problems/remove-duplicate-letters/)
1. [1019. 链表中的下一个更大元素](https://leetcode.com/problems/remove-duplicate-letters/)
1. [739. 每日温度](#每日温度)
1. [316. 去重重复字母](https://leetcode.com/problems/remove-duplicate-letters/)
1. [1081. 无重字符的最短子序列](#无重字符的最短子序列)
1. [402. 移除K个数码](https://leetcode.com/problems/remove-duplicate-letters/)
1. [42. 接雨水](https://leetcode.com/problems/remove-duplicate-letters/)
1. [84. 柱状图中最大的矩形](https://leetcode.com/problems/remove-duplicate-letters/)
1. [85. 最大矩形](#最大矩形)
-------------------------------------------------------------------------------------------------------

### 能看到的人头个数
题目：Given a grid G of numbers representing heights of persons standing.
- A person p1 can see another person p2 in the grid if the height of everyone in between is shorter than p2
- A person can see to the right and down
Return a grid A where `A[x][y]` is the sum of all the persons seen from `G[x][y]`

举个例子：
```js
var input = [[9, 6, 8, 8, 11],
            [1, 5, 3, 7, 9]
            [2, 1, 4, 6, 1]];

//Output
[[5, 3, 4, 2, 1],
[4, 4, 3, 2, 1],
[3, 2, 1, 1, 0]];
```
> **思路** 这题呢，看到了就直接暴力解法的话，总的时间复杂度是在O(m^2*n^2)的。现在我们先借着第一行`[9, 6, 8, 8, 11]`套用一下单调栈思路模板试试：
> 1. 先看看是正着遍历还是倒着遍历？正着遍历的话，如果我们站在9的位置上往右看，能看到`[6,8,11]`这个子序，看起来递增子序这个思路是没错的，当时如果正着遍历的话，假设输入序列是`[9, 6, 8, 8, 1,2,3,11]`的话，你在9这个位子的时候依然只能看到`[6,8,11]`这个子序，而这时候已经失去了1,2,3这三个元素的visibility对吧？这样比较难算出这三个元素的相应值。
> 1. 递增单调栈是正确的思路，但是正着遍历却有问题，你会你会失去一些元素的visibility，那就试试倒着遍历吧。当站在11这个位置的时候，他能看到几个元素？0个嘛，因为它是最后一个，那站在3上呢能看到啥？1个嘛，就是11。站在2上呢？能看到3,11... 这个‘看到几个’元素可以怎么算？如果我们用**矮个起开**的思路去维护这个单调递增栈，那下个元素能看到的元素个数是不是就是当前栈里的元素个数？
>
> 这题里，最后要注意最好是不要创建额外数组，就在原矩阵里遍历好了
```java
import java.io.*;
import java.util.*;
import java.util.stream.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

class Solution {
    
    
    private int[][] getNumberOfSeen(int[][] matrix){
        int m=matrix.length, n= matrix[0].length;
        int[][] res = new int[m][n];
        
        for(int i=0; i<m; i++){
            int[] rowRes = helper(matrix[i]);
            for(int j=0; j<n; j++){
                res[i][j] += rowRes[j];
            }
        }
        
        for(int j=0; j<n; j++){
            //form the collumn
            int[] col = new int[m];
            for(int i=0; i<m; i++){
                col[i]=matrix[i][j];
            }
            int[] colRes = helper(col);
            for(int i=0; i<m; i++){
                res[i][j] += colRes[i];
            }
            
        }
        
        return res;
        
    }
    
    private int[] helper(int[] arr){
        Stack<Integer> stack = new Stack<>();
        int n = arr.length;
        int[] res = new int[n];
        for(int i=n-1; i>=0; i--){
            res[i] = stack.size();
            while(!stack.isEmpty() && arr[i]>=stack.peek()){
                stack.pop();
            }
            stack.push(arr[i]);
        }
        
        return res;
    }
    
    public static void main(String[] args) {
        int[][] testInput = {{9, 6, 8, 8, 11}
                            ,{1, 5, 3, 7, 9},
                            {2, 1, 4, 6, 1}};
           
        Solution sol = new Solution();                 
        int[][] testRes = sol.getNumberOfSeen(testInput);
        for(int i=0; i<testRes.length; i++){
            System.out.println(Arrays.stream(testRes[i]).mapToObj(Integer::toString).collect(Collectors.joining(",")));
        }
    }
}
```
**优化版本**
```java
import java.io.*;
import java.util.*;
import java.util.stream.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

class Solution {
    
    private int[][] input, res;
    private int M=0, N=0;
    private int[][] getNumberOfSeen(int[][] matrix){
        M=matrix.length;
        N=matrix[0].length;
        input=matrix;
        res = new int[M][N];
        
        for(int i=0; i<M; i++){
            helper(i, true);
        }
        
        for(int j=0; j<N; j++){
            helper(j, false);
        }
        
        return res;
        
    }
    
    private void helper(int cord, boolean isRow){
        Stack<Integer> stack = new Stack<>();

        int n=0;
        if(isRow) n=this.N;
        else n = this.M;
        
        for(int i=n-1; i>=0; i--){
            System.out.println(i+"|"+cord);
            if(isRow) res[cord][i] += stack.size();
            else res[i][cord] += stack.size();
            
            int elem = isRow?input[cord][i]:input[i][cord];
            while(!stack.isEmpty() && elem>=stack.peek()){
                stack.pop();
            }
            stack.push(elem);
        }
    
    }
    
    public static void main(String[] args) {
        int[][] testInput = {{9, 6, 8, 8, 11}
                            ,{1, 5, 3, 7, 9},
                            {2, 1, 4, 6, 1}};
           
        Solution sol = new Solution();                 
        int[][] testRes = sol.getNumberOfSeen(testInput);
        for(int i=0; i<testRes.length; i++){
            System.out.println(Arrays.stream(testRes[i]).mapToObj(Integer::toString).collect(Collectors.joining(",")));
        }
    }
}
```

### 下一个更大元素I
[496. 下一个更大元素I](https://leetcode.com/problems/next-greater-element-i/) 
> **思路** 直接看下一个题吧。

### 下一个更大元素II
[503. 下一个更大元素II](https://leetcode.com/problems/next-greater-element-ii/)
> **思路** 最经典的单调栈题了，但是这里还是惯性思维的走一下我的思维框架吧：
> 1. 正着遍历还是倒着遍历？这个很容易理解，因为你需要找到下以个比当前第i个元素大的，所以倒着遍历才合理，这样你就等于先**预知**了未来；
> 1. 递增还是递减？这个很直观对吧，因为上面提到你通过栈预知了未来，假设你身后的元素是这样的`[5,3,2,8,11]`，那么你还会对5和8之间的那俩个矮个元素感兴趣吗？答案是不需要，因为只要你比5高，那比5矮的元素肯定不会比你高，所以应该维持**递减单调栈**，用**矮个起开**的方式维持栈内顺序。
> 1. 存坐标还是村数值？存数值吧，因为让你求的是比你大的下一个数值；
> 1. 弹栈之前算结果还是弹栈之后算结果？这个很直观，一定要弹栈之后算结果，因为只有弹到比当前元素大了才是对应的答案；
>

### 每日温度
[739. 每日温度](https://leetcode.com/problems/daily-temperatures/) 
> **思路** 还是惯性思维的这么思索：
> 1. 正着遍历还是倒着遍历？这个很容易理解，因为你需要找到下个比当前第i天温度高度天次，所以倒着遍历才合理，这样你就等于先**预支**了未来；递增还是递减？递增还是递减这个比较直观，因为你需要找的下个更大的温度天，所以应该维持递减单调栈，用**矮个起开**的方式维持栈内顺序。
> 1. 存坐标还是村数值？存坐标吧，因为让你求的是隔了几天；当然你可以两个都存，不过没什么必要，因为你可以很容易用坐标找到相应数值；
> 1. 弹栈之前算结果还是弹栈之后算结果？这个很直观，一定要弹栈之后算结果，因为只有弹到比当前元素大了才是对应的答案；
>
```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        
        int[] res = new int[n];
        Stack<int[]> s = new Stack<>();

        for(int i=n-1; i>=0; i--){
            int temperature = temperatures[i];
            
            while(!s.isEmpty() && s.peek()[0]<=temperature){
                s.pop();
            }
            
            int nextHigher = s.isEmpty()? 0 : s.peek()[1]-i;
            res[i] = nextHigher;
            s.push(new int[]{temperature,i});
        }
        
        return res;
    }
}
``` 

### 去重重复字母
[316. 去重重复字母](https://leetcode.com/problems/remove-duplicate-letters/)
> **思路** 字符串去重能多难？就直接用hashmap或者trie呗；但是这个lexicographical order还真是把人难住了，单单hashmap不好使啊。子序列需要保持原序嘛，看到lexi order直接去单调栈上想吧。解法请看这里[](./coding/classic/strings?id=去重重复字母)
>

### 无重字符的最短子序列
[1081. 无重字符的最短子序列](https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/)

### 柱状图中最大的矩形
[84. 柱状图中最大的矩形](https://leetcode.com/problems/largest-rectangle-in-histogram/) 
>   **思路** 简单来说就是要维护一个递增的单调栈。还有一个技巧就是最后要用一个最小值clear单调栈里剩余的元素。
>
```java
class Solution {
    
    private int largestArea = 0;
    public int largestRectangleArea(int[] heights) {
        //单调栈
        Stack<Integer> s = new Stack<>();
        
        for(int i=0; i<=heights.length; i++){
            int height = i==heights.length?0:heights[i];
            while(!s.isEmpty() && heights[s.peek()]>height){
                int h = heights[s.pop()];
                int w = s.isEmpty()?i:i-s.peek()-1;
                largestArea = Math.max(largestArea, h*w);
            }
            
            s.push(i);
        }
        
        return largestArea;
    }
}
```

### 最大矩形
[85. 最大矩形](https://leetcode.com/problems/maximal-rectangle/) 
>   **思路** 这题是子序动规里经典的问题了(LCS)。一共4种情况吧，情况1：如果`s1[i]==s2[j]`，说明此字符一定存在于公共子序中，所以就直接递归到下一层`1+dp(s1, i+1, s2, j+1);`。情况2：s1[i]不在最长公共子序中；情况3：s2[j]不在最长公共子序中；情况4：s1[i]和s2[j]都不在最长公共子序中；因为是求最长公共子序嘛，所以情况4已经被情况2和情况3涵盖了，所以当`s1[i]!=s2[j]`时，我们要取最优`Math.max(dp(s1, i+1, s2, j),dp(s1, i, s2, j+1));`。这题的详解可以[看这里](./coding/dp/sebusequence?id=最长公共子序列)。
>
```java
class Solution {
    
    private int largestArea = 0;
    public int maximalRectangle(char[][] matrix) {
        //加个皮
        int n = matrix.length, m = matrix[0].length;
        for(int i=0; i<n; i++){
            //form a new heights array
            int[] heights = new int[m];
            for(int j=0; j<m; j++){
                if(matrix[i][j]=='0'){
                    heights[j]=0;
                } else {
                    int height = 1;
                    for(int k=i-1; k>=0; k--){
                        if(matrix[k][j]=='0') break;
                            
                        height++;
                    }
                    heights[j]=height;
                }
            }
            largestRectangleArea(heights);
        }
        
        return largestArea;
    }
    
    private int largestRectangleArea(int[] heights) {
        //单调栈
        Stack<Integer> s = new Stack<>();
        
        for(int i=0; i<=heights.length; i++){
            int height = i==heights.length?-1:heights[i];
            while(!s.isEmpty() && heights[s.peek()]>height){
                int h = heights[s.pop()];
                int w = s.isEmpty()?i:i-s.peek()-1;
                largestArea = Math.max(largestArea, h*w);
            }
            
            s.push(i);
        }
        
        return largestArea;
    }
}
```

