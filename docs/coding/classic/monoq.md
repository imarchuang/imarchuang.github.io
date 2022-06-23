# 单调栈问题
>先BB两句，单调栈解决了什么问题呢？其实单调栈是一种`巧妙`的算法让你能在O(n)的时间复杂度里处理一类很特别的`**子序列类**`的问题，而暴力的解这种问题通常是要O(n^2)复杂度的。所以算是`奇淫异巧`的东东，不过呢，这类问题实际中是常存在的，所以单调栈又有一定的`通用性`。话说到这儿，你从纯数学上思考，如果能找到让一些集合从单调有序（递增或者递减）的方式，你的问题理论上就已经是线性的了，肯定比一些复杂的多项式级别的问题要容易解多了，你说对吗？你回忆一下，让你的一些东西单调了，你是不是甚至可以apply二分法思维了？还记得二分答案类的题吗？
>
> 就像很多其他`奇淫异巧`，当你能利用**有序**这个东西上做点文章的时候，说明你对算法应该算是高手了。除了有序，算法上有些时候需要你对**去重**也要掌握一些`奇淫异巧`，理论上说有重复的元素了，数学上通常称之为不完美集合了，当时实际应用中这个**去重**的技巧还是很重要的。

**单调栈三步走**
1. 维护一个递增或者递减的stack；
1. 遍历原数组，正着遍历还是倒着遍历也根据递减还是递增的情况，已经求得是最大值还是最小值，如果stack非空，就比较当前元素值和栈顶元素值，根据维持的是递增还是递减单调栈，来判定要不要pop出栈顶元素；
1. 把当前元素push进栈；

