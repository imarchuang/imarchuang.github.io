# 二叉树的两类思路：遍历法和分治法
- [刷题列表(6道)](#刷题列表)

这类题通常都相对简单，说白了就是二叉树模板的套用。理论上讲，如果一道题可以用遍历法解决，几乎可以肯定这道题也可以用分治法解决。只不过很多时候用分治法写出来的代码更容易让别人看懂。

这篇会尽量用两类思路（遍历法和分治法）来解题。**重要的事情说三遍**：一定要先思考对于每一个节点上，它需要做什么！！！

**敲黑板**：二叉树的遍历模板很简单但是`**狠狠重要**`，这是后序回溯思维的基础。这里再贴一遍二叉树遍历模板：

#### **刷题列表**
1. [104 二叉树最大深度 (简单)](#二叉树最大深度)
1. [144 二叉树的前序遍历（简单）](#二叉树的前序遍历)
1. [226 翻转二叉树（简单）](#二叉树的最大路径和)
1. [114 二叉树展开为链表（中等）](#二叉树展开为链表)
1. [652 寻找重复的子树（中等）](#寻找重复的子树)
1. [116 填充每个节点的下一个右侧节点指针（中等）](#填充每个节点的下一个右侧节点指针)


##### 二叉树最大深度
[104 二叉树最大深度 (简单)](https://leetcode.com/problems/maximum-depth-of-binary-tree/)

**[思路I]** 用分治法
```js
var maxDepth = function(root) {
    if(!root) return 0;
    
    let left = maxDepth(root.left);
    let right = maxDepth(root.right);
    
    return Math.max(left, right)+1;
};
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

##### 二叉树的前序遍历
[144 二叉树的前序遍历](https://leetcode.com/problems/binary-tree-preorder-traversal/) 
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
##### 翻转二叉树
[226 翻转二叉树（简单）](https://leetcode.com/problems/invert-binary-tree/) 
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
##### 二叉树展开为链表
[114 二叉树展开为链表（中等）](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/) 

**[思路]** 遍历法
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
##### 寻找重复的子树
[652 寻找重复的子树（中等）](https://leetcode.com/problems/find-duplicate-subtrees/) **[思路]** 用一个cache，把每个子树的遍历序列化答案cache起来。
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
##### 填充每个节点的下一个右侧节点指针
[116 填充每个节点的下一个右侧节点指针（中等）](https://leetcode.com/problems/populating-next-right-pointers-in-each-node/) **[思路]** 先根据输入的parents数组把二叉树建出来，然后用一个map来cache把每个节点删除时候形成的乘积。最后for循环这个map找到最大的乘积，并返回最大乘积对应的数值
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