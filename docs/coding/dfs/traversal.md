# 矩阵的遍历

>起这篇的意义主要是让我们脑子里对于DFS遍历的流程能够在脑子里形成记忆，所以这篇也是作为DFS的入门篇。
>
>这篇还想借着[东哥的这篇帖子(一文秒杀所有岛屿题目)](https://labuladong.gitee.io/algo/4/30/111/)来整理加深一下`DFS`和`BFS`之间的不同作战规则。这里的题都是基于`矩阵`（亦是`图`）的遍历，主要是想让你专注于DFS本身而不是有时候比较复杂的遍历方向上。

### **刷题列表**

1. [200. 岛屿数量（中等）](#岛屿数量)
1. [1254. 统计封闭岛屿的数目（中等）](#统计封闭岛屿的数目)
1. [1020. 飞地的数量（中等）](#飞地的数量)
1. [695. 岛屿的最大面积（中等）](#岛屿的最大面积)
1. [1905. 统计子岛屿（中等）](#统计子岛屿)
1. [694. 不同的岛屿数量（中等）](#不同的岛屿数量)

### 岛屿数量

[200. 岛屿数量（中等）](https://leetcode.com/problems/number-of-islands/)

比如说题目给你输入下面这个 grid 有四片岛屿，算法应该返回 4：

![](./pictures/200.jpeg)

```js
//这是BFS的解法
var DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
var numIslands = function (grid) {
  let q = [];
  let step = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] == "1") {
        q.push([i, j]);
        grid[i][j] = "-1"; //代表已经visited过
        //BFS
        while (q.length > 0) {
          let curr = q.shift();
          //上下左右扩散
          for (const dir of DIRS) {
            y = curr[0] + dir[0];
            x = curr[1] + dir[1];

            if (
              y < 0 ||
              y > grid.length - 1 ||
              x < 0 ||
              x > grid[0].length - 1
            ) {
              continue;
            }

            if (grid[y][x] == "1") {
              q.push([y, x]);
            }

            grid[y][x] = "-1";
          }
        }
        step++;
      }
    }
  }

  return step;
};
```
