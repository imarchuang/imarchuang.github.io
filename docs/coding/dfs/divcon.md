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
> 1. [829. 单词模式 II(困难)](#单词模式II)

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

### 单词拆分II

[140. 单词拆分II(困难)](https://leetcode.com/problems/word-break-ii/)

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

### 单词模式II

[829. 单词模式II](https://www.lintcode.com/problem/829/)

> **思路** 函数签名是`wordPatternMatch(pattern, str)`。这题算是 hard 题了，主要是这里用到了`双字符串各自指针的技巧`，指向pattern的指针很容易理解，那就是每单个字符作为一个模式标记，也就是i指针每次向右移动一位，但是这里的第二个指针 j 不是那么容易理解。
>
> 按照思维定势，两个字符串嘛，第一眼看上去得用`dp(s1, i, s2, j)`的函数签名技巧来解题了，但是仔细一想这里的第二个 string`s2`不是那么容易判断怎么走去下一个 j。但是回过头来想想在[单词拆分 II](#单词拆分II)和[回文串切割](#回文串切割)这两个题中，有一个重要的递归思想就是把一个字符串进行`str.substring(0,j+1)`和`str.substring(j+1)`的两段字符串切割，使得递归思想能运用进来。具体到这题呢，思想是这样的：`pattern`的输入能，只能单个字符单个字符的往右移动`i`指针，那么核心问题变成了用什么样的步骤让`j`指针**有节奏的右移**呢？没什么好方法对吧？那就**穷举**呗。怎么个穷举法呢？这时候就需要用到把 str 切成`str.substring(0,j+1)`和`str.substring(j+1)`的两段子串，先假设头部字符串`str.substring(0,j+1)`是 match 到`pattern[0]`的，然后再**想办法证明**尾部字符串`str.substring(j+1)`是可以基于这个假设成立的。如果最后证明假设的头部字符串 match 的事实是不成立，那么就再试下一个头部字符串（将`j++`就等于扩展了头部字符串的长度)。
>
> 这题还有一个难点是**怎样证明尾部字符串`str.substring(j+1)`是可以基于头部 match 这个假设成立的**。这里需要维护两个路径参数，一个叫**map**，一个叫**set**。
>
> 1. 举个例子，pattern 是`'aabb'`，str 是`'blueblueredred'`；**map**很容易理解，就是记录目前已知的假设，比如说 map 里有`map['a']='blue'`，所以当遇到第二个 a 的时候，就直接让`j 指针`右移四位，因为已经假设 a 对应的子串是 blue 了。
> 1. 举另个例子，pattern 是`'aabc'`，str 是`'blueblueredred'`；**set**有点难理解，这里就说明一下。如果你的假设成立，就是说当`i 指针`穷举到第四个时候，map 里应该已经有`map['b']='red'`了；这样的话，在穷举遍历 str 时候，发现同一个词`red`又出现了，这说明同一个词`red`需要对应两个不同的 pattern 里的字符，所以此路不通应该直接跳过 continue，注意这里有个前提就是**如果新遇到 pattern 还是 b 的话，因为`map['b']='red'`，所以这时候我们直接会让 j 指针跳 3 码(red 单词长度)，这样就意味的 red 这个单词再出现在 set 里肯定是 match 了不同的 pattern**。
```python
class Solution:
    """
    @param pattern: a string,denote pattern string
    @param str: a string, denote matching string
    @return: a boolean
    """
    def word_pattern_match(self, pattern: str, str1: str) -> bool:
        word_map = {}
        word_set = set()

        def backtrack(pat, suffix):
            nonlocal word_map
            nonlocal word_set
            # print(f'{pat} {suffix} {word_set} {word_map}')
            if not pat and not suffix:
                return True
            if not pat or not suffix:
                return False
            p = pat[0]
            if p in word_map:
                word = word_map[p]
                if not suffix.startswith(word):
                    return False
                # move pointer on suffix
                return backtrack(pat[1:], suffix[len(word):])

            for j in range(len(suffix)):
                head = suffix[0:j+1]
                #说明出现了相同的word，却对应着不同的character pattern
                if head in word_set:
                    continue
                word_map[p] = head
                word_set.add(head)
                if backtrack(pat[1:], suffix[j+1:]):
                    return True
                del word_map[p]
                word_set.remove(head)
            return False
        return backtrack(pattern, str1)
```