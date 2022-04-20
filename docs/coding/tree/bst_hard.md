# 二叉搜索树的一些非常规题

#### **重要讲一下面试重点实际题**
> 1. [Google - 带size参数的二叉搜索树](#带size参数的二叉搜索树)

### 带size参数的二叉搜索树
[Google - 带size参数的二叉搜索树]()
> 原题：
> Implement function: Node select(Node root, int i);
> Find the i-th (0-based) smallest node in the BST.
>
> Below is the signature of the Node class:
```java
class Node {
  Node left, right;
  int size;  // pre-populated
  Node parent;
}
```
>
> i is the index or order of a node in the BST; i is 0-based
>
>                  10 (size=6, i = 4, rank =4)   
>
>               /       \
>
>             7         18 (size= 2, i = 5, rank=6)
>
>          /     \       / 
>
>        4      9   12     

?> **思路** 这题的核心是说BST中的每个节点都自带一个size的参数，这个size表示以这个节点为根的子树的节点总数。基于BST左小右大的特性，每个节点node的左儿子节点的size参数其实就是代表了这个node的排名。进阶一点思考，你可以想象为在树形结构里构建了类似array里的index索引的概念。

```js
var select = function(root, i) {
    let leftSize = root.left?root.left.size:0;
    
    if(i==leftSize) return root;
    
    if(i<leftSize){
        select(root.left, i-1);
    }
    else {
        select(root.right, i-leftSize-1);
    }
};
```