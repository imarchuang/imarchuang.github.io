# 二叉树后序遍历的题型

- [刷题列表(6 道)](#刷题列表)

这类题主要有意思的地方在于`都涉及跨越左右子树找答案`的情况。

1. 首先，需要跨越左右，所以后序遍历位置的代码是毫无疑问了，
2. 而且这些题都得用到**分治法**概念，因为左右子树都得 return 他们各自的答案，这个各自子树的 return**并非**直接跟题目要求的最终答案一致。
3. 因此要同时需要维护一个**global variable**，目的在于能够在 traversal 递归(DFS)的过程中把目前已知的最佳答案 cache 起来放进**global variable**里边。

!> **敲黑板**：如果你感觉需要多次遍历二叉树了，说明你的**后序遍历**没写好。之前提过，刷题中如果你的 code 里出现了多次遍历树的代码，这个时候一定回头仔细仔细考虑是不是一次`后序遍历`就可以全部解决了？这里的核心就是在你的遍历函数的 return 值是为了保证`可递归性`，就是说能够不破坏`子问题结果层层上传`的写法，与此同时呢，题目的答案却需要跨越左右儿子子问题的单边结果。

> **回溯和分治** 之前提过好几次了，树的**子问题**通常存在于左右子树子树里，因为树就是**一个根节点+一个左子树+一个右子树**。递归的思想在树上的应用核心就是你把一些有效的信息传递到子问题，同时也把子问题中得到的答案可以有效的传回 calling stack，这种**自顶而下**和**自底而上**的思想都是在 DFS 递归过程中保存有消息的思路。
>
> **回溯**函数通常是**void**的 return，所以比较直接，那就是你通常要传入一个类似 Context 的参数，且叫它 `results`吧，然后在子问题的计算过程中可以将子问题的计算结果存到`results`里，这样不管你在递归的哪一层，你都可以 refer 这个`results`，这里呢`results`只是一种常用的方法，当然你也可以传入多个参数来传递有效信息，比如说判断是否为 BST 的那道题[98. 验证二叉搜索树（中等）](https://leetcode.com/problems/validate-binary-search-tree/)，你就可以传递`min`和`max`两个参数来框定区间。话说回来，如果你不想通过参数传入，那么你就可以设一个 global variable，然后每层都 refer 它，这样效果是一模一样的。举几个例子：#TODO
>
> 1.  给你一个二叉树 root=`[3,1,4,3,null,1,5]`，让你找所有的**good**node，所谓`good node`就是说从 root 到这个 node 的路径里不存在一个比这个 node 值大的其他 node，上面的例子就是[3(root), 3(left most), 4, 5]这 4 个 node 是 good node。这里每个节点都需要判断自己是否为 good node，而判断标准就是从 root 到自己的路径上是否有比自己大的值，这个**自顶而下**思路应该是非常直观的，因为你只要保证把到达自己路径上的最大值传递下去就好了，**自顶而下**思路基本上就是一个前序遍历解法，也就是回溯法：

```python
class Solution:
    res = 0
    def goodNodes(self, root: TreeNode) -> int:
        def isGood(node, max_val):
            if not node:
                return
            if node.val >= max_val:
                self.res += 1
            isGood(node.left, max(max_val, node.val))
            isGood(node.right, max(max_val, node.val))

        isGood(root, float('-inf'))
        return self.res
```

#### **刷题列表**

1. [543 二叉树直径](#二叉树直径)
1. [124 二叉树的最大路径和](#二叉树的最大路径和)
1. [687 最长重复值路径](#最长重复值路径)
1. [1339 分割二叉树的最大乘积](#分割二叉树的最大乘积)
1. [2049 统计最高分的节点数目](#二叉树最大乘积分割)
1. [1373 二叉搜索树中的最大子树和](#二叉搜索树中的最大子树和)
1. [650 领扣 - 二叉树叶子顺序遍历](#二叉树叶子顺序遍历)
1. [93 领扣 - 平衡二叉树](#平衡二叉树)

### 二叉树直径

[543 二叉树直径](https://leetcode.com/problems/diameter-of-binary-tree/)

> **[思路]** 维护一个 maxDiameter 的 global 参数，然后分治函数里返回子树的最大深度并打擂台 maxDiameter

```js
var maxDiameter = 0;
//典型的后序遍历/分治代码 -> 直径 = 左子树最大深度 + 右子树最大深度
var diameterOfBinaryTree = function (root) {
  maxDiameter = 0;
  maxDepth(root);
  return maxDiameter;
};

const maxDepth = (root) => {
  if (!root) return 0;

  let left = maxDepth(root.left);
  let right = maxDepth(root.right);
  let depth = Math.max(left, right) + 1;
  let diameter = left + right;
  maxDiameter = Math.max(diameter, maxDiameter);
  return depth;
};
```

```java
class Solution {

    private int maxDiameter = 0;
    public int diameterOfBinaryTree(TreeNode root) {
        maxDepth(root);

        return maxDiameter;
    }

    public int maxDepth(TreeNode node) {
        if(node==null) return 0;
        int left = maxDepth(node.left);
        int right = maxDepth(node.right);
        maxDiameter = Math.max(maxDiameter, left+right);

        return Math.max(left, right)+1;
    }
}
```

### 二叉树的最大路径和

[124 二叉树的最大路径和](https://leetcode.com/problems/binary-tree-maximum-path-sum/)

> **[思路]** 维护一个 maxSum 的 global 参数，然后分治函数里返回子树的最大深度并打擂台 maxSum

```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
//典型的后序遍历/分治代码
var maxSum = -Number.MAX_VALUE;
var maxPathSum = function (root) {
  maxSum = -Number.MAX_VALUE;
  traverse(root);
  return maxSum;
};

const traverse = (root) => {
  if (!root) return -Number.MAX_VALUE;

  let left = traverse(root.left);
  let right = traverse(root.right);
  //用maxSum跟三个参数大擂台：root本身值，root本身+左子树，root本身+右子树，root本身+左子树+右子树
  //注意这里没必要再跟左子树和右子树大擂台，因为这个在下层递归里处理过了
  maxSum = Math.max(
    maxSum,
    root.val,
    root.val + left,
    root.val + right,
    left + root.val + right
  );

  return Math.max(root.val, root.val + left, root.val + right);
};
```

```java
import java.util.stream.*;
public class Solution {
    /**
     * @param root: The root of binary tree.
     * @return: An integer
     */
    private int maxPathSum = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) {
        // write your code here
        traverse(root);
        return maxPathSum;
    }

    private int traverse(TreeNode node){
        if(node==null)
            return 0;

        int left = traverse(node.left);
        int right = traverse(node.right);

        maxPathSum = IntStream.of(node.val, left+node.val, right+node.val, left+node.val+right, maxPathSum).max().getAsInt();

        return IntStream.of(node.val, left+node.val, right+node.val).max().getAsInt();
    }
}
```

```python
class Solution:
    res = float('-inf')
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        def max_path_sum(root):
            if not root:
                return 0
            left = max_path_sum(root.left)
            left = 0 if left<0 else left
            right = max_path_sum(root.right)
            right = 0 if right<0 else right
            self.res = max(self.res, left+right+root.val)
            return max(left, right)+root.val
        max_path_sum(root)
        return self.res
```

### 最长重复值路径

[687 最长重复值路径](https://leetcode.com/problems/longest-univalue-path/)

> **[思路]** 维护一个 res 的 global 参数。这里有个小技巧就是要传入父节点的值 val，因为可以根据当前根节点与父节点是否同值来决定返回 0 还是路径延长

```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var res = 0;
var longestUnivaluePath = function (root) {
  res = 0;
  if (!root) return 0;
  traverse(root, root.val);
  return res;
};

const traverse = (root, val) => {
  if (!root) return 0;

  //如果当前root.val和传入的val是不同的，这个left会是0；
  let left = traverse(root.left, root.val);
  let right = traverse(root.right, root.val);

  res = Math.max(res, left + right);
  return root.val == val ? Math.max(left, right) + 1 : 0;
};
```

> **[思路 II]** 依旧是维护一个 res 的 global 参数。但是能不能不传入父节点的值 val？答案是可以的，因为可以向左向右 peek

```js
var res = 0;
var longestUnivaluePath = function (root) {
  res = 0;
  if (!root) return 0;
  traverse(root);
  return res;
};

const traverse = (root) => {
  if (!root) return 0;

  //如果当前root.val和传入的val是不同的，这个left会是0；
  let left = traverse(root.left);
  let right = traverse(root.right);

  if (root.left && root.left.val == root.val) {
    left++;
  } else {
    left = 0;
  }

  if (root.right && root.right.val == root.val) {
    right++;
  } else {
    right = 0;
  }

  res = Math.max(res, left + right);
  return Math.max(left, right);
};
```

```java
class Solution {

    private int longestPath = 0;
    public int longestUnivaluePath(TreeNode root) {
        maxStretch(root);
        return longestPath;
    }

    private int maxStretch(TreeNode node) {
        if(node==null) return 0;

        int left=maxStretch(node.left);
        int right=maxStretch(node.right);
        if(node.left != null && node.val == node.left.val){
            left++;
        } else {
            left = 0;
        }
        if(node.right != null && node.val == node.right.val){
            right++;
        } else {
            right = 0;
        }

        longestPath = Math.max(longestPath, left+right);

        return Math.max(left,right);
    }
}
```

```java
class Solution {
    private int maxProd = 0;
    private int total = 0;
    public int maxProduct(TreeNode root) {
        total = treeSum(root);
        treeSum(root);

        return (int)(maxProd%(Math.pow(10,9) + 7));
    }

    private int treeSum(TreeNode node){
        if(node==null) return 0;

        int left  = treeSum(node.left);
        int right  = treeSum(node.right);

        maxProd = IntStream.of(maxProd, left*(total-left), right*(total-right)).max().getAsInt();

        return left+right+node.val;
    }
}
```

```python
class Solution:
    longest_path = 0
    def longestUnivaluePath(self, root: Optional[TreeNode]) -> int:
        def extendPath(node, val):
            if not node:
                return 0

            left = extendPath(node.left, node.val)
            right = extendPath(node.right, node.val)

            if node.val != val:
                self.longest_path = max(self.longest_path, left+right)
                return 0
            else:
                self.longest_path = max(self.longest_path, left+right, max(left,right)+1)
                return max(left, right)+1

        extendPath(root, None)
        return self.longest_path
```

### 分割二叉树的最大乘积

[1339 分割二叉树的最大乘积](https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/)

> **[思路]** 根据判断，答案肯定是要跨越单个子树的左右两边了；而且这题要维护两个 global 参数，一个是 total，一个是 maxProd；因为计算时候一定要先知道整棵树的节点总和 total，然后分治函数里返回子树的节点和并打擂台 maxProd

```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxProd = 0;
var total = 0;
var maxProduct = function (root) {
  maxProd = 0;
  total = 0;
  total = treeSum(root);
  treeSum(root);
  return maxProd % (Math.pow(10, 9) + 7);
};

const treeSum = (root) => {
  if (!root) return 0;

  let left = treeSum(root.left);
  let right = treeSum(root.right);

  maxProd = Math.max(maxProd, left * (total - left), right * (total - right));
  return root.val + left + right;
};
```

### 统计最高分的节点数目

[2049 统计最高分的节点数目](https://leetcode.com/problems/count-nodes-with-the-highest-score/)

> **[思路]** 先根据输入的 parents 数组把二叉树建出来，然后用一个 map 来 cache 把每个节点删除时候形成的乘积。最后 for 循环这个 map 找到最大的乘积，并返回最大乘积对应的数值

```js
/**
 * @param {number[]} parents
 * @return {number}
 */
var countHighestScoreNodes = function (parents) {
  let n = parents.length;
  let root = buildATree(parents);

  let map = {};
  countNodes(root, n, map);

  let highestScore = 0;
  for (const key of Object.keys(map)) {
    highestScore = Math.max(highestScore, key);
  }

  return map[highestScore];
};

const countNodes = (root, n, map) => {
  if (!root) return 0;
  let leftCount = countNodes(root.left, n, map);
  let rightCount = countNodes(root.right, n, map);
  let otherCount =
    n - leftCount - rightCount == 1 ? 1 : n - leftCount - rightCount - 1;

  let prod =
    (leftCount == 0 ? 1 : leftCount) *
    (rightCount == 0 ? 1 : rightCount) *
    otherCount;
  if (!map[prod]) {
    map[prod] = 1;
  } else {
    map[prod]++;
  }

  return 1 + leftCount + rightCount;
};

const buildATree = (parents) => {
  if (parents.length <= 0) return null;

  //find root
  let rootIdx = -1;
  let nodes = Array(parents.length);
  for (const [i, v] of parents.entries()) {
    if (!nodes[i]) {
      nodes[i] = new TreeNode(i);
    }
    if (v == -1) {
      rootIdx = i;
      continue;
    }
    if (!nodes[v]) {
      nodes[v] = new TreeNode(v);
    }

    if (!nodes[v].left) {
      nodes[v].left = nodes[i];
    } else {
      nodes[v].right = nodes[i];
    }
  }

  return nodes[rootIdx];
};
```

### 二叉搜索树中的最大子树和

[1373 二叉搜索树中的最大子树和](https://leetcode.com/problems/maximum-sum-bst-in-binary-tree)

> **[思路]** 维护一个 maxVal 的 global 变量，然后分治遍历，在后序遍历位置维护这样一个数组`[isBST(子树是不是BST), 以root为根的子树最小值, 以root为根的子树最大值, subTreeSum(子树的节点和)]`

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

### 二叉树叶子顺序遍历

[650 领扣 - 二叉树叶子顺序遍历](https://www.lintcode.com/problem/650/description)

> **[思路]** 维护一个 res 的`global`变量，然后分治遍历，类似于二叉树的最大深度, 把自己尽量往最大深度那个层上塞。分治思量的重点在于你在后序遍历的逻辑是什么？后序遍历位置的好处就是你知道了左右两个子树的信息了，所以跨越左右子树的分析逻辑一定是后序遍历的解法。

```java
public class Solution {
    /*
     * @param root: the root of binary tree
     * @return: collect and remove all leaves
     */
    public List<List<Integer>> findLeaves(TreeNode root) {
        // write your code here
        List<List<Integer>> ans =  new ArrayList<>();
        this.traverse(root, ans);
        return ans;

    }

    private int traverse(TreeNode root, List<List<Integer>> ans){
        if(root==null) return -1;
        int left = this.traverse(root.left, ans);
        int right = this.traverse(root.right, ans);

        int level = Math.max(left, right)+1;
        if(level>=ans.size()){
            ans.add(new ArrayList<Integer>());
        }

        ans.get(level).add(root.val);
        return level;
    }

}
```

```python
class Solution:
    """
    @param: root: the root of binary tree
    @return: collect and remove all leaves
    """
    def findLeaves(self, root):
        result = []
        def traverse(node):
            if not node:
                return -1
            left = traverse(node.left)
            right = traverse(node.right)
            level = max(left, right)+1;

            if level >= len(result):
                result.append([])
            result[level].append(node.val)

            return level

        traverse(root)
        return result
```

### 平衡二叉树

1. [93 领扣 - 平衡二叉树](https://www.lintcode.com/problem/93/description)
   > **[思路]** 原题说了，一棵高度平衡的二叉树的定义是：一棵二叉树中每个节点的两个子树的深度相差不会超过 1。所以肯定是后序遍历看左右两个子树的高度差。那我们就先看个无脑的解法：那就开一个单独的`treepDepth(TreeNode node)`的函数算高度呗，然后在主函数的前序位置判断`Math.abs(left-right)>1`，最后再递归左右子树`isBalanced(root.right) && isBalanced(root.left)`。

```java
public class Solution {
    /**
     * @param root: The root of binary tree.
     * @return: True if this Binary tree is Balanced, or false.
     */
    public boolean isBalanced(TreeNode root) {
        if(root==null) return true;

        int left = treeDepth(root.left);
        int right = treeDepth(root.right);

        if(Math.abs(left-right)>1) return false;

        return isBalanced(root.right) && isBalanced(root.left);
    }

    private int treeDepth(TreeNode root) {
        if(root==null) return 0;
        int leftD = treeDepth(root.left);
        int rightD = treeDepth(root.right);

        return Math.max(leftD, rightD) +1;
    }
}
```

> 之前提过，如果你感觉需要多次遍历二叉树了，说明你的后序遍历没写好。这题如果用 javascript 写，你肯定会在写的过程中很快意识到其实在遍历算 treeDepth 的时候可以把子树是否是 balanced 一起判断了。只不过用 java 写，你就只能 return 一个数组，用数字的第一位表示子树是否为 balanced。

```java
public class Solution {
    /**
     * @param root: The root of binary tree.
     * @return: True if this Binary tree is Balanced, or false.
     */
    public boolean isBalanced(TreeNode root) {
        if(root==null) return true;

        return treeDepth(root)[0]==1;
    }

    private int[] treeDepth(TreeNode root) {
        if(root==null) return new int[]{1,0};
        int[] left = treeDepth(root.left);
        int[] right = treeDepth(root.right);

        if(left[0]==0 || right[0]==0) return new int[]{0,1};
        if(Math.abs(left[1]-right[1])>1) return new int[]{0,1};

        return new int[]{1, Math.max(left[1], right[1]) + 1};
    }
}
```

```python
class Solution:
    """
    @param root: The root of binary tree.
    @return: True if this Binary tree is Balanced, or false.
    """
    def is_balanced(self, root: TreeNode) -> bool:
        def tree_depth(node):
          if not node:
            return (True, 0)

          left = tree_depth(node.left)
          if not left[0]:
            return (False, None)
          right = tree_depth(node.right)
          if not right[0]:
            return (False, None)
          # print(node.val, left, right)
          if abs(left[1]-right[1])>1:
            return (False, None)

          return (True, max(left[1], right[1])+1)

        return tree_depth(root)[0]
```
