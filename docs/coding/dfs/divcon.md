# 用分治法暴力穷举

#### **关于分治**

> 我个人是非常推崇暴力穷举算法的，因为这是其他奇淫异巧类算法如动规和单调栈等的基础。关于**暴力美学**，我个人认为有两个框架：回溯和分治。回溯呢我们已经说过难点是在于把*回溯树*画出来（细节请看[回溯这篇](./coding/dfs/backtracking)），相对应分治法，我这篇只想关注那些**暴力美学**类的几道题，比如说单词拆分题 II。
>
> 我觉得深入讨论动规题之前，对分治法的熟悉程度是前提。所以建议看完这篇再去研究**记忆化搜索**。
>
> 多数情况下分治法应用的是动态规划类的问题，因为动规的实质是通过**解`最优子结构`一步一步向上解决全局问题**，所以动规里一定有`子问题`，而且吧通常是`重复子问题`，用分治法肯定是合情合理，因为分治可以得到**子问题的最优解**。在解暴力穷举的问题的时候，我们很少看到大家推荐用分治的写法，而是用`回溯`或者其他`遍历模板`来解题，主要原因是通过一个[**路径、选择列表、结果集**]来写递归函数，简单说就是通俗易懂，也非常符合递归的三要素(*递归的定义，递归的出口，递归的拆解*等)。但是有些题吧就是邪门，你用回溯模板写出来不容易，而且即使写出来了也不容易解释。
>
> 其实这个分治模板在`记忆化搜索`那帖子里写过类似的，这里的模板跟那个很相似，只不过不是求最优子结构的最值，而是要遍历子问题的结果然后往上递归返回。这里有个常用的技巧就是在某些情况下是可以用记忆化搜索 memo 来剪枝的。

```js
var memo = []
const div_con(路径，选择列表，状态1，状态2，...){
    //base case 递归出口
    if(满足结束条件，比如说状态1已结遍历完) return；// base case, 即递归出口

    if(memo[状态1][状态2][...] != 特定值) return memo[状态1][状态2][...];
    let res= []；//所求的结果集
    for(const 选择 of 选择列表){
        // 注意所有状态都是有变化的
        let subproblem = div_con(路径，选择列表，状态1'，状态2'，...)；
        //后序位置处理subproblem跟当前递归层的逻辑关系
        //e.g.,
        /*
        for(const elem of subproblem){
            res.push(当前值 + elem);
        }
        */
    }

    memo[状态1][状态2][...] = res;
    return res;
}
```

> 总结一下跟回溯模板的不同：没有 explicitly 的`做选择`和`撤销选择`，因为`做选择`和`撤销选择`的步骤被直接当参数传去下一层了，这些参数也只是所谓的`状态`，可以用作 memo 里的索引。

> 这篇文章通过几个常见的暴力穷举题，看看分治法怎么应用到暴力穷举里。

### **刷题列表**

> 1. [144. 二叉树的前序遍历](#二叉树的前序遍历)
> 1. [140. 单词拆分 II(困难)](#单词拆分II)

### 二叉树的前序遍历

[144. 二叉树的前序遍历](https://leetcode.com/problems/binary-tree-preorder-traversal/)

> **思路** 这个题吧，用递归的方式来做的话，你应该闭着眼也能背诵下来了吧。

```js
var preorderTraversal = function (root) {
  let res = [];
  traversal(root, res);
  return res;
};

const traversal = (root, res) => {
  if (!root) return;

  res.push(root.val);
  traversal(root.left, res);
  traversal(root.right, res);
};
```

> 当然这不是这篇帖子的重点。这篇帖子想要展示一下分治思想来解决这个问题。直接看 code 吧：

```js
var preorderTraversal = function (root) {
  let res = [];
  if (!root) return res;

  res.push(root.val);
  let leftRes = preorderTraversal(root.left);
  let rightRes = preorderTraversal(root.right);
  res = res.concat(leftRes).concat(rightRes);
  return res;
};
```

?> 这个解法短小精干，但为什么不常见呢？一个原因是这个算法的复杂度不好把控，比较依赖语言特性，不如说如果你先用 Python 写，Python 里的一些语法糖用起来就特别方便：

```python
class Solution:
  def preorderTraversal(self, root):
    def traverse(node):
      if not node:
        return []
      left = traverse(node.left)
      right = traverse(node.right)
      return [node.val, *left, *right]

    return traverse(root)
```

### 单词拆分 II

[140. 单词拆分 II(困难)](https://leetcode.com/problems/word-break-ii/)

> **思路** 这题吧，从答案要求可以不难得出这不是个动规题，因为要求你给出所有可能的切割方式。那就穷举呗，第一想到的是回溯框架，但问题是这题套用穷举框架的话会很难入手，所以这题的比较容易的思路是用分治思想，然后还可以用 memo 来进行剪枝。这题本质上是用分治法处理子串组合问题。想象 s 是一个字符串，子串问题的连续性决定了可以把这个子串一切为二，头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么判断，如果头部是一个 word，那么只要判断尾部是不是一个可切分的字符串就可以了，这样这个问题的思路就很容易转化到递归思维。

```js
var memo = {};
var wordBreak = function (s, wordDict) {
  memo = {};
  return divCon(s, wordDict);
};

const divCon = (suffix, wordDict) => {
  if (memo[suffix]) {
    return memo[suffix];
  }

  let res = [];

  //base case
  if (!suffix || suffix.length == 0) return res;

  if (wordDict.includes(suffix)) {
    res.push(suffix);
    //return res;
    //不能停，因为比s也可能是多个子串的combo
  }

  //做选择
  for (let i = 1; i <= suffix.length; i++) {
    let word = suffix.substring(0, i);
    if (!wordDict.includes(word)) {
      continue;
    }

    let rem = suffix.substring(i);
    let subproblem = divCon(rem, wordDict);

    if (subproblem.length > 0) {
      for (const ele of subproblem) {
        res.push(word + " " + ele);
      }
    }
  }

  memo[suffix] = [...res];
  return res;
};
```

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        # 把string一切为二
        def div_con(suffix):
            results = []
            if suffix in wordDict:
                results.append(suffix)
                # don't return here

            for i in range(len(suffix)):
                head = suffix[0:i+1]
                if head not in wordDict:
                    continue

                tail = suffix[i+1:]
                # subproblem
                tail_break = div_con(tail)
                if tail_break:
                    for res in tail_break:
                        results.append(head+" "+res)

            return results
        return div_con(s)
```
