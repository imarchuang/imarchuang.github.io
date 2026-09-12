# 家族关系图谱

<iframe src="/drops/algo-lab/?note=graph-family&embed=1" title="算法交互演示" width="100%" height="720" style="border:0;width:100%;height:720px;background:#16382b;"></iframe>

**Instacart面试** 今天Instacart的面试，说实话进行的没有我想象中那么顺利，不论结果如何，趁着还没忘干净，还是写写面试后的总结吧。

!> **总结** 看到图（多叉树）相关的问题，第一反应应该是`建邻接链表`。图实际上分为有向图和无向图，邻接链表在无向图里比较`你中有我，我中有你`；而在有向图里其实可以建两个`邻接链表`，比如说在家族关系图谱里，这个`邻接链表`可以是两个hashmap，一个以child作为key，然后value是它的直接父节点；另一个可以以parent作为key，然后value是它的直接子节点。根据题目需求，可以快速的判断需要那种hashmap，甚至可能两个map都需要。

### 刷题列表
1. [Instacart面试真题 - 找出家族中没有父辈的节点以及只有一层父辈节点](#找出家族中没有父辈的节点以及只有一层父辈节点)
1. [Instacart面试真题 - 判断家族中两个节点有没有共同的父辈节点](#判断家族中两个节点有没有共同的父辈节点)


### 找出家族中没有父辈的节点以及只有一层父辈节点
> **题目描述**
> Suppose we have some input data describing a graph of relationships between parents and children over multiple generations. The data is formatted as a list of (parent, child) pairs, where each individual is assigned a unique positive integer identifier.
>
> For example, in this diagram below, nodes who have zero parents will be `[1,2,14,15]`, whereas nodes who have exactly one parent would be `[7,5,8,4,11,12,13,21]`.
>
> Write a function `findNodesWithZeroAndOneParents(pairs)` which would return these two kinds of nodes, for instance, the example blow should return:
> `[[1,2,14,15],[7,5,8,4,11,12,13,21]]`
```js
               15
              / \
         14  13  21
         |   |
1   2    4   12
 \ /   / | \ /
  3   5  8  9
   \ / \     \
    6   7     11

pairs = [
    (1, 3), (2, 3), (3, 6), (5, 6), (5, 7), (4, 5),
    (15, 21), (4, 8), (4, 9), (9, 11), (14, 4), (13, 12),
    (12, 9), (15, 13)
]
pairs = [
    [1, 3], [2, 3], [3, 6], [5, 6], [5, 7], [4, 5],
    [15, 21], [4, 8], [4, 9], [9, 11], [14, 4], [13, 12],
    [12, 9], [15, 13]
]
```
!> **思路** 拿到这题时候，我脑子里是空白的，主要原因是这种关于图的题自己刷的太少了。不过也确实没有慌张，因为我觉得大不了给出个暴力穷举解法。

> 下面就是我面试中给出的答案，因为这题很显然是一个O(n)的解法，因为for循环一遍所有的pairs就能统计出所需要的信息。一开始我试图只用一个变量`parentCounter`来记录所有节点的父节点数，但是当时因为心里有点急外加感觉时间限制挺大，就干脆无脑的决定用两个变量分别维护答案所需要的节点种类，一个是`parentCounter`，另一个是`zeroParentSet`；解法请看code，写的有点急躁，但是肯定是work的；
>
> 不过这里展示一下，只用一个变量`parentCounter`的话，写法会更简洁易懂，请看第二解法；
>
> 还想说说体会，其实如果自己当时再沉着一点儿，我觉得直接写出只用一个变量`parentCounter`的是没问题，只不过自己可能内心有点急躁。

```js
const findNodesWithZeroAndOneParents = (pairs) => {
  let childSet = new Set();
  let zeroParentSet = new Set();
  let parentCounter = {};
  for(const pair of pairs) {
    let parent = pair[0], child = pair[1];

    if(parentCounter[child]){
      parentCounter[child]++;
    } else {
      parentCounter[child] = 1;
    }

    childSet.add(child);
    //zero parent
    if(zeroParentSet.has(child) || childSet.has(parent)) {
      zeroParentSet.delete(child);
    } else {
      zeroParentSet.add(parent);
    }

  }

  let zeroParentRes = Array.from(zeroParentSet);
  let oneParentRes = [];
  for(const [key, val] of Object.entries(parentCounter)){
    if(val==1) oneParentRes.push(key);
  }

  return [zeroParentRes, oneParentRes];
}
```

```js
//更简洁写法
const findNodesWithZeroAndOneParents = (pairs) => {
    let parentCounter = {};
    for(const pair of pairs) {
        let parent = pair[0], child = pair[1];
        if(parentCounter[child]){
            parentCounter[child]++;
        } else {
            parentCounter[child] = 1;
        }

        if(parentCounter[parent]){
            //do nothing
        } else {
            parentCounter[parent] = 0;
        }
    }

    let zeroParentRes = [], oneParentRes = [];
    for(const [key, val] of Object.entries(parentCounter)){
        if(val==1) oneParentRes.push(key);
        if(val==0) zeroParentRes.push(key);
    }

    return [zeroParentRes, oneParentRes];
}
```

### 判断家族中两个节点有没有共同的父辈节点

> 这题作为一个扩展题给出来；题目给出图的定义跟第一问是一样的，只不过这次要你找有没有共同祖先。

> **题目描述**
> Suppose we have some input data describing a graph of relationships between parents and children over multiple generations. The data is formatted as a list of (parent, child) pairs, where each individual is assigned a unique positive integer identifier.
>
> For example, in this diagram, 6 and 8 have common ancestors of 4 and 14.
```js
/*
               15
              / \
         14  13  21
         |   |
1   2    4   12
 \ /   / | \ /
  3   5  8  9
   \ / \     \
    6   7     11
*/
pairs = [
    (1, 3), (2, 3), (3, 6), (5, 6), (5, 7), (4, 5),
    (15, 21), (4, 8), (4, 9), (9, 11), (14, 4), (13, 12),
    (12, 9), (15, 13)
]
pairs = [
    [1, 3], [2, 3], [3, 6], [5, 6], [5, 7], [4, 5],
    [15, 21], [4, 8], [4, 9], [9, 11], [14, 4], [13, 12],
    [12, 9], [15, 13]
]
```
> Write a function that takes this data and the identifiers of two individuals as inputs and returns true if and only if they share at least one ancestor. 
>
> Sample input and output:
> 1. `hasCommonAncestor(pairs, 3, 8)   => false`
> 1. `hasCommonAncestor(pairs, 5, 8)   => true`
> 1. `hasCommonAncestor(pairs, 6, 8)   => true`
> 1. `hasCommonAncestor(pairs, 6, 9)   => true`
> 1. `hasCommonAncestor(pairs, 1, 3)   => false`
> 1. `hasCommonAncestor(pairs, 3, 1)   => false`
> 1. `hasCommonAncestor(pairs, 7, 11)  => true`
> 1. `hasCommonAncestor(pairs, 6, 5)   => true`
> 1. `hasCommonAncestor(pairs, 5, 6)   => true`
> 1. `hasCommonAncestor(pairs, 3, 6)   => true`
> 1. `hasCommonAncestor(pairs, 21, 11) => true`

!> **思路** 拿到这题时候，面试官提醒过只剩10分30秒了，而且说实话因为第一问做的并不是顺风顺水，我就果断决定这题不写code了，直接跟面试官谈理想吧，哈哈。
> 1. 思考了不到一分钟，就当机立断跟面试官套一套话素。我就直接说，分别用这两个节点去找他们的所有祖先，然后看这俩节点的祖先里有没有相同的；
>
>    * 面试官就直接追问了，那你啥时候比较两个节点的祖先有没有相同的呢？是每遍历一层父辈的时候吗？
>
> 1. 我就感觉不太对，稍作思考，就直接说先分别找出两个节点的所有祖先，然后再比较两个祖先lists，看这俩list有没有共同元素。
>
>    * 面试官没做多少评价，就直接问你咋找出节点的所有祖先？
>
> 1. 我当时没做啥考虑就直接给了暴力解：一层一层的递归找每个节点的父节点，并把所有的父节点放到一个集合里。
>
>    * 面试官就追问有没有优化解法？
>
> 1. 我当时一懵，这就是 **`印度人的坏处，因为他不会告诉你你的思路是正确的！`** 这时候，作为被面很多次的面经丰富之人，我当然不能坐以待毙！我就直接问了：我目前的思路是可行的吗？他估计是被逼无奈，就说思路是正确的，但是怎么`优化找节点的所有祖先`。
>
> 1. 当时只剩不到3分钟了，我果断选择问面试官有没有可提示的。
>    * 面试官虽然不是很情愿，但是轻声细语的说了句：`你看看能不能对这个pairs进行一些pre computation`
>
> 1. 我脑子立即猛得一醒，我擦，直接把这个pairs转化成一个 **邻接链表** 不就成了吗？！我就突然像磕了💊似的，猛然加速说了这个解法：先把pairs转化成一个hashmap，map的key就是每个节点，然后map的value就是这个节点的`直接父节点（只看一层）`，然后再递归的去找某个节点的所有祖先节点的时候，就容易了，因为可以直接查找map里的结果。

> 下面是解法代码，虽然当时没有时间写出来。不过话说回来，能在30分钟里写出两道题来还是挺不容易的。
```js
const hasCommonAncestor = (pairs, p, q) => {
  //建邻接表
  let parentsMap = {};
  for(const pair of pairs) {
      let parent = pair[0], child = pair[1];
      if(parentsMap[child]){
         parentsMap[child].push(parent); 
      } else {
         parentsMap[child] = [parent];
      }
  }

  let pAncestors = [], qAncestors = [];
  findAncestors(p, parentsMap, pAncestors);
  findAncestors(q, parentsMap, qAncestors);

  for(const pAncestor of pAncestors){
      if(qAncestors.includes(pAncestor)) return true;
  }

  return false;

}

const findAncestors = (node, parentsMap, res) => {
     
    let parents = parentsMap[node];
    if(parents){
        res.push(...parents);
        for(const parent of parents){
            findAncestors(parent, parentsMap, res);
        }
    }
    
}
```