> 每次面试遇到了，似乎才能真正理解某类型题的原理。今天(**2022-06-16**)Uber的面试中真的出现了单调栈的问题，才发现理解确实不够深入啊。首先值得肯定的一点是，给出问题后，我很快的想到了是个单调栈的问题，然后却在给解法的过程中磕磕巴巴的。主要问题在两个地方，一是没有及时的思考正着遍历还是倒着遍历；二是对单调栈里现存state和结果之间的关系没有很快地把握到真谛。
>
> 1. 说起第一个问题，正着遍历还是倒着遍历，这里我的建议是先考虑一下倒着遍历，然后再分别思考是升序递增还是降序递减，两个思路都过一下脑子；
> 1. 第二个问题，因为要根据题的原意来具体分析，这里我觉得可以用这个思考框架：
>       * 单调栈里存什么值？是输入数组的元素值还是元素位置？还是两个都需要（不常见）？
>       * 在维持这个单调栈的过程中，也就是需不需要pop弹栈操作，要在这个操作之前和这个操作之后对目前单调栈的状态进行一些记录？还是在pop弹栈的过程中需要做处理？
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
1. [496. 下一个更大元素I](#下一个更大元素I)
1. [503. 下一个更大元素II](下一个更大元素II)
1. [1019. 链表中的下一个更大元素](https://leetcode.com/problems/remove-duplicate-letters/)
1. [739. 每日温度](#每日温度)
-------------------------------------------------------------------------------------------------------
1. [316. 去重重复字母](#去重重复字母)
1. [1081. 无重字符的最短子序列](#无重字符的最短子序列)
1. [402. 移除K个数码](#移除K个数码)
1. [Uber真题 - 能看到的人头个数II](#能看到的人头个数II)
-------------------------------------------------------------------------------------------------------
1. [领扣126. 最大树](最大树)
1. [42. 接雨水](#接雨水)
1. [11. 盛最多水的容器](#盛最多水的容器) - 不能用单调栈解题
1. [84. 柱状图中最大的矩形](#柱状图中最大的矩形)
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
> **思路** 字符串去重能多难？就直接用hashmap或者trie呗；但是这个lexicographical order还真是把人难住了，单单hashmap不好使啊，这个就是子序类问题的一个特性，单单通过一个hashmap去cache一些state是不够的，因为hashmap本身是无序的，子序类问题都需要搞清楚元素之间的前后关系，所以这时候除了暴力算法之外，你很可能要去子序类动规类型上思考，但是呢，这里有几道题，不通过动归类来维护状态，而是通过一个简单地单调栈，外加元素的出现次数来解答。看到lexi order了，你应该直到是子序列需要保持原序的问题，直接去单调栈上想吧。解法请看这里[](./coding/classic/strings?id=去重重复字母)
>

### 无重字符的最短子序列
[1081. 无重字符的最短子序列](https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/)
```java
class Solution {
    public String smallestSubsequence(String s) {
        //纯纯的子序列，纯纯的单调栈
        Deque<Character> stack = new ArrayDeque<>();
        
        boolean[] visited = new boolean[26];
        int[] occurances = new int[26];
        for(char c : s.toCharArray()){
            //occurances[c-'a'] += 1;
            occurances[c-'a']++;
            //System.out.println(occurances[c-'a']);
        }
        
        for(char c : s.toCharArray()){
            occurances[c-'a']--;
            if(visited[c-'a']) continue;
            visited[c-'a'] = true;
            //char top = stack.peekLast();
            while(!stack.isEmpty() && c<stack.peekLast() && occurances[stack.peekLast()-'a']>0){
                char top = stack.pollLast();
                visited[top-'a'] = false;
            }
            
            stack.offerLast(c);
        }
        
        return stack.stream().map(String::valueOf).collect(Collectors.joining(""));
    }
}
```

### 移除K个数码
[402. 移除K个数码](https://leetcode.com/problems/remove-k-digits/)
```java
class Solution {
    public String removeKdigits(String num, int k) {
        Deque<Character> stack = new ArrayDeque<>();
        
        for(char c : num.toCharArray()){
            while(!stack.isEmpty() && c<stack.peekLast() && k-- >0){
                stack.pollLast();
            }
            
            stack.addLast(c);
        }
        
        while(k-- >0){
            stack.pollLast();
        }
        
        StringBuilder sb = new StringBuilder();
        boolean flag=true;
        for(Character c : stack){
            if(c=='0' && flag) continue;
            else flag=false;
            
            sb.append(c);
        }
        
        return sb.length()==0?"0":sb.toString();
    }
}
```

### 最大树
[领扣126. 最大树](https://www.lintcode.com/problem/126/)
> **思路** 这题呢，如果你不能一眼想到单调栈解法，用O(n^2)的思路把暴力解讲给面试官听是必须要的。暴力解法就是每次用O(n)的时间去找数组的最大值，然后根据最大值得位置将数组一切为二，然后递归的方式去将左半部分变成左子树，右半部分变成右子树。这个暴力解法也很符合我们在二叉树里讲到的：构建二叉树的核心在于考虑怎样构建根节点，这种思维叫做自上而下(也就是先建根，再建左右子树)；二叉树的构建其实还有一种思路，那就是自底而上，意思就是先建节点，然后后去找这些节点的父节点；这自底而上的思路需要回答一下两个问题：
> 1. 你最需要知道的是这个节点的父节点是谁对吧？
> 1. 假设你知道了父节点是谁，你还得知道你是那个父节点的左儿子还是右儿子对吧？
>
> **先建节点，然后后去找这些节点的父节点**这种思路，通常会需要到单调栈这类的技巧。这题和接下来几道题的思路很类似，接雨水啊，柱状图的最大面积啊之类的，所以我要花比较长的篇幅在这里仔细讲一讲。
>
> 举个例子将比较丰满：假设给出一个数组`[2, 5, 6, 0, 3, 1]`，现在你从左往右的在脑子遍历这个数组：第1个元素，就直接创建值为2的树节点；到达第2个元素，也是直接创建值为5的树节点，这时候呢，你来回头看2那个树节点，因为5是作为比2大的右边第一个值，所以5应该是2的父节点，而且5的左儿子是2（因为5在2之后出现的）。进行到第3个元素，直接创建值为6的树节点，跟上次类似，6作为5右边比5大的第一个值，6应该是5的父节点，而且6的左儿子是5（因为6在5之后出现的）；
>
> 这时候呢，我们来到了第4个元素，也就是0。直接创建值为0的树节点，但是呢，这次你并不能直接找到比0大的右边第一个节点了对吧？这种情况就跟遍历第1各元素2的时候类似；既然目前还暂时找不到父节点，那就先放一边吧；我们来到了第5个元素3，这也算是个“转折点”。元素3比0大，但是你并不能像之前那样就直接说3是0的父节点，因为这时候0的左右两边都有比自己大的值。这时候的逻辑是这样的，0的父节点是左右两边第一个0大的值即`[6,3]`里比较小的，比如比较小的是右边的值， 那0就是它的左儿子；如果比较小的是左边的值，那么0就是它的右儿子；
>
> 最后提一下这题要用一个特殊值在最后将剩余的栈里元素pop出来。
>
> 还是惯性思维的走一下单调栈的思维框架吧：
> 1. 正着遍历还是倒着遍历？说实话正着倒着无所谓，反转都是要比较左右两边第一个比自己大的值取其小；不过我建议正着遍历，要不容易掉进坑里；
> 1. 递增还是递减？这个很直观对吧，肯定是递减，因为你想做的是借助这个单调栈找到**左右两边第一个比自己大的值**，还是**矮个起开**的方式，但是起开的元素要做额外处理：要找他的左右两边比自己大的值。
> 1. 存坐标还是村数值？存数值吧；
> 1. 弹栈之前算结果还是弹栈之后算结果？这个是弹栈过程中算结果；

```java
public class Solution {
    /**
     * @param a: Given an integer array with no duplicates.
     * @return: The root of max tree.
     */
    public TreeNode maxTree(int[] a) {
        // 1. 需要找到每个节点左右两边比自己大的第一个元素，比较两个节点的值
        if(a.length<=0) return null;
        Stack<TreeNode> stack = new Stack<>();
        for(int i=0; i<=a.length; i++){
          int val = i==a.length ? Integer.MAX_VALUE : a[i];
          
          TreeNode cur = new TreeNode(val);
          while(!stack.isEmpty() && val > stack.peek().val){
            TreeNode top = stack.pop();
            //左右比较
            if(stack.isEmpty()) cur.left = top;
            else {
              if(stack.peek().val > cur.val) cur.left = top;
              else stack.peek().right = top;
            }
          }
          stack.push(cur);
          //System.out.println(val);
        }
        return stack.pop().left;
    }
}
```

### 接雨水
[42. 接雨水](https://leetcode.com/problems/trapping-rain-water/)
> **思路** 这题呢，和上题的思路基本一致，都是要找左右两边的比自己大的第一个元素。应该说这题稍微更简单一点，因为不用处理最后剩在栈里的那些元素。深入的解释请参照上题，这里呢还是惯性思维的走一下单调栈的思维框架吧：
> 1. 正着遍历还是倒着遍历？说实话正着倒着无所谓，反转都是要比较左右两边第一个比自己大的值取其小；不过我建议正着遍历，要不容易掉进坑里；
> 1. 递增还是递减？这个很直观对吧，肯定是递减，因为你想做的是借助这个单调栈找到**左右两边第一个比自己大的值**，这样就是说还在栈里的元素，说明还没找到右边（假设从左往右遍历）比自己大的那个第一元素，能理解吧？在处理**矮个起开**的过程中，说明这个**起开**的元素已经找到右边比自己大的第一个元素了，这时候就要看看它左边有没有比它大的第一个元素了，怎么找？就是看看自己pop**起开**完事了之后栈里还有没有其他元素，有则peek()，无则说明自己左边没有比自己高的。
> 1. 存坐标还是村数值？存左边吧，因为需要坐标算宽度；要不要存数值呢？可以存，为了计算高度方便；不过不存也行，可以直接用坐标回去找数值；
> 1. 弹栈之前算结果还是弹栈之后算结果？这个是弹栈过程中算结果；
```java
//version1：只存坐标
class Solution {
    public int trap(int[] height) {
        //单调栈version
        Deque<Integer> stack = new ArrayDeque<>();
        int res = 0;
        for(int i=0; i<height.length; i++){
            int val = height[i];
            while(!stack.isEmpty() && val>height[stack.peekLast()]){
                int top = stack.pollLast();
                if(!stack.isEmpty()) {
                    //比较左右计算宽度
                    int left = stack.peekLast();
                    int w = i-left-1;
                    int h = Math.min(height[left], val)-height[top];
                    res += h*w;
                    //System.out.println(val+"|"+left[0]+"|"+top[0]+"|"+res);
                }
            }
            stack.addLast(i);
        }
        
        return res;
    }
}
//version2：存坐标也存值
class Solution {
    public int trap(int[] height) {
        //单调栈version
        Deque<int[]> stack = new ArrayDeque<>();
        int res = 0;
        for(int i=0; i<height.length; i++){
            int val = height[i];
            while(!stack.isEmpty() && val>stack.peekLast()[0]){
                int[] top = stack.pollLast();
                if(!stack.isEmpty()) {
                    //比较左右计算宽度
                    int[] left = stack.peekLast();
                    int w = i-left[1]-1;
                    int h = Math.min(left[0], val)-top[0];
                    res += h*w;
                    //System.out.println(val+"|"+left[0]+"|"+top[0]+"|"+res);
                }
            }
            stack.addLast(new int[]{val, i});
        }
        
        return res;
    }
}
```
### 盛最多水的容器
[11. 盛最多水的容器](https://leetcode.com/problems/container-with-most-water/)
> **思路** 这题呢和上一题长得非常非常像，最大的区别就是这题每根柱子都没有宽度了，所以能装的水体积取决于两根立柱的距离。你是不是觉得这题也能用单调栈解决了？但其实你仔细脑遍历一下就发现用单调栈是无法以O(n)复杂度解决的。这里详解一下！假设输入是`[1,8,6,2,5,4,8,3,7]`，当你从左往右遍历的时候，你需要找的目标是啥？是不是像上题那样左右两边第一个比自己大的值呢？答案是否定的，其实它所要找的是离自己**越远越大**的才好，这里容易理解吧。那怎么才叫**越远越大**呢？你时候你思考一下，比如说上边序列当你遍历到第4个元素2时候，你回头往左看，你还需要在乎第3个元素6吗？6比8小，而且确定8比6远，是不是就不再care这个6了？所以单调栈的接发的话，你需要维护一个递增单调栈，这样你就可以在遍历每个第i个元素时候，只需要和栈里的相应元素找最大乘积就好了。这里说一下，这个解法时间复杂度是O(n^2)的，worst case就是当给你的输入就是一个递增序列的时候，所以leetcode肯定是TLE的。

```java
class Solution {
    public int maxArea(int[] height) {
        Deque<Integer> stack = new ArrayDeque<>();
        int res = 0;
        for(int i=0; i<height.length; i++){
            if(!stack.isEmpty()){
                for(int s : stack){
                    res = Math.max(res, (i-s)*Math.min(height[s], height[i]));
                }
            }
            
            if(stack.isEmpty() || height[i]>height[stack.peekLast()])
                stack.push(i);
        }
        
        return res;
    }
}
```
> **思路** 这题最优解法实际上是利用双指针思维。直接看代码吧：
```java
class Solution {
    public int maxArea(int[] height) {
        int left=0, right=height.length-1;
        int res = 0;
        while(left<right){
            res = Math.max(res, (right-left)*Math.min(height[left], height[right]));
            if(height[left]<height[right])
                left++;
            else
                right--;
        }
        
        return res;
    }
}
```

### 柱状图中最大的矩形
[84. 柱状图中最大的矩形](https://leetcode.com/problems/largest-rectangle-in-histogram/) 
> **思路** 这题我是故意放到这才解析的，因为经过上两道题[42. 接雨水](#接雨水)和[11. 盛最多水的容器](#盛最多水的容器)，你是不是觉得这题似乎更像[11. 盛最多水的容器](#盛最多水的容器)？所以不能用单调栈以O(n)的复杂度解出来？答案是不对的，因为这题隐含的条件就是每个柱子都是有宽度的，而且宽度不多不少正好是1，所以这题不像[11. 盛最多水的容器](#盛最多水的容器)那题。那是不是就是说说像[42. 接雨水](#接雨水)这题呢？答案也是否定的，因为这题不需要找每个元素左右两边比自己大的第一个元素对吧？都不像，还能用单调栈解吗？答案是可以的。这题的核心思维就是木桶原理，总是最低的那块板子决定桶的装水量。还有种核心思维就是要理解**LocalMaxima局部峰值**的意义，你怎么辨认出峰值的坐标？思路就是你维持一个递增单调栈，然后当你遇到一个**拐点**（也就是说第i个元素的值小于栈里最后也是最大元素的值）时，你就能确认栈里的最后也是最大元素就是一个**LocalMaxima局部峰值**。然后你要将这些个**LocalMaxima局部峰值**一个一个的pop出来，然后处理计算最大面积，直到你遇到栈空了或者栈里最大元素比第i各元素还小了，那就将第i个元素压栈。不是说核心思维就是**木桶原理**嘛，怎么没看到木桶原理的用处啊？莫急，听我说说这个思维的应用。假设给你输入数组`[2,1,5,6,2,3]`，当你从左往右遍历到第2个元素(值为1)时，你还有必要维护第1一个元素2的state吗？答案是NO，因为之后的每个元素算最大面积的时候，如果需要算到第1坐标（元素值为2），那么那个所求面积的高一定是被第2位值为1的元素限制了，所以这时你其实不必再记录第1位上值为2的那个**LocalMaxima局部峰值**了，你只需要记录值为1的元素的坐标就好了，这就是单调栈是递增的，而且记录的是元素的坐标。
>
> 最后呢，还是惯性思维的走一下单调栈的思维框架吧：
> 1. 正着遍历还是倒着遍历？说实话正着倒着无所谓，反转都是要比较左右两边第一个比自己大的值取其小；不过我建议正着遍历，比较容易算宽度；
> 1. 递增还是递减？这个很直观对吧，肯定是递增，因为你想做的是借助这个单调栈找到**LocalMaxima局部峰值**，一定发现**拐点**了，就要在压入第i个元素前吧比它大的栈内的元素全当做**LocalMaxima局部峰值**给pop并处理掉。
> 1. 存坐标还是村数值？存坐标；
> 1. 弹栈之前算结果还是弹栈之后算结果？这个是弹栈过程中算结果；而且计算过程跟这个要压入栈的第i个元素没什么毛线关系。
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
>   **思路** 这题[上题](#柱状图中最大的矩形)的套娃。
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

