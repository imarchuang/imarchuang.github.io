# 深扒一下子集的问题

#### **敲黑板** 关于子集的思考
> 子集问题贯穿所有题型，从纯粹找所有子集，到子序列问题，再到子串问题，其实根源上都是子集问题。可以这么理解，子序列问题是子集基础上加上`子集里遵循原序`的问题，而子串问题则是子序列问题基础上加上`子集里遵循原序并且元素是连续的`的问题。子串或者子序列，因为其原序的特殊性，因此在其穷举遍历的方法选择上，通常会更具有技巧性，而且通常会涉及到`动规`的一些遍历手法；关于子串问题呢，有时候`滑动窗口`真的也是其最优解。这篇帖子呢，主要就是想借助子集问题，看看这些子集相关的都涉及到那些思路技巧。
>
> 在说说子集问题的bigO的一些常识。纯穷举子集问题，其bigO肯定是O(2^n)；涉及到子序列的时候呢，用动规的遍历技巧通常能达到O(n^2)；再说说涉及到子串问题呢，比如说字符串切割啊之类的，其实本身已经是O(n^2)的复杂度了，在用到一些动规啊或者滑动窗口之类的技巧，其复杂度其实可以缩到O(n)或者O(nlogn)内。
>
> 这篇文章通过`纯子集问题>>子序列问题>>子串问题`的顺序来写，以便日后温习。

#### **敲黑板** 关于子集的实例
> 你思考一下，子集有几种？这里我们先不学究的定义什么是集合，因为严格意义上集合里是不存在重复元素的，但是在刷题的时候，集合里存在重复元素的可能性是很常见的。给你一个集合，比如说[1,2,3]，它的子集通常以几种形式呢？
> 1. 所有的子数组：[], [1], [1,2], [1,2,3], [2], [2,3], [3]，因为子数组一定是连续的元素；
> 1. 所有的子序列/子集：[], [1], [1,2], [1,2,3], [2], [2,3], [3], **[1,3]**，因为子序列是可以不连续的元素组成的；
> 1. 所有的全排列（严格意义上，这不是子集了）：[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,2,1], [3,1,2]，因为子序列是可以不连续的元素组成的；
>
> 这里子序列的问题是个O(2^n)的时间复杂度问题，我们看看用java的话怎么写出来：
```java
//写个数学版本的
public List<List<Integer>> getAllSubSequence(int[] nums) {
    List<List<Integer>> res =  new ArrayList<>();
    int count=1<<nums.length; //eg,如果n=3，那么count = 2^3 = 8
    for(int mark=0; mark<count; mark++) {
        List<Integer> temp = new ArrayList<>();
        for(int i=0; i<nums.length; i++){
            if(((1<<i)&mark)!=0)){ //说明nums里第i位置的元素被选中进子集
                temp.add(nums[i]);
            }
        }
        result.add(temp);
    }

    return temp;
}
```
以上数学解法怎么理解呢？
1. 长度为n的数组一共还有2^n-1个子序列；
1. 我们可以这么理解，子序列就是在原序列上取的，那么原序列被取到的话就是1，否则为0.

例如原序列`[1 2 3]`，子序列是2，那么抽象的结果就是`[0 1 0]`；子序列是 1 3 ，抽象这是`[1 0 1]`；这最大的优点就是可以用二进制来表示，以下表格可以帮助你更好的理解这个做法。假设我们用nums={1,2,3}这里例子: 下面表格的横向栏位可以用`1<<i`来模拟，比如说001就是`1<<0`结果的二进制表示，010就是`1<<1`结果的二进制表示，100就是`1<<2`结果的二进制表示；至于纵向的行数就更容易理解了，其实就是个计数器`[0...n]`的二进制表示。`(1<<i)&mark)!=0`就很容易判断矩阵里坐标位置的nums[i]是否放进集合。


| &计算结果 | 001   | 010    | 100    |
| -------- |:-----:| :-----:| :-----:|
| 000      | 0     | 0      | 0      |
| 001      | 1     | 0      | 0      |
| 010      | 0     | 1      | 0      |
| 011      | 1     | 1      | 0      |
| 100      | 0     | 0      | 1      |
| 101      | 1     | 0      | 1      |
| 110      | 0     | 1      | 0      |
| 111      | 1     | 1      | 1      |

以上解法更侧重数学思维，不过这题其实是个经典的回溯框架应用问题：
```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result=new ArrayList<>();
        List<Integer> path = new ArrayList<>();
        backtrack(path, nums, 0, result);
		return result;
    }
    
    private void backtrack(List<Integer> path, int[] nums, int startIndex, List<List<Integer>> result){
        result.add(new ArrayList<>(path));
        
        for(int i=startIndex; i<nums.length; i++){
            path.add(nums[i]);
            backtrack(path, nums, i+1, result);
            path.remove(path.size()-1);
        }
    }
}
```

