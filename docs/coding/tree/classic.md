# 二叉树的经典题

#### **刷题列表**
> 1. [236. 二叉树的最近公共祖先 (中等)](#二叉树的最近公共祖先)

### 二叉树的最近公共祖先
[236. 二叉树的最近公共祖先 (中等)](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)
?> **思路**

```js
var lowestCommonAncestor = function(root, p, q) {
    if(!root) return null;
    
    if(root==p || root==q) return root;
    
    let left = lowestCommonAncestor(root.left, p, q);
    let right = lowestCommonAncestor(root.right, p, q);
    
    if(left && right) return root;
    
    if(!left) return right;
    if(!right) return left;
};
```