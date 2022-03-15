# 二叉树的构建
- [刷题列表(4道)](#刷题列表)

**重要的事情说三遍**：一定要自顶而下的考虑，先思考怎么构造出根节点和其左右儿子！！！

#### **刷题列表**
1. [654. 最大二叉树（中等）](#最大二叉树)
1. [105. 从前序与中序遍历序列构造二叉树（中等）](#从前序与中序遍历序列构造二叉树)
1. [106. 从中序与后序遍历序列构造二叉树（中等）](#从中序与后序遍历序列构造二叉树)
1. [889. 根据前序和后序遍历构造二叉树（中等）](#根据前序和后序遍历构造二叉树)


在讲解[2049 二叉树最大乘积分割](./coding/tree/postorder?id=二叉树最大乘积分割)这题的时候，我们已经看到了通过parents数组构建出一个二叉树。那种构建法其实比较不常见。这篇文章我们讲解几道比较常见的二叉树构造法。
```js
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

##### 最大二叉树
[654. 最大二叉树（中等）](https://leetcode.com/problems/maximum-depth-of-binary-tree/)

**[思路I]** for循环nums数组找最大值，然后递归形式去构建左儿子右儿子
```js
var constructMaximumBinaryTree = function(nums) {
    //常规解法，for循环nums数组
    return buildATree(nums, 0, nums.length-1);
    
};

const buildATree = (nums, start, end) => {
    
    //base case
    if(start>end) return null;
    
    //先找根节点
    let maxPos = -1;
    let max = -1;
    
    for(let i=start; i<=end; i++){
        if(nums[i]>max){
            maxPos = i;
            max = nums[i];
        }
    }
    
    let root = new TreeNode(max);
    root.left = buildATree(nums, start, maxPos-1);
    root.right = buildATree(nums, maxPos+1, end);
    
    return root;
}
```
**[思路II]** 用单调栈，这个具有一定技巧性
```js
var constructMaximumBinaryTree = function(nums) {
    //用单调栈
    let stack = [];
    
    //弄清楚两个核心：1.节点的父节点是谁？2.是父节点的做儿子还是右儿子？
    for(let i=0; i<nums.length; i++){
        let cur = nums[i];
        let curNode = new TreeNode(cur);
        
        //如果stk中的最后一个节点比新节点小
        while(stack.length>0 && stack[stack.length-1].val<=cur){
            let top = stack.pop();
            //当前新节点的左子树为stk的最后一个节点
            curNode.left = top;
        }
        
        //如果stk不为空
        if(stack.length>0){
            stack[stack.length-1].right = curNode; //将新节点设为stk最后一个节点的右子树
        }	
        
        stack.push(curNode);
    }
    
    return stack[0];
};

```

##### 从前序与中序遍历序列构造二叉树
[105. 从前序与中序遍历序列构造二叉树（中等）](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) 
```js
var buildTree = function(preorder, inorder) {
    return buildATree(preorder, 0, preorder.length-1, inorder, 0, inorder.length-1);
};

//都是闭区间
const buildATree = (preorder, begin, end, inorder, left, right) => {
    if(begin > end) return null;
    //先找preorder[begin]在inorder中的位子
    let rootVal = preorder[begin];
    let rootPos = -1;
    for(let i=left; i<=right; i++){
        if(inorder[i] == rootVal){
            rootPos=i;
            break;
        }
    }
    
    let root = new TreeNode(rootVal);
    let leftLen = rootPos-left, rightLen=right-rootPos;
    root.left = buildATree(preorder, begin+1, begin+leftLen, inorder, left, rootPos-1);
    root.right = buildATree(preorder, begin+leftLen+1, end, inorder, rootPos+1, right);
    
    return root;
}
```
##### 从中序与后序遍历序列构造二叉树
[106. 从中序与后序遍历序列构造二叉树（中等）](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) 
```js
var buildTree = function(inorder, postorder) {
    return constructTree(inorder, 0, inorder.length-1, postorder, 0, postorder.length-1); 
};

//两个闭区间【i，j】【x，y】
const constructTree = (inorder, i, j, postorder, x, y) => {
    if(i>j) return null;
    let root = new TreeNode(postorder[y]);
    if(i==j){
        return root;
    }
    //找分界坐标pos
    let pos=-1;
    for(let a=i; a<=j; a++){
        if(inorder[a]==postorder[y]){
            pos=a;
            break;
        }
    }
    
    root.left=constructTree(inorder, i, pos-1, postorder, x, x+(pos-i-1));
    root.right=constructTree(inorder, pos+1, j, postorder, x+(pos-i), y-1);
    
    return root;
}
```
##### 根据前序和后序遍历构造二叉树
[889. 根据前序和后序遍历构造二叉树（中等）](https://leetcode.com/problems/find-duplicate-subtrees/) **[思路]** 用一个cache，把每个子树的遍历序列化答案cache起来。
```js
var constructFromPrePost = function(preorder, postorder) {
    return build(preorder, 0, preorder.length - 1,
                postorder, 0, postorder.length - 1);
};

const build = (preorder, preStart, preEnd,
                   postorder, postStart, postEnd) => {
    if (preStart > preEnd) {
        return null;
    }
    if (preStart == preEnd) {
        return new TreeNode(preorder[preStart]);
    }

    // root 节点对应的值就是前序遍历数组的第一个元素
    let rootVal = preorder[preStart];
    // root.left 的值是前序遍历第二个元素
    // 通过前序和后序遍历构造二叉树的关键在于通过左子树的根节点
    // 确定 preorder 和 postorder 中左右子树的元素区间
    let leftRootVal = preorder[preStart + 1];
    // leftRootVal 在后序遍历数组中的索引
    let index = 0;
    for (let i = postStart; i < postEnd; i++) {
        if (postorder[i] == leftRootVal) {
            index = i;
            break;
        }
    }
    // 左子树的元素个数
    let leftSize = index - postStart + 1;

    // 先构造出当前根节点
    let root = new TreeNode(rootVal);
    // 递归构造左右子树
    // 根据左子树的根节点索引和元素个数推导左右子树的索引边界
    root.left = build(preorder, preStart + 1, preStart + leftSize,
            postorder, postStart, index);
    root.right = build(preorder, preStart + leftSize + 1, preEnd,
            postorder, index + 1, postEnd - 1);

    return root;
}

```