# 二叉树的两类思路：遍历法和分治法
- [刷题列表(6道)](#刷题列表)

>这类题通常都相对简单，说白了就是二叉树模板的套用。理论上讲，如果一道题可以用遍历法解决，几乎可以肯定这道题也可以用分治法解决。只不过很多时候用分治法写出来的代码更容易让别人看懂。
>
>这篇会尽量用两类思路（遍历法和分治法）来解题。**重要的事情说三遍**：一定要先思考对于每一个节点上，它需要做什么！！！

!> **敲黑板**：二叉树的遍历模板很简单但是`**狠狠重要**`，这是后序回溯思维的基础。这里再贴一遍二叉树遍历模板：

#### **刷题列表**
1. [104 二叉树最大深度 (简单)](#二叉树最大深度)
1. [144 二叉树的前序遍历（简单）](#二叉树的前序遍历)
1. [226 翻转二叉树（简单）](#二叉树的最大路径和)
1. [114 二叉树展开为链表（中等）](#二叉树展开为链表)
1. [652 寻找重复的子树（中等）](#寻找重复的子树)
1. [116 填充每个节点的下一个右侧节点指针（中等）](#填充每个节点的下一个右侧节点指针)
1. [2049 统计最高分的节点数目](#统计最高分的节点数目)


##### 二叉树最大深度
[104 二叉树最大深度 (简单)](https://leetcode.com/problems/maximum-depth-of-binary-tree/)
> 要解答此题，对于每一个节点上，它需要做什么？
> 1. 遍历是啥意思？那就是穷举呗，说明要经过所有节点才能得到答案。当遍历顺序呢？就是DFS和BFS嘛。遍历的每个节点上要干嘛呢？啥时候（前序、中序、还是后序）干呢？
>   1. 自上而下的思维的话，那就得知道当前节点所处的深度对吧？这就牵扯到遍历顺序了，直接无脑的DFS吧，然后进入子节点时候要+1，回到当前节点时候再-1，这个思想就是回溯框架擅长的。这就是遍历法。
>   1. 分治就是分而治之，那总得先知道怎么分解问题对吧？要知道一个节点的最大深度，是不是可以分解成：比较左右子树的最大深度取其大者，然后+1就得到答案了呢？

**[思路I]** 用分治法
```js
var maxDepth = function(root) {
    if(!root) return 0;
    
    let left = maxDepth(root.left);
    let right = maxDepth(root.right);
    
    return Math.max(left, right)+1;
};
```
```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # 思考每个节点上要做啥
        if not root:
            return 0

        return max(self.maxDepth(root.left), self.maxDepth(root.right))+1
```
**[思路II]** 用遍历法，这里的code特别像回溯框架
```js
// 记录最大深度
let res = 0;
let depth = 0;
var maxDepth = function(root) {
    res = 0;
    depth = 0;
    traverse(root);
    return res;
};

const traverse = (root) => {
    if (!root) {
		// 到达叶子节点
		res = Math.max(res, depth);
		return;
	}
	// 前序遍历位置
	depth++;
	traverse(root.left);
	traverse(root.right);
	// 后序遍历位置
	depth--;
}
```
```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        depth = 0
        max_depth = 0
        def backtrack(node):
          nonlocal depth
          nonlocal max_depth
          if not node:
            return 0
          depth += 1 #相当于做选择
          backtrack(node.left)
          backtrack(node.right)
          # 夹带私货打擂台
          max_depth = max(max_depth, depth)
          depth -= 1 #相当于撤销选择

        backtrack(root)
        return max_depth
```

##### 二叉树的前序遍历
[144 二叉树的前序遍历](https://leetcode.com/problems/binary-tree-preorder-traversal/) 
**[思路I]** 用遍历法
```js
var preorderTraversal = function(root) {
    let res = [];
    traverse(root, res);
    return res;
};

var traverse = (root, res) => {
    if(!root) return;
    
    //前序遍历位置
    res.push(root.val);
    traverse(root.left, res);
    traverse(root.right, res);
}
```
```python
class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        res = []
        # 简单粗暴遍历法
        def traverse(node: TreeNode) -> None:
            if not node:
                return
            nonlocal res
            res.append(node.val)
            traverse(node.left)
            traverse(node.right)
        
        traverse(root)
        return res
```

**[思路II]** 用分治法
```js
var preorderTraversal = function(root) {
    if(!root) return [];
    let res = [];
    res.push(root.val);
    let left = preorderTraversal(root.left);
    let right = preorderTraversal(root.right);
    
    return res.concat(left).concat(right);
};
```
```python
class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        def div_con(node):
            if not node:
                return []
            left = div_con(node.left)
            right = div_con(node.right)
            # print(left, right, node.val)
            return [node.val, *left, *right]
        return div_con(root)
```

##### 翻转二叉树
[226 翻转二叉树（简单）](https://leetcode.com/problems/invert-binary-tree/) 
**[思路I]** 用分治法
> 这个思路比较直接，那就是先去把左右子树翻转了，再回头来在当前节点左右儿子互换
>
```js
var invertTree = function(root) {
    if(!root) return null;
    
    let left = invertTree(root.left);
    let right = invertTree(root.right);
    
    root.left=right;
    root.right=left;
    
    return root;
};
```
```python
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None

        left = self.invertTree(root.left)
        right = self.invertTree(root.right)
        # 后序操作
        root.left = right
        root.right = left
        return root
```
**[思路II]** 用遍历法
> 这个思路不太好想，遍历过程中干什么？就是交换左右儿子呗对吧？那我们先交换行不？会不会影响后序子节点的解题？答案是不会
>
> 说白了就是个前序遍历
```python
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        def traverse(node=root):
            if node:
                node.left, node.right = node.right, node.left
                traverse(node.left)
                traverse(node.right)

        traverse(root)
        return root
```

##### 二叉树展开为链表
[114 二叉树展开为链表（中等）](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/)
> **[思路]** 遍历法
> 其实这题的遍历或者分治解法都是基于一个观点：先flattern左子树，在flattern右子树，然后把flattern后的左子树的尾巴连上falttern后的右子树的头
>
```js
//典型后序位置写逻辑：先flattern左子树，在flattern右子树
var flatten = function(root) {
    if(!root) return;
    
    flatten(root.left);
    flatten(root.right);
    
    /**** 后序遍历位置 ****/
    // 1、左右子树已经被拉平成一条链表
    let left = root.left;
    let right = root.right;
    
    // 2、将左子树作为右子树
    root.left = null;
    root.right = left;
    
    // 3、将原先的右子树接到当前右子树的末端
    //一路向东找到最右节点
    let node = root; //这里巧妙之处在于已经包含了如果原来root.left是null的状况
    while(node.right) {
        node = node.right;
    }

    node.right = right;
};
```
```python
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        # 每个节点上要干啥？啥时候干？
        # 分治思路：先flatten左子树，再flattern右子树，然后左子树的尾巴连上右子树的头
        if not root:
            return 

        self.flatten(root.left)
        self.flatten(root.right)

        # node = root.left
        # while node and node.right:
        #     node = node.right
        # if node:
        #     node.right = root.right
        #     root.right = root.left
        #     root.left = None
        
        # 用一个更简洁的写法来避开左子树的null check：找左子树的尾巴
        right = root.right 
        root.right = root.left
        root.left = None
        node = root
        while node.right:
            node = node.right
        node.right = right
```

**[思路II]** 分治法
```js
var flatten = function(root) {
    traverse(root);
};
    
const traverse = (root) => {
    if(!root) return null;
    
    let left = traverse(root.left);
    let right = traverse(root.right);
    
    if(left) {
        root.left = null;
        root.right = left;
    
        //traverse to the end
        let node = left;
        while(node.right){
            node = node.right;
        }

        node.right = right;
    }
    
    return root;
}
```
```python
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        # 每个节点上要干啥？啥时候干？
        # 分治思路：先flatten左子树，再flattern右子树，然后左子树的尾巴连上右子树的头
        def div_con(node: Optional[TreeNode]) -> Optional[TreeNode]:
            if not node:
                return None
            left = div_con(node.left)
            right = div_con(node.right)

            node.left = None
            node.right = left

            nxt = node
            while nxt.right:
                nxt = nxt.right
            nxt.right = right

            return node
        
        div_con(root)
```
##### 寻找重复的子树
[652 寻找重复的子树（中等）](https://leetcode.com/problems/find-duplicate-subtrees/) 
**[思路]** 用一个cache，把每个子树的遍历序列化答案cache起来。
> 这题呢本质上是对二叉树序列化(前序遍历结果)的一个应用，不过呢，需要你对前序遍历的结果进行后序处理，就是类似于遍历过程中要夹带私货的去处理额外的东西（这里就是查重）
>
> 这种把子问题结果缓存到memory里的做法就是之后动态规划中的memoization
```js
var cache = {};
var res;
var findDuplicateSubtrees = function(root) {
    cache = {};
    res = [];
    traverse(root);
    return res;
};

const traverse = (root) => {
    if(!root) return '#';
    
    let left = traverse(root.left);
    let right = traverse(root.right);
    
    let key = root.val + '_' + left + '_' + right;
    
    if(cache[key]){
        if (cache[key]==1) res.push(root);
        cache[key]++;
    } else {
        cache[key] = 1;
    }
    
    return key;
}
```

```python
class Solution:
    def findDuplicateSubtrees(self, root: Optional[TreeNode]) -> List[Optional[TreeNode]]:
        res = []
        cache = {}
        # 每个节点的前序遍很容易写吧？
        def traverse(node: Optional[TreeNode]):
            if not node:
                return '#'
            left = traverse(node.left)
            right = traverse(node.right)
            pre_order = str(node.val)+'_'+left+'_'+right
            if pre_order in cache:
                if cache[pre_order]==1:
                    res.append(node)
                cache[pre_order] = cache[pre_order]+1
            else:
                cache[pre_order] = 1

            return pre_order

        traverse(root)
        return res
```
##### 填充每个节点的下一个右侧节点指针
[116 填充每个节点的下一个右侧节点指针（中等）](https://leetcode.com/problems/populating-next-right-pointers-in-each-node/) 
```python
class Solution:
    def connect(self, root: 'Optional[Node]') -> 'Optional[Node]':
        def connect_two(node1, node2):
            node1.next = node2
            if node1.left:
                connect_two(node1.left, node1.right)
                connect_two(node1.right, node2.left)
                connect_two(node2.left, node2.right)
        
        if root and root.left:
            connect_two(root.left, root.right)
        return root;
```

##### 统计最高分的节点数目
[2049 统计最高分的节点数目](https://leetcode.com/problems/count-nodes-with-the-highest-score/)
> **[思路]** 先根据输入的parents数组把二叉树建出来，然后用一个map来cache把每个节点删除时候形成的乘积。最后for循环这个map找到最大的乘积，并返回最大乘积对应的数值
```js
/**
 * @param {number[]} parents
 * @return {number}
 */
var countHighestScoreNodes = function(parents) {
    let n = parents.length;
    let root = buildATree(parents);
    
    let map = {};
    countNodes(root, n, map);
    
    let highestScore = 0;
    for(const key of Object.keys(map)){
        highestScore = Math.max(highestScore, key);
    }
    
    return map[highestScore];
    
};

const countNodes = (root, n, map) => {
    if(!root) return 0;
    let leftCount = countNodes(root.left,n, map);
    let rightCount = countNodes(root.right,n, map);
    let otherCount = n-leftCount-rightCount==1?1:n-leftCount-rightCount-1;
    
    let prod = (leftCount==0?1:leftCount)*(rightCount==0?1:rightCount)*otherCount;
    if(!map[prod]){
        map[prod]=1;
    } else {
        map[prod]++;
    }
    
    return 1+leftCount+rightCount;
}

const buildATree = (parents) => {
    if(parents.length<=0) return null;
    
    //find root
    let rootIdx = -1;
    let nodes = Array(parents.length);
    for(const [i, v] of parents.entries()){
        if(!nodes[i]){
            nodes[i] = new TreeNode(i);
        }
        if(v==-1){
            rootIdx=i;
            continue;
        }
        if(!nodes[v]){
            nodes[v] = new TreeNode(v);
        }
        
        if(!nodes[v].left){
            nodes[v].left = nodes[i];
        } else {
            nodes[v].right = nodes[i];
        }
    }
    
    return nodes[rootIdx];
}
```