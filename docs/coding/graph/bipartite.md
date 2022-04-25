# 二分图

**何为二分图** 二分图的顶点集可分割为两个互不相交的子集，图中每条边依附的两个顶点都分属于这两个子集，且两个子集内的顶点不相邻。说人话就是：给你一幅「图」，请你用两种颜色将图中的所有顶点着色，且使得任意一条边的两个端点的颜色都不相同，你能做到吗？
> ![](./pictures/bipartite0.png)

!> **总结** 判定二分图的算法很简单，就是用代码解决「双色问题」。说白了就是遍历一遍图，一边遍历一边染色，看看能不能用两种颜色给所有节点染色，且相邻节点的颜色都不相同。

> **重点**
>
> 之前我们说过图的遍历框架（你可以顺便再思考一下图的遍历和回溯框架的区别），通常是长下面这个样子：
```js
/*图的遍历框架*/
const traverse = (graph, visited, v) => {
    // 递归的出口：防止走回头路进入死循环
    if(visited[v]) return;
    // 前序遍历位置，标记节点 v 已访问
    visited[v] = true;
    for(const neighbor of graph.neighbors(v)){
        traverse(graph, visited, neighbor);
    }
}
```
> 上面这个写法的好处就是直观易懂，非常符合递归的常用写法（因为base case就是递归的出口）。其实图的遍历框架也可以按照下面的写法（在for循环里先判断是否需要递归到下一层）：
```js
const traverse = (graph, visited, v) => {
    // 前序遍历位置，标记节点 v 已访问
    visited[v] = true;
    for(const neighbor of graph.neighbors(v)){
        // 只遍历没标记过的相邻节点
        if(visited[neighbor]) continue;
        traverse(graph, visited, neighbor);
    }
}
```
>
> 按照上面这种写法，我们可以照葫芦画瓢的给出二分图的遍历框架：
```js
const isBipartite = (graph, visited, v) => {
    // 前序遍历位置，标记节点 v 已访问
    visited[v] = true;
    for(const neighbor of graph.neighbors(v)){
        if(!visited[neighbor]) {
            // 相邻节点 neighbor 没有被访问过
            // 那么应该给节点 neighbor 涂上和节点 v 不同的颜色
            traverse(graph, visited, neighbor);
        }
        else {
            // 相邻节点 neighbor 已经被访问过
            // 那么应该比较节点 neighbor 和节点 v 的颜色
            // 若相同，则此图不是二分图
        }
        
    }
}
```

### 刷题列表
1. [785. 判断二分图](#判断二分图)
1. [886. 可能的二分法](#可能的二分法)


### 判断二分图
[785. 判断二分图](https://leetcode.com/problems/is-graph-bipartite/)

> **思路**

```js
var isBipartite = function(graph) {
    let n = graph.length;
    let colors = Array(n).fill(true), visited = Array(n).fill(false);
    for(let i=0; i<n; i++){
        if(!traverse(graph, visited, colors, i)) return false;
    }
    return true;

};

const traverse = (graph, visited, colors, v) => {
    visited[v] = true;
    for(const neighbor of graph[v]){
        if(!visited[neighbor]){
            colors[neighbor] = !colors[v];
            traverse(graph, visited, colors, neighbor);
        }
        else {
            if(colors[neighbor] == colors[v]) return false;
        }
    }
    return true;
}
```

### 可能的二分法
[886. 可能的二分法](https://leetcode.com/problems/possible-bipartition/)

> **思路**

```js
var ok = true;
var possibleBipartition = function(n, dislikes) {
    ok = true;
    //建邻接表
    let neighbors = [...Array(n+1)].map(x=>[]);
    for(const dislike of dislikes){
        let w = dislike[0];
        let v = dislike[1];
 
        neighbors[v].push(w);
        neighbors[w].push(v);

    }
    
    let visited = Array(n+1).fill(false);
    let colors = Array(n+1).fill(true);
    
    for(let i=1; i<=n; i++){
        if(!visited[i]){
           traverse(neighbors, visited, colors, i);
        }
    }
    
    return ok;
    
};

const traverse = (graph, visited, colors, v) => {
    if(!ok) return;
    visited[v] = true;
    let neighbors = graph[v];
    for(const neighbor of neighbors){
        if(!visited[neighbor]) {
            colors[neighbor] = !colors[v];
            traverse(graph, visited, colors, neighbor);
        } else {
            if(colors[neighbor] == colors[v]) ok=false;
        }
    }
}
```