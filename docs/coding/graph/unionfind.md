# 并查集 Union-Find

**并查集应用** 并查集主要解决图论中`动态连通性`的问题，可以用来算Kruskal算法的最小扩展树，用在编译器判断同一个变量的不同引用，或者用在社交网络中的朋友圈计算等等。

!> **总结** 何谓动态连通性？假设给你10个点，他们互不相连，如下图：
> ![](./pictures/uf0.jpeg)
> 因为任意两个不同的点都不连通，所以它的`连通分量`就是10.
> ![](./pictures/uf1.jpeg)
> 如果现在调用`union(0, 1)`，那么 0 和 1 被连通，连通分量降为 9 个； 再调用`union(1, 2)`，这时 0,1,2 都被连通，调用`connected(0, 2)`也会返回 true，连通分量变为 8 个。

> **Union-Find**要实现两个API，一个是Union，一个是connected：
```js
class UnionFind {
    constructor(){

    }
    
    union(p, q) {
        /* 将 p 和 q 连接 */
    }

    connected(p, q) {
        /* 判断 p 和 q 是否连通 */
    }

    count() {
        /* 返回图中有多少个连通分量 */
    }

}
```
> 这里所说的「连通」是一种等价关系，也就是说具有如下三个性质：
> 1. 自反性：节点 p 和 p 是连通的。
> 1. 对称性：如果节点 p 和 q 连通，那么 q 和 p 也连通。
> 1. 传递性：如果节点 p 和 q 连通，q 和 r 连通，那么 p 和 r 也连通。

> 怎么用森林来表示连通性呢？我们设定树的每个节点有一个指针指向其父节点，如果是根节点的话，这个指针指向自己。比如说刚才那幅 10 个节点的图，一开始的时候没有相互连通，就是这样：
> ![](./pictures/uf3.jpeg)
>
> 用数组来具体实现这个森林:
```js
class UnionFind {
    constructor(n){
        // 一开始互不连通
        this.count = n;
        this.parent = Array(n);
        // 父节点指针初始指向自己
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }
    
    union(p, q) {
        /* 将 p 和 q 连接 */
    }

    connected(p, q) {
        /* 判断 p 和 q 是否连通 */
    }

    count() {
        /* 返回图中有多少个连通分量 */
        return this.count;
    }

}
```
!> **如果某两个节点被连通，则让其中的（任意）一个节点的根节点接到另一个节点的根节点上**：
![](./pictures/uf2.jpeg) 
**如果节点 p 和 q 连通的话，它们一定拥有相同的根节点**：
![](./pictures/uf4.jpeg) 
我们加一个函数`find`来协助找个节点的root：
```js
class UnionFind {
    constructor(n){
        // 一开始互不连通
        this.count = n;
        this.parent = Array(n);
        // 父节点指针初始指向自己
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }
    
    union(p, q) {
        /* 将 p 和 q 连接 */
    }

    find(x) {
        /* 返回某个节点 x 的根节点  */
        // 根节点的 parent[x] == x
        while(parent[x] != x){
            x= parent[x];
        }
        return x;
    }

    connected(p, q) {
        /* 判断 p 和 q 是否连通 */
        let rootP = find(p);
        let rootQ = find(q);
        return rootP == rootQ;
    }

    count() {
        /* 返回图中有多少个连通分量 */
        return this.count;
    }

}
```

> 至此，Union-Find 算法就基本完成了。是不是很神奇？竟然可以这样使用数组来模拟出一个森林，如此巧妙的解决这个比较复杂的问题！find 主要功能就是从某个节点向上遍历到树根，其时间复杂度就是树的高度。我们可能习惯性地认为树的高度就是 logN，但这并不一定。logN 的高度只存在于平衡二叉树，对于一般的树可能出现极端不平衡的情况，使得「树」几乎退化成「链表」，树的高度最坏情况下可能变成 N。
![](./pictures/uf5.jpeg) 
> 所以说上面这种解法，find , union , connected 的时间复杂度都是 O(N)。这个复杂度很不理想的，你想图论解决的都是诸如社交网络这样数据规模巨大的问题，对于 union 和 connected 的调用非常频繁，每次调用需要线性时间完全不可忍受。

?> 问题的关键在于，如何想办法避免树的不平衡呢？**其实我们并不在乎每棵树的结构长什么样，只在乎根节点**。这里的技巧就是`路径压缩`。直接上最后答案把，建议背诵!
![](./pictures/uf7.jpeg) 
```js
class UnionFind {
    constructor(n){
        // 一开始互不连通
        this.count = n;
        this.parent = Array(n);
        // 父节点指针初始指向自己
        for (int i = 0; i < n; i++)
            this.parent[i] = i;
    }
    
    union(p, q) {
        /* 将 p 和 q 连接 */
        let rootP = find(p);
        let rootQ = find(q);
        
        if (rootP == rootQ)
            return;
        
        this.parent[rootQ] = rootP;
        // 两个连通分量合并成一个连通分量
        this.count--;
    }

    find(x) {
        /* 返回某个节点 x 的根节点  */
        // 根节点的 parent[x] == x
        // 这行代码进行路径压缩
        while(this.parent[x] != x){
            this.parent[x] = find(this.parent[x]);
        }
        return this.parent[x];
    }

    connected(p, q) {
        /* 判断 p 和 q 是否连通 */
        let rootP = find(p);
        let rootQ = find(q);
        return rootP == rootQ;
    }

    count() {
        /* 返回图中有多少个连通分量 */
        return this.count;
    }
```

?> **总结** Union-Find 算法的核心逻辑，总结一下我们优化算法的过程：
1. 用 parent 数组记录每个节点的父节点，相当于指向父节点的指针，所以 parent 数组内实际存储着一个森林（若干棵多叉树）。
1. 用 size 数组记录着每棵树的重量，目的是让 union 后树依然拥有平衡性，保证各个 API 时间复杂度为 O(logN)，而不会退化成链表影响操作效率。
1. 在 find 函数中进行路径压缩，保证任意树的高度保持在常数，使得各个 API 时间复杂度为 O(1)。使用了路径压缩之后，可以不使用 size 数组的平衡优化。
