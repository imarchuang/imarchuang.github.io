# 回溯算法，深扒一下子集的问题

### 回溯树的抽象

> 我个人是非常推举暴力穷举算法的，因为我觉得当你一下想不到讨巧的奇淫异巧的时候，你其实可以回到暴力穷举上来，只要你有章可循的暴力穷举，这过程中其实很容易让你发现**剪枝优化**的。
>
> 暴力算法主要有两种，一个叫回溯，一个叫分治。回溯是一种自上而下的思维，重点是抽象出一颗回溯树，然后穷举遍历回溯树的过程中，准确的维护一个 track 需要两个基本操作，入 track，回撤 track (aka, backtrack)。这个过程中，只要你能保证从根节点到当前节点的 track 是准确的，秒杀题应该是问题不大的。
>
> 回溯算法的复杂度有时候不太好计算(主要是剪枝逻辑不是特别容易计算)，但是它的时间复杂度一定至少是指数级别的。
>
> 回溯算法秒 LeetCode 上的几乎所有排列、组合和子集题，主要是这些题除了暴力解法也找不到更好的算法。当然了，像`矩阵内单词查找`、`网格中的最短路径`还有`括号的生产`这几道题也是非常经典的回溯暴力穷举题。这届上模板吧：

```python
def backtrack(路径, 选择列表):
    if 满足结束条件:
        result.add(路径)
        return

    for 选择 in 选择列表:
        # 做合理的剪枝

        做选择
        backtrack(路径, 选择列表)
        撤销选择
```

