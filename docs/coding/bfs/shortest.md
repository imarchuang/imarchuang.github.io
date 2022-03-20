# 二叉树的层级遍历

!> 所有BFS题目的本质就是`让你从一幅图中从起点start到达终点end的最短距离`。BFS 相对 DFS 的最主要的区别是：BFS 找到的路径一定是最短的，但代价就是空间复杂度可能比 DFS 大很多。

### **刷题列表**
1. [111. 二叉树的最小深度（简单）](#二叉树的最小深度) 
1. [133. 克隆图（中等）](#克隆图)
1. [611. 领扣-骑士的最短路径（中等）](#骑士的最短路径)
1. [178. 领扣-图是否是树](#图是否是树) 
1. Shortest Path Visiting all nodes: https://leetcode.com/problems/shortest-path-visiting-all-nodes/
1. Sequence Reconstruction: https://leetcode.com/problems/sequence-reconstruction/
1. [127. 单词接龙（中等）](#单词接龙) https://leetcode.com/problems/word-ladder/
1. Number of Islands: https://leetcode.com/problems/number-of-islands/ 
1. [752. 打开转盘锁（中等）](#打开转盘锁) https://leetcode.com/problems/open-the-lock/


### 二叉树的最小深度
[111. 二叉树的最小深度（简单）](https://leetcode.com/problems/minimum-depth-of-binary-tree/)

?> **思路** 二叉树的层级遍历那篇帖子里提过，答案请看[**这里**](./coding/bfs/levels?id=二叉树的最小深度)。

### 克隆图
[133. 克隆图（中等）](https://leetcode.com/problems/clone-graph/) 

?> **思路** 这题答案

### 骑士的最短路径
[611. 领扣-骑士的最短路径（中等）](https://www.lintcode.com/problem/611/) 

?> **思路** 这题答案

### 单词接龙
[127. 单词接龙（中等）](https://leetcode.com/problems/word-ladder/) 

?> **思路** 这题答案

### 图是否是树
[178. 领扣-图是否是树](https://www.lintcode.com/problem/178/) 

?> **思路** 这题比较直接，看一个图是否是树，主要就是没有环+所有节点时候都能连通。题中已经说了不会出现重复边，所以先判断边数是否为n-1来判定是否有环。然后再判断是否所有节点都连通，这时候BFS遍历就派上用场了，看所有点能否连通，就看一次BFS遍历能否遍历完所有的点。

```java
public class Solution {
    /**
     * @param n: An integer
     * @param edges: a list of undirected edges
     * @return: true if it's a valid tree, or false
     */
    public boolean validTree(int n, int[][] edges) {
        if (n == 0) {
            return false;
        }
        //题中已经说了不会出现重复边，所以先判断边数
        if(edges.length != n-1) return false;

        //再看是否所有边都联通
        //建邻接表
        Map<Integer, Set<Integer>> graph = initializeGraph(n, edges);
        
        // bfs
        Queue<Integer> queue = new LinkedList<>();
        Set<Integer> hash = new HashSet<>();
        
        queue.offer(0);
        hash.add(0);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (Integer neighbor : graph.get(node)) {
                if (hash.contains(neighbor)) {
                    continue;
                }
                hash.add(neighbor);
                queue.offer(neighbor);
            }
        }
        
        return (hash.size() == n);
    }
    
    private Map<Integer, Set<Integer>> initializeGraph(int n, int[][] edges) {
        Map<Integer, Set<Integer>> graph = new HashMap<>();
        for (int i = 0; i < n; i++) {
            graph.put(i, new HashSet<Integer>());
        }
        
        for (int i = 0; i < edges.length; i++) {
            int u = edges[i][0];
            int v = edges[i][1];
            graph.get(u).add(v);
            graph.get(v).add(u);
        }
        
        return graph;
    }
}
```
### 打开转盘锁
[752. 打开转盘锁（中等）](https://leetcode.com/problems/open-the-lock/) 

?> **思路** 这题答案
