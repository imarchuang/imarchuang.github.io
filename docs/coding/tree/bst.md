# 关于二叉搜素树（BST)的一些操作

> **[更新 2023-07-18]**：一直强调先刷二叉树，因为他的递归性最强。二叉树里有一种特殊类叫做BST，这个其实是很多高级数据结构的基础，比如说红黑树，AVL树，B+树，线段树之类的。但是至于算法面试的话，只考察BST的两个特性：
> 1. BST的**中序遍历**是有序的，相当于一个有序数组；比如说[二叉搜索树中第K小的元素](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)这题，解法简单粗暴，那就是直接按照中序遍历有序这个特性，直接去遍历得到第k个元素。
>     * 这题其实是个O(N)的解法，并非完全利用了BST的特性。假设你能够在BST节点中维护额外信息size，记录以节点自己为根的这棵二叉树有多少个节点。有了这个额外信息，你能想到O(logN)的解法吗？这题其实就是一道Google的面试真题，要深入了解，可以读读这篇[Order Statistic Tree](https://en.wikipedia.org/wiki/Order_statistic_tree).
> 1. BST左小右大，所以相较于generic的二叉树，很多时候你可以选择不用遍历所有的节点，这个更像是数组的二分法操作。因为你可以比较节点当前值和目标值来进行二分：去左边还是去右边。这样一下就像二分法中drop一半的操作了。

> 关于 BST，先啰嗦几句。这类题跟二叉树有些不同，通常都会设计到对节点的操作（例如插入，删除，更该数值等）。一旦涉及到插入，删除，更该数值等操作，【**敲黑板**】分治函数需要返回一个TreeNode类型的结果，并对递归调用的返回值进行接收。另外，针对于它的**有序性**，分治函数里通常会多一个参数叫做target，有了这个target，最先应该先去想套用BST的解题模板。
>
> BST 还有一类问题，就是利用中序遍历**有序**这个特性，对 BST 进行一些类似于iterator的加工。
>
> 关于模板，对于二叉树有序性方面进行有序递归操作，请参照一下模板：

```js
const BST(TreeNode root, int target) {
    if(!root) 
        //base case 做该做的事情并return;
    if (root.val == target)
        // 找到目标，搞点事情
    if (root.val < target)
        //递归去右边
        BST(root.right, target);
    if (root.val > target)
        //递归去左边
        BST(root.left, target);
}
```

> **[更新 2022-04-01]**：如果问你，怎样验证一个数值nums是个非降序数组，你会怎么做？O(n)去遍历所有元素，只要出现了`nums[i]<nums[i-1]`就可以退出说不是非降序数组了，也就是说如果不是非降序数组，你可能不用遍历完所有元素就能得到答案。现在给你一个二叉树，问你怎么验证是否为BST，该怎么做呢？
>
> 比较暴力的做法就是先**中序遍历**完生成一个数组，然后去看这个数组是否为非降序数组。不过这样做的一个坏处就是，你必须遍历完所有节点才能得到答案，能不能剪枝一下呢？
> 
> 这就需要回到BST的invariant上来。BST的定义是说：在每个节点上，它的左子树的所有元素的值都**不比root值大**，它的右子树所有元素的值都**不比root值小**。这样看来，我有两中方法：
> 1. 如果我知道左子树的*值域*`[left_min, left_max]`和右子树的的*值域*`[right_min, right_max]`，那么我就可以在每个节点上判断是否`left_max<=root.val<=right_min`就可以了。
> 1. 针对某节点parent的左子树的根节点，那么我要保证me.val是不大于parent.val的，这还没完，我还得保证我的右儿子的所有节点值都是**不大于parent.val的并且不小于我自己的node.val**，看看你脑子是否能体会出这么一个函数签名了？`isBST(my_right_child, me.val, my_parent.val)`，对于我得左儿子，我也可以类似的得到这个函数签名：`isBST(my_left_child, -infinity, me.val)`，因为我本身的值肯定是不大过parent.val的。同样的，针对parent的右儿子，你可以得到这么两个签名：`isBST(my_left_child, my_parent.val, me.val)`和`isBST(my_right_child, me.val, +infinity)`。
>

> ! **敲黑板**：二叉搜索树的迭代遍历模板`**狠狠重要**`，建议背诵全文！有个小口诀：**无右则回头找左拐，有右则进入并一路向西**，这里我给个 python 版本:

```python
### **二叉搜索树BST的迭代器Iterator**
"""
这里assume一个预设好的stack，这个stack的初始化也是在constructor里一路向西直到null；
"""
#升序排列找下个值
def next(stack):
    res = stack[-1] #栈顶就是结果
    node = res #把栈顶copy存起来
    #重新更新stack
    # 没有右子树，那就从当前路径中找到第一个左拐的节点
    if not node.right:
        node = stack.pop()
        while stack and stack[-1].right == node:
            node = stack.pop()

        return res

    #存在右子树，然后一路向西
    node = node.right
    while node:
	    stack.append(node)
	    node = node.left

    return res
```

#### **刷题列表**

1. [230. 二叉搜索树中第 K 小的元素（中等）](#二叉搜索树中第K小的元素)
1. [538. 二叉搜索树转化累加树（中等）](#二叉搜索树转化累加树)
1. [1038. BST 转累加树（中等）](#BST转累加树)

---

1. [700. 二叉搜索树中的搜索（简单）](#二叉搜索树中的搜索)
1. [701. 二叉搜索树中的插入操作（中等）](#二叉搜索树中的插入操作)
1. [450. 删除二叉搜索树中的节点（中等）](#删除二叉搜索树中的节点)
1. [98. 验证二叉搜索树（中等）](#验证二叉搜索树)
1. [1373 二叉搜索树中的最大子树和](#二叉搜索树中的最大子树和)

---

**接下来两题是动态规划问题**

1. [96. 不同的二叉搜索树（简单）](#不同的二叉搜索树)
1. [95. 不同的二叉搜索树 II（中等）](#不同的二叉搜索树II)

---

##### 二叉搜索树中第 K 小的元素

[230. 二叉搜索树中第 K 小的元素（中等）](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)

**[思路 I]** 二叉搜索树的中序遍历是有序的，重点是要把 rank 放到 global 变量的位子

```js
//递归思想
let res = 0;
let rank = 0;
var kthSmallest = function (root, k) {
  res = 0;
  rank = 0;
  traverse(root, k);
  return res;
};

const traverse = (root, k) => {
  if (!root) {
    return;
  }

  traverse(root.left, k);
  /* 中序遍历代码位置 */
  rank++;
  if (k == rank) {
    res = root.val;
    return;
  }
  /*****************/
  traverse(root.right, k);
};
```

##### 二叉搜索树转化累加树

[538. 二叉搜索树转化累加树（中等）](https://leetcode.com/problems/convert-bst-to-greater-tree/)
**[思路 I]** 累加树的问题，可以直接修改节点的 val，另外一个重点是要把目前的累加值 accum 放到 global 变量的位子

```js
let accum = 0;
var convertBST = function (root) {
  accum = 0;
  traverse(root);
  return root;
};

const traverse = (root) => {
  if (!root) return;
  traverse(root.right);
  accum += root.val;
  root.val = accum;
  traverse(root.left);
};
```

##### BST 转累加树

[1038. BST 转累加树（中等)](https://leetcode.com/problems/binary-search-tree-to-greater-sum-tree/)
**[思路 I]** 累加树的问题，和[538. 二叉搜索树转化累加树（中等）](#二叉搜索树转化累加树)一模一样解法

```js
let accum = 0;
var bstToGst = function (root) {
  accum = 0;
  traverse(root);
  return root;
};

const traverse = (root) => {
  if (!root) return;
  traverse(root.right);
  accum += root.val;
  root.val = accum;
  traverse(root.left);
};
```

##### 二叉搜索树中的搜索

[700. 二叉搜索树中的搜索（简单）](https://leetcode.com/problems/search-in-a-binary-search-tree/)

**[思路]** 套模板吧

```js
var res;
var searchBST = function (root, val) {
  res = null;
  traverse(root, val);
  return res;
};

const traverse = (root, val) => {
  if (!root) return;

  if (root.val == val) {
    res = root;
  } else if (root.val > val) {
    traverse(root.left, val);
  } else if (root.val < val) {
    traverse(root.right, val);
  }
};
```

##### 二叉搜索树中的插入操作

[701. 二叉搜索树中的插入操作（中等）](https://leetcode.com/problems/insert-into-a-binary-search-tree/)
**[思路]** 套模板啊。

```js
var insertIntoBST = function (root, val) {
  // 找到空位置插入新节点
  if (!root) return new TreeNode(val);
  if (root.val < val) {
    root.right = insertIntoBST(root.right, val);
  } else if (root.val > val) {
    root.left = insertIntoBST(root.left, val);
  }

  return root;
};
```

##### 删除二叉搜索树中的节点

[450. 删除二叉搜索树中的节点（中等）](https://leetcode.com/problems/delete-node-in-a-bst/)

**[思路]** 目标节点存在三种情况：情况 1：A 恰好是末端节点，两个子节点都为空，那么它可以当场去世了。情况 2：A 只有一个非空子节点，那么它要让这个孩子接替自己的位置。情况 3：A 有两个子节点，麻烦了，为了不破坏 BST 的性质，A 必须找到左子树中最大的那个节点，或者右子树中最小的那个节点来接替自己。我们以第二种方式讲解。

```js
//涉及到node的操作了，一定需要return 一个node
var deleteNode = function (root, key) {
  if (!root) return null;
  if (root.val == key) {
    if (!root.left) return root.right;
    if (!root.right) return root.left;

    //情况三：左右子树都非空
    //找右子树中最小的点互换
    let node = getMin(root.right);

    // 删除右子树最小的节点
    root.val = node.val;
    root.right = deleteNode(root.right, node.val);
  } else if (root.val < key) {
    root.right = deleteNode(root.right, key);
  } else if (root.val > key) {
    root.left = deleteNode(root.left, key);
  }

  return root;
};

const getMin = (node) => {
  while (node.left) node = node.left;
  return node;
};
```

##### 验证二叉搜索树

[98. 验证二叉搜索树（中等）](https://leetcode.com/problems/validate-binary-search-tree/)

> **[思路 I]** **自底而上**的解法，当递归到空节点时，返回一个[true, Number.MAX_VALUE, -Number.MAX_VALUE]组合

```js
var isValidBST = function (root) {
  let res = isValid(root);
  return res[0];
};

const isValid = (root) => {
  if (!root) return [true, Number.MAX_VALUE, -Number.MAX_VALUE];

  let left = isValid(root.left);
  if (!left[0]) return [false, null, null];
  let right = isValid(root.right);
  if (!right[0]) return [false, null, null];

  if (root.val > left[2] && root.val < right[1]) {
    let min = Math.min(root.val, left[1]);
    let max = Math.max(root.val, right[2]);
    return [true, min, max];
  }

  return [false, null, null];
};
```

> **[思路 II]** **自顶而下**的解法，把每个节点所需要满足的上边界值和下边界值都递归的传下去

```js
var isValidBST = function (root) {
  return isValid(root, -Number.MAX_VALUE, Number.MAX_VALUE);
};

const isValid = (root, min, max) => {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return (
    isValid(root.left, min, root.val) && isValid(root.right, root.val, max)
  );
};
```

##### 二叉搜索树中的最大子树和

[1373 二叉搜索树中的最大子树和](https://leetcode.com/problems/maximum-sum-bst-in-binary-tree) 
**[思路]** 维护一个 maxVal 的 global 变量，然后分治遍历，在后序遍历位置维护这样一个数组[isBST（子树是不是 BST）, 以 root 为根的子树最小值, 以 root 为根的子树最大值, subTreeSum（子树的节点和）]

```js
let maxVal = -Number.MAX_VALUE;
var maxSumBST = function (root) {
  maxVal = -Number.MAX_VALUE;
  traverse(root);
  return maxVal < 0 ? 0 : maxVal;
};

//返回[isBST, 以root为根的子树最小值, 以root为根的子树最大值, subTreeSum]
const traverse = (root) => {
  if (!root) {
    return [true, Number.MAX_VALUE, -Number.MAX_VALUE, 0];
  }

  let leftRes = traverse(root.left);
  let rightRes = traverse(root.right);

  let res = [];

  if (
    leftRes[0] &&
    rightRes[0] &&
    root.val > leftRes[2] &&
    root.val < rightRes[1]
  ) {
    res[0] = true;
    // 计算以 root 为根的这棵 BST 的最小值
    res[1] = Math.min(leftRes[1], root.val);
    // 计算以 root 为根的这棵 BST 的最大值
    res[2] = Math.max(rightRes[2], root.val);
    // 计算以 root 为根的这棵 BST 所有节点之和
    res[3] = leftRes[3] + rightRes[3] + root.val;
    // 更新全局变量
    maxVal = Math.max(maxVal, res[3]);
  } else {
    res[0] = false;
    //其他没必要计算了
  }

  return res;
};
```

###### 不同的二叉搜索树

[96. 不同的二叉搜索树（简单）](https://leetcode.com/problems/unique-binary-search-trees/)

```js
//纯穷举
var numTrees = function (n) {
  //base cases
  if (n == 0) return 1;
  if (n <= 2) return n;

  //遍历每个数字做根节点
  let total = 0;
  for (let i = 1; i <= n; i++) {
    let left = numTrees(i - 1);
    let right = numTrees(n - i);
    let treeCount = left * right;
    total += treeCount;
  }
  return total;
};
```

**[思路 II]** 有点重复子问题的意思，用一个 memo 来记录已经计算过得结果

```js
//有点重复子问题的意思，用一个memo来记录已经计算过得结果
var memo = [];
var numTrees = function (n) {
  memo = Array(n + 1).fill(-1);
  return countTrees(n);
};

var countTrees = function (n) {
  //base cases
  if (n == 0) return 1;
  if (n <= 2) return n;

  if (memo[n] != -1) return memo[n];

  //遍历每个数字做根节点
  let total = 0;
  for (let i = 1; i <= n; i++) {
    let left = countTrees(i - 1);
    let right = countTrees(n - i);
    let treeCount = left * right;
    total += treeCount;
  }
  memo[n] = total;
  return memo[n];
};
```

**[思路 III]** 用自底向上的动规解法

```js
//用动态规划思路解题
var numTrees = function (n) {
  let dp = Array(n + 1).fill(0);
  //base case
  dp[0] = 1;
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i < n + 1; i++) {
    for (let j = 1; j <= i; j++) {
      dp[i] += dp[j - 1] * dp[i - j];
    }
  }
  return dp[n];
};
```

###### 不同的二叉搜索树 II

[95. 不同的二叉搜索树 II（中等）](https://leetcode.com/problems/unique-binary-search-trees-ii/)

```js
//纯穷举：需要个二维参数
var generateTrees = function (n) {
  return buildTrees(1, n);
};

var buildTrees = function (lo, hi) {
  //base cases
  if (lo > hi) return [null];
  if (lo == hi) {
    return [new TreeNode(lo)];
  }

  let res = [];
  //遍历每个数字做根节点
  for (let i = lo; i <= hi; i++) {
    let lefts = buildTrees(lo, i - 1);
    let rights = buildTrees(i + 1, hi);

    for (const left of lefts) {
      for (const right of rights) {
        let root = new TreeNode(i);
        root.left = left;
        root.right = right;
        res.push(root);
      }
    }
  }

  return res;
};
```

**[思路 II]** 有点重复子问题的意思，用一个二维 memo 来记录已经计算过得结果

```js
//有点重复子问题的意思，用一个memo来记录已经计算过得结果
var memo;
var generateTrees = function (n) {
  //构造二叉树，最主要的是想象怎么构造root节点
  //这题就是遍历所有可能的root节点
  //加个memo试试
  memo = {};
  return buildBST(1, n);
};

const buildBST = (start, end) => {
  if (start > end) {
    return [null];
  }

  if (memo[start + "_" + end]) return memo[start + "_" + end];

  let res = [];
  for (let i = start; i <= end; i++) {
    //let root = new TreeNode(i);
    let lefts = buildBST(start, i - 1);
    let rights = buildBST(i + 1, end);
    for (const left of lefts) {
      for (const right of rights) {
        let root = new TreeNode(i);
        if (left !== null) {
          root.left = left;
        }
        if (right !== null) {
          root.right = right;
        }
        res.push(root);
      }
    }
  }

  memo[start + "_" + end] = [...res];
  return res;
};
```
