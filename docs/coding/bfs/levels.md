# 二叉树的层级遍历

!> 说的二叉树层级遍历，如果题目不要求在最小的层数结束，其实BFS和DFS思路都是可行的，这篇文章对相应的题会展示两个思路的解法，以加深对BFS和DFS的理解。

> 这篇文章里会用DFS思路去解决涉及到层级遍历的题，这里有个通用的思维框架，其实就是回溯框架的缩小版应用在二叉树上。`depth++`就是做选择，`depth--`就是撤销选择。

```js
const traverse = (root, depth, res) => {
    if(!root) return;
    if(res.length<depth){
        //说明是这一层的第一个元素，该做点啥...
        //比如说 res.push([root.val, 1]);
    } else {
        //说明已经不是这一层的第一个元素，该做点啥...
        //比如说，res[depth-1] = ...;
    }
    
    depth++;
    traverse(root.left, depth, res);
    traverse(root.right, depth, res);
    depth--;
}
```

### **刷题列表**
1. [111. 二叉树的最小深度（简单）](#二叉树的最小深度)
1. [107. 二叉树的层级遍历II（中等）](#二叉树的层级遍历II)
1. [637. 二叉树的层级平均值（简单）](#二叉树的层级平均值) 
1. [199. 二叉树的右侧视角（中等）](#二叉树的右侧视角)

### 二叉树的最小深度
[111. 二叉树的最小深度（简单）](https://leetcode.com/problems/minimum-depth-of-binary-tree/)

?> **思路** 这题有点找最短路径的感觉，所以BFS解法是最优的。

```js
//典型的BFS，找无权重的最短路径
var minDepth = function(root) {
    if(!root) return 0;
    
    //BFS 框架
    let q = [root];
    
    let step = 1;
    while(q.length>0){
        
        let sz = q.length;
        /* 将当前队列中的所有节点向四周扩散 */
        for (let i = 0; i < sz; i++) {
            let node = q.shift();
            /* 判断是否到达终点 */
            if(!node.left && !node.right) return step;
            //搜索它的邻居们
            if(node.left) {
                q.push(node.left);
            }

            if(node.right) {
                q.push(node.right);
            }
            
        }
        /* 这里增加步数 */
        step++;
        
    }
    
    return step;
    
}; 
```

### 二叉树的层级遍历II
[107. 二叉树的层级遍历II（中等）](https://leetcode.com/problems/binary-tree-level-order-traversal-ii/) 

?> **思路** 这题肯定需要遍历所有节点，所以BFS和DFS都是可行的。

```js
//DFS的解法，重点是维护一个global变量depth，然后做选择就是depth++，撤销选择就是depth--;
var depth=1;
var levelOrderBottom = function(root) {
    let res = [];
    traverse(root, res);
    return res.reverse();
};

const traverse =(root, res) => {
    if(!root) return;
    
    if(res.length < depth){
        res.push([root.val]);
    } else {
        res[depth-1].push(root.val);
    }
    depth++;
    traverse(root.left, res);
    traverse(root.right, res);
    depth--;
}
```
```js
//BFS 的解法，经典的维护一个queue
var levelOrderBottom = function(root) {
    let res = [];
    if(!root) return [];
    let q = [root];
    while(q.length>0){
        let size = q.length;
        let path = [];
        for(let i=0; i<size; i++){
            let cur = q.shift();
            path.push(cur.val);
            if(cur.left) q.push(cur.left);
            if(cur.right) q.push(cur.right);
        }
        res.push([...path]);
    }
    return res.reverse();
};
```

### 二叉树的层级平均值
[637. 二叉树的层级平均值（简单）](https://leetcode.com/problems/average-of-levels-in-binary-tree/) https://leetcode.com/problems/average-of-levels-in-binary-tree/)

?> **思路** 这题肯定需要遍历所有节点，所以BFS和DFS都是可行的。

```js
//DFS思路
var averageOfLevels = function(root) {
    let res = [];
    traverse(root, 1, res);
    return res.map(x=>x[0]);
};

const traverse = (root, depth, res) => {
    if(!root) return;
    if(res.length<depth){
        //说明是这一层的第一个元素
        res.push([root.val, 1]);
    } else {
        let cnt = res[depth-1][1]+1;
        let avg = (res[depth-1][0]*res[depth-1][1]+root.val)/cnt;
        res[depth-1] = [avg, cnt];
    }
    
    depth++;
    traverse(root.left, depth, res);
    traverse(root.right, depth, res);
    depth--;
}
```
```js
//简单易懂的BFS思路
var averageOfLevels = function(root) {
    //典型的level order traversal
    let q = [root];
    
    let res = [];
    while(q.length>0) {
        let size = q.length;
        let sum = 0;
        for(let i=0; i<size; i++){
            let cur = q.shift();
            sum += cur.val;
            if(cur.left) q.push(cur.left);
            if(cur.right) q.push(cur.right);
        }
        res.push(sum/size);
    }
    
    return res;
};
```

### 二叉树的右侧视角
[199. 二叉树的右侧视角（中等）](https://leetcode.com/problems/binary-tree-right-side-view/) 

?> **思路** 这题肯定需要遍历所有节点，所以BFS和DFS都是可行的。

```js
//DFS思路，注意先遍历右儿子，然后去左儿子
var rightSideView = function(root) {
    let res=[];
    traverse(root, 0, res);
    return res;
};

const traverse = (root, depth, res) => {
    if(!root) return;
    
    // 前序遍历位置
    depth++;
    if(res.length<depth){
        // 这一层还没有记录值
        // 说明 root 就是右侧视图的第一个节点
        res.push(root.val);
    }
    // 注意，这里反过来，先遍历右子树再遍历左子树
    // 这样首先遍历的一定是右侧节点
    traverse(root.right, depth, res);
    traverse(root.left, depth, res);
    // 后序遍历位置
    depth--;
}
```
```js
//经典的BFS思路
var rightSideView = function(root) {
    let res=[];
    if(!root) return res;
    
    let q=[root];
    while(q.length>0){
        let size = q.length;
        for(let i=0; i<size; i++){
            let cur = q.shift();
            if(i==size-1) {
                res.push(cur.val);
            }
            
            if(cur.left) q.push(cur.left);
            if(cur.right) q.push(cur.right);
        }
    }
    return res;
};
```