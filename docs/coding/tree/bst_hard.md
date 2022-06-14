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
>                  10 (size=6, i = 4, rank=5)   
>
>               /       \
>
>             7 （2）      18 (size= 2, i = 5, rank=6)
>
>          /     \       / 
>
>        4 (0)    9(0)   12 （0）   

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

> 还是上题的数据结构，Node里自带size，还带parent指针，问：
>
> Implement: int rank(Node node)
>
> rank = index + 1, with index is the order of a node in the BST
>
> [wiki细节原文](https://en.wikipedia.org/wiki/Order_statistic_tree)
>
?> **思路** 这题的就是说给出一个节点（可以是树里的任何一个节点），求此节点在整棵树里的大小排名；这里的思路就是**自底向上思考直到遇到root节点**，因为root节点的rank就是`root.left.size+1`。就像上边说的，通过这个size，你可以想象为在树形结构里构建了类似array里的index索引的概念，又通过parent指针，可以很容易的往上找到父节点直至根节点。
```js
const rank = (node) => {
    //base case
	if(!node.parent) {
		return node.left.size+1;
	}
	//check if left
	if(node.parent && node.parent.left==node){
		return rank(node.parent)-node.right.size;
    } 

    if(node.parent && node.parent.right==node){
        return rank(node.parent)+node.left.size+1;
    } 

}
```
> 当然，这题的迭代遍历写法也很直接：
```java
private int rank(Node node) {
  If (node == null) return -1;
  int rank = node.left == null ? 0: node.left.size;
  while(node.parent !=null) { //自底而上找root根节点
     if (node == node.parent.right) {
        rank += node.parent.left == null ? 0: node.parent.left.size
     }
     node = node.parent
  }

  return rank
}
```

### Ripple真题 - 带parent指针的多叉树

> Given an n-ary tree, find the smallest subtree that contains all of the deepest nodes.
```java
//            a
//         /  |  \
//        /   |   \
//       b    c     d
//     /   \        |
//    e     f       g
//   /     / \
//  h     i   j
```
> Depth of tree: 4
> Deepest nodes: [h, i, j]
> Lowest common ancestor of deepest nodes: b

```java
class Solution {
  public static void main(String[] args) {

    Node a = new Node("a", null);
    Node b = new Node("b", a);
    Node c = new Node("c", a);
    Node d = new Node("d", a);
    Node e = new Node("e", b);
    Node f = new Node("f", b);
    Node g = new Node("g", d);
    Node h = new Node("h", e);
    Node i = new Node("i", f);
    Node j = new Node("j", f);

    // TODO find the lowest common ancestor
     // findLCA(a) -> b

    Solution sol = new Solution();
    List<Node> res = sol.getDeepestLeaves(a);
    // for(Node n : res) {
    //   System.out.println(n.name);
    // }
    Node lcs = sol.getLCS(res);
    System.out.println(lcs.name);
  }

  private List<Node> getDeepestLeaves(Node root){

    Queue<Node> queue= new LinkedList<>();
    queue.offer(root);
    int step = 0;

    List<Node> res = null;
    while(!queue.isEmpty()){
      int sz = queue.size();
      res = new ArrayList<>();
      for(int i=0; i<sz; i++){
        Node cur = queue.poll();
        res.add(cur);
        for(Node child : cur.getChildren())
          queue.offer(child);
      }
    }

    return res;

  }

  private Node getLCS(List<Node> nodes){
    if(nodes.size()<=0) return null;
    Set<Node> resSet = new HashSet<>();
    while(true){
      for(Node n : nodes){
        resSet.add(n.getParent());
      }
      nodes = new ArrayList<>(resSet);
      if(nodes.size()==1) break;
      resSet = new HashSet<>();
    }

    return nodes.get(0);

  }

  private static class Node {

    private final String name;

    private final Node parent;

    private final Set<Node> children = new HashSet<>();

    private Node(String name, Node parent) {
      this.name = name;
      this.parent = parent;
      if (this.parent != null) {
        this.parent.addChild(this);
      }
    }

    private void addChild(Node child) {
      this.children.add(child);
    }

    private Set<Node> getChildren() {
      return this.children;
    }

    private Node getParent() {
      return this.parent;
    }

    /**
     * only comparing name for efficiency
     * @param o
     * @return
     */
    @Override
    public boolean equals(Object o) {
      if (this == o) {
        return true;
      }
      if (o == null || getClass() != o.getClass()) {
        return false;
      }
      Node node = (Node) o;
      return Objects.equals(name, node.name);
    }

    /**
     * only comparing name for efficiency
     * @return
     */
    @Override
    public int hashCode() {
      return Objects.hash(name);
    }

    @Override
    public String toString() {
      return this.name;
    }
  }

}
```