> 我们说过了子序、子集问题的时间复杂度其实是O(2^n)，是指数级的。那么有没有一个更快的算法让我们判断某个组合是不是一个集合的子集呢？请看这题[领扣1263. 是子序列吗？](https://www.lintcode.com/problem/1263/)作为例子。
>
> 例如，给出一个字符串`abbacd`，我么能不能快速的判断`aac`是它的子序，而`bdc`不是它的子序呢？思路应该很直接，给出一个`startIndex`，就是看找到某个字符c在这个`startIndex`之后出现的第一个位置
```java
public class Solution {
    /**
     * @param s: the given string s
     * @param t: the given string t
     * @return: check if s is subsequence of t
     */
    public boolean isSubsequence(String s, String t) {
        // Write your code here
        int start = -1;
        for(char c : s.toCharArray()){
            start = isExist(c, t, start);
            if(start==-1) return false;
        }

        return true;
    }

    private int isExist(char c, String t, int startIndex){
        for(int i=startIndex+1; i<t.length();i++){
            if(c == t.charAt(i)){
                return i;
            }
        }

        return -1;
    }
}
```
> 这题的followup也很巧妙：如果输入包含很多`S`串，例如为`[S1, S2, ..., Sk]`，其中`k >= 1B`，你想一个一个判断`T`是否包含这样的子序列。在这样的情形下，你会怎样修改你的代码呢？思路就是用空间换时间。
> 你可以assume字符都是小写，然后呢`abbacd`可以用一下的2D数组的数据结构存储：
```java
//abbacd => 
[
    [ 0, 1, 4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 3, 1, 4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 3, 2, 4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 3,-1, 4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1, 4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
]
```
> 你发现了吗？这个字符串的空间变得很大，但是这时候你可以很容易的这个N x 26的矩阵里判断某个字符串是否是`abbacd`的子序列。比如说`aac`，你可以从前往后遍历`aac`的每个字符，当你处理第一个`a`时，你知道a在`aac`中的位置所以是0，那么你就先去矩阵的第0行找有么有`a以及a的最早出现位置`，-> 你找到了结果是0，那么你知道在遍历下一个字符的时候要从第0行之后的那一行进行搜索；这样的搜索算法的时间复杂度就从指数级变成了O(N)级。

#### **刷题列表**
> 1. [78. 子集(中等)](#子集)
> 1. [77. 组合(中等)](#组合)
> 1. [46. 全排列(中等)](#全排列)
> 1. [90. 子集II(中等)](#子集II)
> 1. [40. 组合总和II(中等)](#组合总和II)
> 1. [47. 全排列II(中等)](#全排列II)

### 子集
[78. 子集(中等)](https://leetcode.com/problems/subsets/)

> **思路** 最经典的子集问题，啥解法？回溯模板呗。这题经典到甚至可以直接**背诵默写**。这种子集/组合的题，虽然是dfs回溯解法，但是先用bfs思维把回溯树画出来。比如说如下
![](./pictures/subset.png)
有了这个嘛，你在算时间复杂度，是不是容易多了？不明白对吧？来看看哈，一层一层的扒皮：
> 1. 先看看手写直接撸的话怎么整。假设S_0是元素个数为0的子集，就是空集。在S_0基础上生成元素个数为1的所有子集S_1，咋整？看下图：
![](./pictures/subset1.png)
> 1. 同理，基于S_1基础上可以生成元素个数为2的所有子集S_2，这里要**注意**，为了避免重复子集，我们通过保证元素之间的相对顺序不变来防止出现重复的子集。看下图：
![](./pictures/subset2.png)
> 1. 这样就可以依次推出S_3,S_4,S_5...，说道这里，交给计算机的话该怎么转化呢？注意这个特性：**如果把根节点作为第 0 层，将每个节点和根节点之间树枝上的元素作为该节点的值，那么第 s 层的所有节点就是size为 s 的所有子集。** 比如说，size为 2 的子集就是这一层节点的值：
![](./pictures/subset3.png)
> 1. 再进一步，如果想计算所有子集，那只要遍历这棵多叉树，把所有节点的值收集起来不就行了？

```js
var subsets = function(nums) {
    let res = [];
    backtrack(nums, [], 0, res);
    return res;
};
//使用 startIndex 参数控制树枝的生长避免产生重复的子集
const backtrack = (nums, path, startIndex, res) => {
    let n = nums.length;
    //if(startIndex > n ) return;
    
    res.push([...path]);
       
    //选择列表
    for(let i = startIndex; i<n; i++){
        path.push(nums[i]);
        backtrack(nums, path, i+1, res);
        path.pop();
    }
}
```

### 组合
[77. 组合(中等)](https://leetcode.com/problems/combinations/)

> **思路** 很经典的子集问题，组合和子集实际上等价的。问题可转化为：给你输入一个数组 nums = [1,2..,n] 和一个正整数 k，请你生成所有size为 k 的子集。比如说，size为 2 的子集就是这一层节点的值：
![](./pictures/subset3.png)
是不是跟子集问题一模一样？注意使用 startIndex 参数控制树枝的生长避免产生重复的子集。

```js
var combine = function(n, k) {
    let res = [];
    backtrack([], 1, n, k, res)
    return res;
};

const backtrack = (path, startIndex, n, k, res) => {
    
    if(path.length ==k) {
        res.push([...path]);
        return;
    }
    
    for(let i=startIndex; i<=n; i++){
        path.push(i);
        backtrack(path, i+1, n, k, res)
        path.pop();
    }
}
```
### 全排列
[46. 全排列(中等)](https://leetcode.com/problems/permutations/)

> **思路** 最经典的排列问题，排列问题本身就是让你穷举元素的位置。组合/子集问题使用 start 变量保证元素 nums[start] 之后只会出现 nums[start+1..] 中的元素，通过固定元素的相对位置保证不出现重复的子集。在排列时候就玩不转了，需要借助额外的used数组来记录某个元素在当前路径中是否已经被用过。
![](./pictures/permu1.png)

```js
var permute = function(nums) {
    
    let res = [];
    let used = Array(nums.length).fill(false);
    
    backtrack([], nums, res, used);
    
    return res;
    
};

const backtrack = (path, nums, res, used) => {
     
    if(path.length==nums.length){
        res.push([...path]);
        return;
    }
    
    for(let i=0; i<nums.length; i++){
        if(used[i]) continue;
        
        path.push(nums[i]);
        used[i] = true;
        backtrack(path, nums, res, used);
        used[i] = false;
        path.pop();
    }
}
```

### 子集II
[90. 子集II(中等)](https://leetcode.com/problems/subsets-ii/)

> **思路** 元素要去重了，二话不说先排序啊。关于子集类（组合类）去重方法，其实方法有好几种，这里呢写出我觉得最好理解的一种。排序完了，重复的元素会堆到一起了，所以只要不是startIndex(新路径起始点)位置的元素，如果和上一个元素同值，那说明这个当前元素不需要再放到组合里了，因为如下图所示之前那个同值元素已经cover这个组合的case了。解法就是在进入下一层递归前，检查`i>startIndex && nums[i]==nums[i-1]`。
![](./pictures/subset4.png)

```js
var subsetsWithDup = function(nums) {
    nums.sort((a,b)=>a-b);
    let res = [];
    backtrack([], nums, 0, res);
    return res;
};

const backtrack = (path, nums, startIndex, res) => {
    
    res.push([...path]);
    
    for(let i=startIndex; i<nums.length; i++){
        if(i>startIndex && nums[i]==nums[i-1]) continue;
        
        path.push(nums[i]);
        backtrack(path, nums, i+1, res);
        path.pop();
    }
    
}
```

### 组合总和II
[40. 组合总和II(中等)](https://leetcode.com/problems/combination-sum-ii/)

> **思路** 元素要去重了，二话不说先排序啊。组合问题和子集问题是等价的，这题可以转化成`计算candidates中所有和为target的子集`。这题的去重方法跟[子集II](#子集II)一模一样。

```js
var combinationSum2 = function(candidates, target) {
    candidates.sort((a,b)=>a-b);
    let res = [];
    backtrack([], candidates, target, 0, res);
    return res;
};

const backtrack = (path, candidates, pathSum, startIndex, res) => {
    let n = candidates.length;
    
    if(pathSum == 0) {
        res.push([...path]);
        return;
    }
    
    for(let i=startIndex; i<n; i++){
        if(candidates[i]>pathSum) break;
        if(i>startIndex && candidates[i]==candidates[i-1]) continue;
        pathSum -= candidates[i];
        path.push(candidates[i]);
        backtrack(path, candidates, pathSum, i+1, res);
        path.pop();
        pathSum += candidates[i];
    }
    
}
```
### 全排列II
[47. 全排列II(中等)](https://leetcode.com/problems/permutations-ii/)

> **思路** 元素要去重了，二话不说先排序啊。答案跟[全排列]()几乎一样，这里重点陈述一下去重部分的逻辑：当出现重复元素时，比如输入 `nums = [1,2,2',2'']`，2' 只有在 2 已经被使用的情况下才会被选择，同理，2'' 只有在 2' 已经被使用的情况下才会被选择，这就保证了`相同元素在排列中的相对位置保证固定`。关键在于`保证相同元素在排列中的相对位置保持不变`。这就是为啥你能看到code里有这个条件检查：`if(i>0 && nums[i]==nums[i-1] && !used[i-1])`。

```js
var permuteUnique = function(nums) {
    nums.sort((a,b)=> a-b);
    let res = [];
    let used = Array(nums.length).fill(false);
    
    backtrack([], nums, res, used)
    return res;
};

const backtrack = (path, nums, res, used) => {
    
    if(path.length == nums.length) {
        res.push([...path]);
        return;
    }
    
    for(let i=0; i<nums.length; i++){
        if(used[i]) continue;
        
        if(i>0 && nums[i]==nums[i-1] && !used[i-1]) continue;
        
        path.push(nums[i]);
        used[i] = true;
        backtrack(path, nums, res, used)
        used[i] = false;
        path.pop();
    }
}
```
