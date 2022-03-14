# 二叉树后序遍历的题型
- [刷题列表(6道)](#刷题列表)

这类题主要有意思的地方在于`都涉及跨越左右子树找答案`的情况。

1. 首先，需要跨越左右，所以后序遍历位置的代码是毫无疑问了，
2. 而且这些题都得用到分治法概念，因为左右子树都得return他们各自的答案，这个各自子树的return并非直接跟题目要求的最终答案一致。
3. 因此要同时需要维护一个global variable，目的在于能够在traversal的过程中把目前已知的最佳答案cache起来。

**敲黑板**：如果你感觉需要多次遍历二叉树了，说明你的后序遍历没写好。

#### **刷题列表**
###### [543 二叉树直径](#二叉树直径)
###### [124 二叉树的最大路径和](#二叉树的最大路径和)
###### [687 最长重复值路径](#最长重复值路径)
###### [1339 分割二叉树的最大乘积](#分割二叉树的最大乘积)
###### [2049 二叉树最大乘积分割](#二叉树最大乘积分割)
###### [1373 二叉搜索树中的最大子树和](#二叉搜索树中的最大子树和)


##### 二叉树直径
[543 二叉树直径](https://leetcode.com/problems/diameter-of-binary-tree/) **[思路]** 维护一个maxDiameter的global参数，然后分治函数里返回子树的最大深度并打擂台maxDiameter
```js
var maxDiameter = 0;
//典型的后序遍历/分治代码 -> 直径 = 左子树最大深度 + 右子树最大深度
var diameterOfBinaryTree = function(root) {
    maxDiameter = 0;
    maxDepth(root);
    return maxDiameter;
};

const maxDepth = (root) => {
    if(!root) return 0;
    
    let left = maxDepth(root.left);
    let right = maxDepth(root.right);
    let depth = Math.max(left, right)+1;
    let diameter = left + right;
    maxDiameter = Math.max(diameter, maxDiameter);
    return depth;
}
```
##### 二叉树的最大路径和
[124 二叉树的最大路径和](https://leetcode.com/problems/binary-tree-maximum-path-sum/) **[思路]** 维护一个maxDiameter的global参数，然后分治函数里返回子树的最大深度并打擂台maxSum
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
//典型的后序遍历/分治代码
var maxSum = -Number.MAX_VALUE;
var maxPathSum = function(root) {
    maxSum = -Number.MAX_VALUE;
    traverse(root);
    return maxSum;
};

const traverse = (root) => {
    if(!root) return -Number.MAX_VALUE;
    
    let left = traverse(root.left);
    let right = traverse(root.right);
    //用maxSum跟三个参数大擂台：root本身值，root本身+左子树，root本身+右子树，root本身+左子树+右子树
    //注意这里没必要再跟左子树和右子树大擂台，因为这个在下层递归里处理过了
    maxSum = Math.max(maxSum, root.val, root.val+left, root.val+right, left+root.val+right);
    
    return Math.max(root.val, root.val+left, root.val+right);
}
```
##### 最长重复值路径
[687 最长重复值路径](https://leetcode.com/problems/longest-univalue-path/) **[思路]** 维护一个res的global参数。这里有个小技巧就是要传入父节点的值val，因为可以根据当前根节点与父节点是否同值来决定返回0还是路径延长
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var res = 0;
var longestUnivaluePath = function(root) {
    res = 0;
    if(!root) return 0;
    traverse(root, root.val);
    return res;

};

const traverse = (root, val) => {
    if(!root) return 0;
    
    //如果当前root.val和传入的val是不同的，这个left会是0；
    let left = traverse(root.left, root.val); 
    let right = traverse(root.right, root.val);
    
    res = Math.max(res, left+right);
    return root.val==val?Math.max(left, right)+1:0;
    
}
```
**[思路II]** 依旧是维护一个res的global参数。但是能不能不传入父节点的值val？答案是可以的，因为可以向左向右peek
```js
var res = 0;
var longestUnivaluePath = function(root) {
    res = 0;
    if(!root) return 0;
    traverse(root);
    return res;

};

const traverse = (root) => {
    if(!root) return 0;
    
    //如果当前root.val和传入的val是不同的，这个left会是0；
    let left = traverse(root.left); 
    let right = traverse(root.right);

    if(root.left && root.left.val == root.val){
        left++;
    } else {
        left = 0;
    }

    if(root.right && root.right.val == root.val){
        right++;
    } else {
        right = 0;
    }
    
    res = Math.max(res, left+right);
    return Math.max(left, right);
    
}
```
##### 分割二叉树的最大乘积
[1339 分割二叉树的最大乘积](https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/) **[思路]** 维护一个maxProd的global参数，然后分治函数里返回子树的节点和并打擂台maxProd
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxProd = 0;
var total = 0;
var maxProduct = function(root) {
    maxProd = 0;
    total = 0;
    total = treeSum(root);
    treeSum(root);
    return maxProd % (Math.pow(10,9) + 7);
};

const treeSum = (root) => {
    if(!root) return 0;
    
    let left = treeSum(root.left);
    let right = treeSum(root.right);
    
    maxProd = Math.max(maxProd, (left)*(total-left), (right)*((total-right)));
    return root.val+left+right;
    
}
```
##### 二叉树最大乘积分割
[2049 二叉树最大乘积分割](https://leetcode.com/problems/count-nodes-with-the-highest-score/) **[思路]** 先根据输入的parents数组把二叉树建出来，然后用一个map来cache把每个节点删除时候形成的乘积。最后for循环这个map找到最大的乘积，并返回最大乘积对应的数值
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
##### 二叉搜索树中的最大子树和
[1373 二叉搜索树中的最大子树和](https://leetcode.com/problems/maximum-sum-bst-in-binary-tree) **[思路]** 维护一个maxVal的global变量，然后分治遍历，在后序遍历位置维护这样一个数组[isBST（子树是不是BST）, 以root为根的子树最小值, 以root为根的子树最大值, subTreeSum（子树的节点和）]
```js
let maxVal = -Number.MAX_VALUE;
var maxSumBST = function(root) {
    maxVal = -Number.MAX_VALUE;
    traverse(root);
    return maxVal<0?0:maxVal;
};

//返回[isBST, 以root为根的子树最小值, 以root为根的子树最大值, subTreeSum]
const traverse = (root) => {
    if(!root) {
        return [true, Number.MAX_VALUE, -Number.MAX_VALUE, 0];
    }
    
    let leftRes = traverse(root.left);
    let rightRes = traverse(root.right);
    
    let res = [];
    
    if(leftRes[0] && rightRes[0] && root.val>leftRes[2] && root.val<rightRes[1]){
        res[0] = true;
        // 计算以 root 为根的这棵 BST 的最小值
        res[1] = Math.min(leftRes[1], root.val);
        // 计算以 root 为根的这棵 BST 的最大值
        res[2] = Math.max(rightRes[2], root.val);
        // 计算以 root 为根的这棵 BST 所有节点之和
        res[3] = leftRes[3] + rightRes[3] + root.val;
        // 更新全局变量
        maxVal = Math.max(maxVal, res[3]);
    }
    else {
        res[0] = false;
        //其他没必要计算了
    }
         
    return res;
}
```
