# 递归转迭代
- [刷题列表(6道)](#刷题列表)

递归做法写起来非常简洁易懂，但是随着程序员行业的内卷，越来越多公司的面试官经常想考察candidate的迭代写码能力。

简单总结一下递归转迭代的几种应用情况：
1. [permutation相关]()
1. [二叉树的前中后序遍历](#二叉树的前中后序遍历)
1. [表达式的分解]()
1. [二叉搜索树的迭代器](#二叉搜索树的迭代器)

不管那种递归转迭代的问题，stack是一定会用到的数据结构。

**敲黑板**：这篇文章很多模板需要`**熟练背诵**`！

##### 二叉树的前中后序遍历
这里主要是怎么用迭代的方法把递归版的前中后序遍历转化成迭代写法：

**递归模板**
```js
const traverse = (root) => {
    if(!root) return;
    /*前序遍历位置*/
    traverse(root.left);
    /*中序遍历位置*/
    traverse(root.right);
    /*后序遍历位置*/
}
```
**迭代模板**
```js
const traverse = (root, stk) => {
    //用visited指针真想上次遍历完成的子树根节点
    let visited = new TreeNode(-1); 
    pushLeftBranch(root, stk);
    while(stk.length>0){
        let p = stk[stk.length-1];

        //p的左子树遍历完了，而且右子树没有被遍历
        if((!p.left || p.left == visited) && p.right !=visited) {
            /*中序遍历位置*/
            ...
            //去遍历右子树
            pushLeftBranch(p.right, stk);
        }
        
        //p的左右子树都遍历完了
        if(!p.right || p.right == visited) {
            /*后序遍历位置*/
            ...
            visited = stk.pop();
        }
    }
}
const pushLeftBranch(root, stk) => {
    while(root) {
        /*前序遍历位置*/
        ...
        stk.push(root);
        root = root.left;
    }
}
```
1. [144 二叉树的前序遍历](https://leetcode.com/problems/binary-tree-preorder-traversal/) **纯练习**
```js
var stk = [];
var res = [];
var preorderTraversal = function(root) {
    //纯练手
    stk = [];
    res = [];
    
    pushLeftBranch(root);
    let visited = new TreeNode(-1);
    while(stk.length>0){
        let p = stk[stk.length-1];
        if((!p.left || p.left==visited) && p.right != visited){
            pushLeftBranch(p.right);
        }

        if(!p.right || p.right==visited){
            visited=stk.pop();
        }
    }
    
    return res;
}
const pushLeftBranch = (root) => {
    while(root){
        res.push(root.val);
        stk.push(root);
        root=root.left;
    }
}
```

##### 二叉搜索树的迭代器

**BST迭代器，请务必背诵**
```js
class BST {
    constructor(root){
        this.stk = [];
        while(root){
            this.stk.push(root);
            root = root.left;
        }
    }

    next() {
        let cur = this.stk[this.stk.length-1];
        let node = cur;
        if(!node.right){
            //next节点不存在右子树，那就一直退栈
            //直到碰到第一个有左拐的节点
            node = this.stk.pop(); //这里要记得pop()掉最后一个节点
            while(this.stk.length>0 && this.stk[this.stk.length-1].right == node){
                node = this.stk.pop();
            }
        } else {
            //next节点存在右子树，那就简单了 
            //一路向西压栈就好了
             node = node.right;
            while(node) {
                this.stk.push(node);
                node = node.left;
            }
        }

        return cur;
    }

    hasNext() {
        return this.stk.length>0;
    }
}
```

#### **刷题列表**
###### [104 二叉树最大深度 (简单)](#二叉树最大深度)
###### [144 二叉树的前序遍历（简单）](#二叉树的前序遍历)
###### [226 翻转二叉树（简单）](#二叉树的最大路径和)
###### [114 二叉树展开为链表（中等）](#二叉树展开为链表)
###### [652 寻找重复的子树（中等）](#寻找重复的子树)
###### [116 填充每个节点的下一个右侧节点指针（中等）](#填充每个节点的下一个右侧节点指针)

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