> 不知道你是否记得，在做[104 二叉树最大深度](https://leetcode.com/problems/maximum-depth-of-binary-tree/)那题的时候，我们说用分治法就是先求左右子树的最大深度，然后后序位置算当前子树的最大深度，但我们也提到我们可以用回溯框架来解题：

```python
class Solution:
  def getMaxDepth(self, root: Optional[TreeNode]) -> int:
    depth = 0
    max_depth = 0
    def backtrack(node):
      nonlocal depth
      nonlocal max_depth
      if not node:
        return 0
      depth += 1 #相当于做选择
      # 下面两行相当于回溯框架里的for循环所有选择
      backtrack(node.left)
      backtrack(node.right)
      # 夹带私货打擂台
      max_depth = max(max_depth, depth)
      depth -= 1 #相当于撤销选择

    backtrack(root)
    return max_depth
```

> 这里主要是想借助二叉树来说明一下回溯框架的精髓操作：入 track(depth++)和回撤 track(depth--)。不过回溯问题的难点通常不在于如何套用这个入出 track 的操作，难点在于怎么通过原题抽象出那个神奇的*回溯树*来。

### **敲黑板** 关于子集的思考

> 先声明一下，因为这部分篇幅太长，我独立开了一篇帖子[子序概论](./coding/classic/subsequence)，请阅读以深入理解何为子序。
>
> 我先说说广义的子集：子集问题贯穿所有题型，从纯粹找`所有子集`，到`子序列`问题，再到`子串/子数组`问题，其实根源上都是子集问题。可以这么理解，子序列问题是子集基础上加上`子集里遵循原序`的问题，而子串问题则是子序列问题基础上加上`子集里遵循原序并且元素是连续的`的问题。子串或者子序列，因为其原序的特殊性，因此在其穷举遍历的方法选择上，通常会更具有技巧性，而且通常会涉及到`动规`的一些遍历手法；关于子串问题呢，有时候**老猛男**`滑动窗口`真的也是其最优解。这篇帖子呢，主要就是想借助子集问题，看看这些子集相关的都涉及到那些思路技巧。
>
> 在说说子集问题的 bigO 的一些常识。纯穷举子集问题，其 bigO 肯定是 O(2^n)；涉及到子序列的时候呢，用动规的遍历技巧通常能达到 O(n^2)；再说说涉及到子串问题呢，比如说字符串切割啊之类的，其实本身已经是 O(n^2)的复杂度了，在用到一些动规啊或者滑动窗口之类的技巧，其复杂度其实可以缩到 O(n)或者 O(nlogn)内。

#### **刷题列表**

> 1. [78. 子集(中等)](#子集)
> 1. [77. 组合(中等)](#组合)
> 1. [46. 全排列(中等)](#全排列)
> 1. [90. 子集 II(中等)](#子集II)
> 1. [40. 组合总和 II(中等)](#组合总和II)
> 1. [47. 全排列 II(中等)](#全排列II)
> 1. [Karat 面试真题 - 矩阵内单词查找](#矩阵内单词查找)
> 1. [领扣 1723 网格中的最短路径](#网格中的最短路径)

### 子集

[78. 子集(中等)](https://leetcode.com/problems/subsets/)

> **思路** 最经典的子集问题，啥解法？回溯模板呗。这题经典到甚至可以直接**背诵默写**。这种子集/组合的题，虽然是 dfs 回溯解法，但是先用 bfs 思维把回溯树画出来。比如说如下
> ![](./pictures/subset.png)
> 有了这个嘛，你在算时间复杂度，是不是容易多了？不明白对吧？来看看哈，一层一层的扒皮：
>
> 1. 先看看手写直接撸的话怎么整。假设 S_0 是元素个数为 0 的子集，就是空集。在 S_0 基础上生成元素个数为 1 的所有子集 S_1，咋整？看下图：
>    ![](./pictures/subset1.png)
> 1. 同理，基于 S_1 基础上可以生成元素个数为 2 的所有子集 S_2，这里要**注意**，为了避免重复子集，我们通过保证元素之间的相对顺序不变来防止出现重复的子集。看下图：
>    ![](./pictures/subset2.png)
> 1. 这样就可以依次推出 S_3,S_4,S_5...，说道这里，交给计算机的话该怎么转化呢？注意这个特性：**如果把根节点作为第 0 层，将每个节点和根节点之间树枝上的元素作为该节点的值，那么第 s 层的所有节点就是 size 为 s 的所有子集。** 比如说，size 为 2 的子集就是这一层节点的值：
>    ![](./pictures/subset3.png)
> 1. 再进一步，如果想计算所有子集，那只要遍历这棵多叉树，把所有节点的值收集起来不就行了？

```js
var subsets = function (nums) {
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
  for (let i = startIndex; i < n; i++) {
    path.push(nums[i]);
    backtrack(nums, path, i + 1, res);
    path.pop();
  }
};
```

### 组合

[77. 组合(中等)](https://leetcode.com/problems/combinations/)

> **思路** 很经典的子集问题，组合和子集实际上等价的。问题可转化为：给你输入一个数组 nums = [1,2..,n] 和一个正整数 k，请你生成所有 size 为 k 的子集。比如说，size 为 2 的子集就是这一层节点的值：
> ![](./pictures/subset3.png)
> 是不是跟子集问题一模一样？注意使用 startIndex 参数控制树枝的生长避免产生重复的子集。

```js
var combine = function (n, k) {
  let res = [];
  backtrack([], 1, n, k, res);
  return res;
};

const backtrack = (path, startIndex, n, k, res) => {
  if (path.length == k) {
    res.push([...path]);
    return;
  }

  for (let i = startIndex; i <= n; i++) {
    path.push(i);
    backtrack(path, i + 1, n, k, res);
    path.pop();
  }
};
```

### 全排列

[46. 全排列(中等)](https://leetcode.com/problems/permutations/)

> **思路** 最经典的排列问题，排列问题本身就是让你穷举元素的位置。组合/子集问题使用 start 变量保证元素 nums[start] 之后只会出现 nums[start+1..] 中的元素，通过固定元素的相对位置保证不出现重复的子集。在排列时候就玩不转了，需要借助额外的 used 数组来记录某个元素在当前路径中是否已经被用过。
> ![](./pictures/permu1.png)

```js
var permute = function (nums) {
  let res = [];
  let used = Array(nums.length).fill(false);

  backtrack([], nums, res, used);

  return res;
};

const backtrack = (path, nums, res, used) => {
  if (path.length == nums.length) {
    res.push([...path]);
    return;
  }

  for (let i = 0; i < nums.length; i++) {
    if (used[i]) continue;

    path.push(nums[i]);
    used[i] = true;
    backtrack(path, nums, res, used);
    used[i] = false;
    path.pop();
  }
};
```

### 子集 II

[90. 子集 II(中等)](https://leetcode.com/problems/subsets-ii/)

> **思路** 元素要去重了，二话不说先排序啊。关于子集类（组合类）去重方法，其实方法有好几种，这里呢写出我觉得最好理解的一种。排序完了，重复的元素会堆到一起了，所以只要不是 startIndex(新路径起始点)位置的元素，如果和上一个元素同值，那说明这个当前元素不需要再放到组合里了，因为如下图所示之前那个同值元素已经 cover 这个组合的 case 了。解法就是在进入下一层递归前，检查`i>startIndex && nums[i]==nums[i-1]`。
> ![](./pictures/subset4.png)

```js
var subsetsWithDup = function (nums) {
  nums.sort((a, b) => a - b);
  let res = [];
  backtrack([], nums, 0, res);
  return res;
};

const backtrack = (path, nums, startIndex, res) => {
  res.push([...path]);

  for (let i = startIndex; i < nums.length; i++) {
    if (i > startIndex && nums[i] == nums[i - 1]) continue;

    path.push(nums[i]);
    backtrack(path, nums, i + 1, res);
    path.pop();
  }
};
```

### 组合总和 II

[40. 组合总和 II(中等)](https://leetcode.com/problems/combination-sum-ii/)

> **思路** 元素要去重了，二话不说先排序啊。组合问题和子集问题是等价的，这题可以转化成`计算candidates中所有和为target的子集`。这题的去重方法跟[子集 II](#子集II)一模一样。

```js
var combinationSum2 = function (candidates, target) {
  candidates.sort((a, b) => a - b);
  let res = [];
  backtrack([], candidates, target, 0, res);
  return res;
};

const backtrack = (path, candidates, pathSum, startIndex, res) => {
  let n = candidates.length;

  if (pathSum == 0) {
    res.push([...path]);
    return;
  }

  for (let i = startIndex; i < n; i++) {
    if (candidates[i] > pathSum) break;
    if (i > startIndex && candidates[i] == candidates[i - 1]) continue;
    pathSum -= candidates[i];
    path.push(candidates[i]);
    backtrack(path, candidates, pathSum, i + 1, res);
    path.pop();
    pathSum += candidates[i];
  }
};
```

### 全排列 II

[47. 全排列 II(中等)](https://leetcode.com/problems/permutations-ii/)

> **思路** 元素要去重了，二话不说先排序啊。答案跟[全排列]()几乎一样，这里重点陈述一下去重部分的逻辑：当出现重复元素时，比如输入 `nums = [1,2,2',2'']`，2' 只有在 2 已经被使用的情况下才会被选择，同理，2'' 只有在 2' 已经被使用的情况下才会被选择，这就保证了`相同元素在排列中的相对位置保证固定`。关键在于`保证相同元素在排列中的相对位置保持不变`。这就是为啥你能看到 code 里有这个条件检查：`if(i>0 && nums[i]==nums[i-1] && !used[i-1])`。

```js
var permuteUnique = function (nums) {
  nums.sort((a, b) => a - b);
  let res = [];
  let used = Array(nums.length).fill(false);

  backtrack([], nums, res, used);
  return res;
};

const backtrack = (path, nums, res, used) => {
  if (path.length == nums.length) {
    res.push([...path]);
    return;
  }

  for (let i = 0; i < nums.length; i++) {
    if (used[i]) continue;

    if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

    path.push(nums[i]);
    used[i] = true;
    backtrack(path, nums, res, used);
    used[i] = false;
    path.pop();
  }
};
```

### 矩阵内单词查找

[Karat 面试真题 - 矩阵内单词查找]()

> **题目描述** 这题其实是 leetcode 上[这题](https://leetcode.com/problems/word-search-ii/)的简单版
>
> After catching your classroom students cheating before, you realize your students are getting craftier and hiding words in 2D grids of letters. The word may start anywhere in the grid, and consecutive letters can be either **immediately below** or **immediately to the right** of the previous letter.
>
> Given a grid and a word, write a function that returns the location of the word in the grid as a list of coordinates. If there are multiple matches, return any one.
>
> Complexity analysis variables:
>
> 1. r = number of rows
> 1. c = number of columns
> 1. w = length of the word

```js
grid1 = [
    ['c', 'c', 't', 'n', 'a', 'x'],
    ['c', 'c', 'a', 't', 'n', 't'],
    ['a', 'c', 'n', 'n', 't', 't'],
    ['t', 'n', 'i', 'i', 'p', 'p'],
    ['a', 'o', 'o', 'o', 'a', 'a'],
    ['s', 'a', 'a', 'a', 'o', 'o'],
    ['k', 'a', 'i', 'o', 'k', 'i'],
]

word1 = "catnip"
word2 = "cccc"
word3 = "s"
word4 = "ant"
word5 = "aoi"
word6 = "ki"
word7 = "aaoo"
word8 = "ooo"

grid2 = [['a']]
word9 = "a"

find_word_location(grid1, word1) => [ (1, 1), (1, 2), (1, 3), (2, 3), (3, 3), (3, 4) ]
find_word_location(grid1, word2) =>
       [(0, 0), (1, 0), (1, 1), (2, 1)]
    OR [(0, 0), (0, 1), (1, 1), (2, 1)]
find_word_location(grid1, word3) => [(5, 0)]
find_word_location(grid1, word4) => [(0, 4), (1, 4), (2, 4)] OR [(0, 4), (1, 4), (1, 5)]
find_word_location(grid1, word5) => [(4, 5), (5, 5), (6, 5)]
find_word_location(grid1, word6) => [(6, 4), (6, 5)]
find_word_location(grid1, word7) => [(5, 2), (5, 3), (5, 4), (5, 5)]
find_word_location(grid1, word8) => [(4, 1), (4, 2), (4, 3)]
find_word_location(grid2, word9) => [(0, 0)]
```

!> **思路** 很典型的回溯算法，其实也是图的遍历问题。这题有两个地方要注意：1. 只能向下向右走，所以就不需要维护 visited 矩阵了，因为不可能走回头路的(类似二叉树了)；2. 题目保证给出的 word 肯定会出现在矩阵里至少一次。这题吧，我在面试的时候使用了回溯框架（`做选择`和`撤销选择`都放在了 for 循环内），但是面试后琢磨琢磨还是用图的遍历框架比较清晰(for 循环内`加入节点`和`撤销节点`)；这里就把两种解法都展示一下：

```js
const grid1 = [
  ["c", "c", "t", "n", "a", "x"],
  ["c", "c", "a", "t", "n", "t"],
  ["a", "c", "n", "n", "t", "t"],
  ["t", "n", "i", "i", "p", "p"],
  ["a", "o", "o", "o", "a", "a"],
  ["s", "a", "a", "a", "o", "o"],
  ["k", "a", "i", "o", "k", "i"],
];
const word1 = "catnip";
const word2 = "cccc";
const word3 = "s";
const word4 = "ant";
const word5 = "aoi";
const word6 = "ki";
const word7 = "aaoo";
const word8 = "ooo";

const grid2 = [["a"]];
const word9 = "a";
```

```js
/* 用回溯框架试试 */
var DIRS = [
  [1, 0],
  [0, 1],
];
var path = []; // 这里直接吧path设成了global variable
const find_word_location = (grid, word) => {
  let m = grid.length,
    n = grid[0].length;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      path = [];
      let found = traverse([], grid, i, j, word);
      if (found) return path;
    }
  }
};

const traverse = (wordPath, grid, i, j, word) => {
  let m = grid.length,
    n = grid[0].length;
  //base case
  if (wordPath.join("") == word) {
    console.log(wordPath);
    return true;
  }

  if (!word.startsWith(wordPath.join(""))) {
    return false;
  }

  if (wordPath.length > word.length) {
    return false;
  }

  //console.log(wordPath);

  for (const dir of DIRS) {
    let x = i + dir[0];
    let y = j + dir[1];
    //console.log(i, j, x, y);

    if (x < 0 || y < 0 || x >= m || y >= n) continue;

    path.push([i, j]);
    wordPath.push(grid[i][j]);

    if (traverse(wordPath, grid, x, y, word)) {
      return true;
    }

    path.pop();
    wordPath.pop();
  }

  return false;
};

console.log(find_word_location(grid1, word1));
```

```js
/* 用回溯框架试试 */
var DIRS = [
  [1, 0],
  [0, 1],
];
var path = []; // 这里直接吧path设成了global variable
const find_word_location = (grid, word) => {
  let m = grid.length,
    n = grid[0].length;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      path = [];
      let found = traverse([], grid, i, j, word);
      if (found) return path;
    }
  }
};

const traverse = (wordPath, grid, i, j, word) => {
  let m = grid.length,
    n = grid[0].length;

  wordPath.push(grid[i][j]);
  path.push([i, j]);

  if (wordPath.join("") == word) {
    console.log(wordPath);
    return true;
  }

  for (const dir of DIRS) {
    let x = i + dir[0];
    let y = j + dir[1];

    if (x < 0 || y < 0 || x >= m || y >= n) continue;

    if (wordPath.length > word.length) break;

    if (!word.startsWith(wordPath.join(""))) break;

    if (traverse(wordPath, grid, x, y, word)) return true;
  }

  wordPath.pop();
  path.pop();

  return false;
};
```

### 网格中的最短路径

[领扣 1723 网格中的最短路径](#网格中的最短路径)

> **思路** 这个题乍一看非常像动规，而且跟这题长得很像[K 站中转内最便宜的航班](./coding/memo/index?id=#K站中转内最便宜的航班)，都是有个限制条件 k。不过这题其实不是动规，因为 k 这个限制条件导致到达网格中的某个点的状态是很多个[[k, dis]]的组合，这样写起 code 来很不好写。这题直接用回溯会很容易理解，二者这个暴力的回溯算法已经是多项式级别的时间复杂度。

```java
public class Solution {
    /**
     * @param grid: a list of list
     * @param k: an integer
     * @return: Return the minimum number of steps to walk
     */
    private int m,n,minLen;
    private int[][] DIRS = {{-1,0},{1,0},{0,1},{0,-1}};
    public int shortestPath(int[][] grid, int k) {
        // write your code here
        m = grid.length;
        n = grid[0].length;
        minLen = Integer.MAX_VALUE;
        int count = 0;
        backtrack(count, grid, k, 0, 0);
        return minLen == Integer.MAX_VALUE?-1:minLen;
    }

    private void backtrack(int count, int[][] grid, int k, int i, int j) {

        if(i<0 || j<0 || i>=m || j>=n) return;
        if(grid[i][j]==-1) return;
        if(minLen==m+n-2) return; //已经最小

        if(grid[i][j]==1) k--;
        if(k<0) return;

        if(i==m-1 && j==n-1) {
            minLen = Math.min(minLen, count);
            return;
        }

        int temp = grid[i][j];
        grid[i][j] = -1;

        for(int[] dir : DIRS){
            int x = i + dir[0];
            int y = j + dir[1];

            backtrack(count+1, grid, k, x, y);
        }

        grid[i][j] = temp;

    }
}
```
