# 什么是拓扑排序

>深入思考一下拓扑排序(**2022-07-07**):
>
>人们总是喜欢**有序**的集合，这里有序也体现在猴群社会里，猴群里是有严格的辈分和社会分工的。拓扑的意义在于把一个看似复杂的*图*变得有章可循，它得意义在于把图里的每个节点都赋予**阶层等级**的标签，这个图就某种程度上变成线性的了。
>
>其实求图的的拓扑序，只要考的你还是图中节点的遍历，所以DFS或者BFS都可以，只要你能高效非冗余的遍历完节点就行。
>
>

### **刷题列表**
1. [207. 课程表（中等）](#课程表) https://leetcode.com/problems/course-schedule/
```python
class Solution:
    on_path = []
    visited = set()
    has_cycle = False
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        # reset
        self.on_path = []
        self.visited = set()
        self.has_cycle = False
        # construct adjacency list
        adj_list = self.construct_adj_list(numCourses, prerequisites)
        # print(adj_list)
        for i in range(numCourses):
            self.traverse(adj_list, i)
        return not self.has_cycle
          
    def construct_adj_list(self, numCourses, prerequisites):
        adj_list = [None for i in range(numCourses)]
        for prerequisite in prerequisites:
            _from, _to = prerequisite
            if adj_list[_to]:
                adj_list[_to].append(_from)
            else:
                adj_list[_to] = [_from]
        return adj_list
    
    def traverse(self, adj_list, v):
        if v in self.on_path:
            self.has_cycle = True
            return 
        
        if self.has_cycle or v in self.visited:
            return

        self.visited.add(v)
        self.on_path.append(v)
        neighbors = adj_list[v]
        if neighbors is not None:
            for neighbor in neighbors:
                self.traverse(adj_list, neighbor)
        self.on_path.pop()           
```
1. [210. 课程表II（中等）](#课程表II) https://leetcode.com/problems/course-schedule-ii/
> **思路**：在后序位置把节点的值加入结果集中，这样保证了只有当自己的所有子节点(邻居，depend on此节点的节点们)都已经加入结果集了自己才被加入。这样做也不需要按照**入度**来排序再扫描所有节点，比如说你的图中有`1->2->3`和`4->2->5`两个路径，如果你先扫描的节点使`2`，那么执行顺序应该是这样的：
```
先从 2 开始遍历：2，3，回退，5，回退，回退，结束
再从 1 开始遍历：1，回退，结束。
再从 4 开始遍历：4，回退，结束。

这样得到结果集使[5,3,2,1,4]
```
```python
class Solution:
    on_path = []
    visited = set()
    has_cycle = False
    results = []
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        # reset
        self.on_path = []
        self.visited = set()
        self.has_cycle = False
        self.results = []
        # construct adjacency list
        adj_list = self.construct_adj_list(numCourses, prerequisites)

        for i in range(numCourses):
            self.traverse(adj_list, i)
        
        # print(self.results, self.has_cycle)
        if self.has_cycle:
            return []
        return reversed(self.results)
    
    def construct_adj_list(self, numCourses, prerequisites):
        adj_list = [None for i in range(numCourses)]
        for prerequisite in prerequisites:
            _from, _to = prerequisite
            if adj_list[_to]:
                adj_list[_to].append(_from)
            else:
                adj_list[_to] = [_from]
        return adj_list
    
    def traverse(self, adj_list, v):
        if v in self.on_path:
            self.has_cycle = True
            return 
        
        if self.has_cycle or v in self.visited:
            return

        self.visited.add(v)
        self.on_path.append(v)
        neighbors = adj_list[v]
        if neighbors is not None:
            for neighbor in neighbors:
                self.traverse(adj_list, neighbor)
        self.results.append(v)
        self.on_path.pop()     
```
1. [领扣892. 外星人字典](#外星人字典) https://www.lintcode.com/problem/892/