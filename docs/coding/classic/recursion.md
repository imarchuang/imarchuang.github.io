# 关于递归

> 计算机的构造似乎给二有着不解之缘，更抽象点说，我们人类设计算法时候总是希望把问题先一切两半，大事化小。
>
> 1.  我们说**整个计算机其实只有两种结构**，一个是数组一个是链表。
> 1.  切割子问题有两种方法，一是遍历法，一是分治法。
>

### 从单链表讲起
> 这篇试着抽象一下**穷举**，**穷举只有两条道**：一是显性的for循环或者while条件下循环，另一种是利用递归栈阴性的遍历所有元素。
>
> 1.  给你一个数组`int[] nums = [1,2,3,4,5]`，如果让你遍历其中的每个元素，你会怎么做？
>     * 你肯定会说`for(int i=0; i<nums.length(); i++){...}`，其实你隐含的意思是，这个数组可以用index的方式去access它的元素，而且index的间隔正好是个整数1； 
>     * 那如果我问你你可以递归式的去遍历他的元素吗？
```python
nums = [1,2,3,4,5]
def traverse(nums, idx):
  if idx >= len(nums):
    return
  
  //前序位置
  traverse(nums, idx+1)
  //后序位置

traverse(nums, 0)

def traverse_reversely(nums, idx):
  if idx<0:
    return
  
  //前序位置
  traverse(nums, idx-1)
  //后序位置

traverse_reversely(nums, len(nums)-1)
```

> 你有没有发现其中的相似之处？for循环要求你定义三个东西：1. index索引i的初始值； 2. index索引i的结束条件；3. index索引i的增量increment；那么定义递归的时候，其实也是这三个要素：1. 递归初始值, e.g., `traverse(nums, 0)`；2. 递归的base case，也就是结束条件；3. 递归的进阶traverse(nums, idx+1)；

现在把数组换成单链表，基本概念一模一样，只不过这次你没法直接用index索引去access它的元素了，只不过呢，好的语言都提供了一种比较syntax suger类的api，让你能通过`Node a = list1.get(i)`来获取元素，这里我们就假设一个纯纯的单链表：
```java
List<String> list1 = new ArrayList<String>();
Iterator<String> listIterator = list1.iterator();
while(listIterator.hasNext()){
  String s = listIterator.next();
  ...
}

//递归写法
void traverse(Iterator<String> listIterator){
  if(!listIterator.hasNext())
    return;
  //前序位置  
  String s = listIterator.next();
  traverse(listIterator)
  //后序位置
}
```

### 开始说说二叉树
>  二叉树是单链表的延伸，每个节点node都连着最多两个节点，你可以类比想象成nextLeft和nextRight的俩指针，俗称左儿子和右儿子。正因为如此，二叉树的遍历特别锻炼递归思维！
> 1. 对比单链表里的迭代式的for循环变量，二叉树的“迭代”遍历（这里说的不是很恰当）就是传说中的BFS，即**层级遍历**；你想象每一层都有若干节点。BFS把每一层看做了一个*元素*，这样的好处就是这样符合线性思维。具体到实现的话也很线性：用一个queue来存储某一层的所有节点元素，然后遍历完当前层的所有节点，然后再进入下一层。
>     - BFS的写法比起DFS来会相对行数多一些，它的应用也多数局限于拓扑排序类的应用题。
> 1.  递归式的DFS才是遍历二叉树的**王炸**，这个广义的*遍历*当然也包括分治的解法。
>     - DFS遍历一个二叉树的所有节点咋做？
```python
def traverse(root):
  if not root:
    return
  
  //前序位置
  traverse(root.left)
  //中序位置
  traverse(root.right)
  //后序位置
```
> 关于二叉树这段，我已经有了比较好的总结，请看[这里](./coding/tree/index?id=什么是穷举遍历二叉树)；
>
> 现在快速的说说多叉树的递归思维，多叉树的迭代遍历思维就是BFS，跟二叉树没什么区别；这里重点看看多叉树的DFS遍历或者分治，从下面框架一眼就能看出来：
```python
def traverse(root):
  if not root:
    return

  if root in visited:
    return
  
  //前序位置
  for child in root.children:
    traverse(child)
  //后序位置
```

### 说说回溯遍历(或者分治)

!> **敲黑板** 这里穷举问题多数都是子串切割问题，那么既然是子串（连续性），那算法复杂度就应该是控制在`O(n^2)`这样子。q 这类穷举问题里通常会用到一种递归思想，那就是把一个字符串切割成两段子串：头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么假设头部符合某个条件（比如说头部是一个 word），那么基于这个假设成立再证明尾部是正确的就可以了，这样这个问题的思路就很容易转化到递归思维已经证明尾部的问题。

1. [212. 单词查找 II](#单词查找II)
1. [140. 单词拆分 II](#单词拆分II)
1. [131. 回文串切割](#回文串切割)
1. [829. 单词模式 II](#单词模式II)

### 最后说说动规里的穷举思想

!> **敲黑板** 这类动规问题里通常会用到一种状态转化思想，那就是答案里不含有 s1[i]，或者答案里不含有 s2[j]，或者答案里不含有 s1[i]和 s2[j]，最后一种情况就当`s1[i]==s2[j]`时怎么处理。

>

1. [72. 编辑距离](https://leetcode.com/problems/edit-distance/)
   > **思路** 这题看着就让人懵啊，不过还是按照套路来嘛，又是两个字符串的问题，凭经验也应该快速写出对应的 dp 函数`dp(s1, i, s2, j)`，然后顺着语义把这个 dp 函数定义清楚，`dp函数代表s1[0...i]和s2[0...j]之间的最小编辑距离`，然后接下来就是套我们记忆化搜索模板。这题需要**注意**的是，其实选择列表有四个选项，增删替，还有就是啥都不做，当`s1[i]==s2[j]`时，其实啥都不做就是最优的选择。这题的详解可以[看这里](./coding/dp/sebusequence?id=编辑距离)，而且这题的记忆化搜索解法可以[看这里](./coding/memo/index?id=编辑距离)。
1. [1143. 最长公共子序列](https://leetcode.com/problems/longest-common-subsequence/)
   > **思路** 这题是子序动规里经典的问题了(LCS)。一共 4 种情况吧，情况 1：如果`s1[i]==s2[j]`，说明此字符一定存在于公共子序中，所以就直接递归到下一层`1+dp(s1, i+1, s2, j+1);`。情况 2：s1[i]不在最长公共子序中；情况 3：s2[j]不在最长公共子序中；情况 4：s1[i]和 s2[j]都不在最长公共子序中；因为是求最长公共子序嘛，所以情况 4 已经被情况 2 和情况 3 涵盖了，所以当`s1[i]!=s2[j]`时，我们要取最优`Math.max(dp(s1, i+1, s2, j),dp(s1, i, s2, j+1));`。这题的详解可以[看这里](./coding/dp/sebusequence?id=最长公共子序列)。
1. [领扣 79. 最长公共子串](https://www.lintcode.com/problem/79/)
   > **思路** 这题核心是个数学归纳法。解决子串问题吧，就要谨记连续这个词，所以整着遍历字符串，看看以这个数结尾的子串最长公共子序是多少是多少？这是不是就好找多了？所以思路变得很简单，如果`s1[i]==s2[j]`，那就看 dp[i-1][j-1]的值，直接是`dp[i][j] = 1+dp[i-1][j-1];`，因为前一个字母结尾的最长公共子串再加 1 才是当前的最长公共子串。同理，如果`s1[i]!=s2[j]`，那就`dp[i][j] = 0`。这题的详解可以[看这里](./coding/dp/indices?id=最长公共子串)。
1. [516 最长回文子序](https://leetcode.com/problems/longest-palindromic-subsequence/)
   > **思路** 这题是为数不多的单个字符串但需要二维 dp 数组的问题。当`s[i]==s[j]`时, 简单啊，答案就是`2 + dp(s, i+1, j-1)`。当`s[i]!=s[j]`时, 就三种情况了，分别是
   >
   > 1. 最长子回文序列里含有 s[i];
   > 1. 最长子回文序列里含有 s[j];
   > 1. 最长子回文序列里既不含有 s[i]也不含有 s[j];
   >    第三种情况可以不考虑，因为我们再找最长回文子序，情况 1 和 2 其实已经涵盖了情况 3 了。你仔细体会一下，这个思路是不是跟[最长公共子序列]()一模一样的？
   >
   > 这题的详解可以[看这里](./coding/dp/sebusequence?id=最长回文子序)。
1. [1312. 构造回文的最小插入次数](https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/)
   > **思路** 这题和上一题[最长回文子序]()其实本质上是镜面操作题。你琢磨琢磨，`把一个字符串变成回文串的最少操作次数`是不是可以先找`这个字符串的最长回文子序`。这题的详解可以[看这里](./coding/dp/sebusequence?id=构造回文的最小插入次数)。

### 第三类：单纯子串类，通常是要介入滑动窗口老猛男

> 这类相关问题请阅读[这篇帖子](./coding/twopointer/sliding)。

### 第 IV 类：单调栈类

1. [316. 去重重复字母](#去重重复字母)

### 第 V 类：子序列类

1. [Karat 面试真题 - 找字符串中符合word的子序列](#找字符串中符合word的子序列)

### 单词查找II

[212. 单词查找II](https://leetcode.com/problems/word-search-ii/)

> **思路** 这题本质是图（矩阵）的遍历问题，这题矩阵吧不像是 flood-fill 那类的问题，可以直接替换原矩阵的值来标记是否已经 visited 过，所以外加一个 visited 变量，这个变量可以用二维数组也可以用 json object，不过不考虑空间的话，二维数组比较简单易懂。这题要想通过 leetcode 的 online judge 的话，`最关键的是init一个prefixSet变量`。
>
> **敲黑板** 图的遍历和回溯框架的核心区别：
>
> 1. 把节点加入 path 的代码和之后 pop 出去的代码（`做选择和撤销选择`）要放到 For 循环外，要不会漏掉记录起始点的遍历；
> 1. For 循环内，进入递归下一层前进行必要的剪枝检查，比如说有没有出界啊，有没有已经 visited 过了呀之类的；

```js
/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function (board, words) {
  //form a prefix set to speed up
  let prefixSet = new Set();
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      let pre = word.substring(0, i);
      prefixSet.add(pre);
    }
  }
  maxLen = Math.max(...words.map((x) => x.length));

  //loop thru the whole matrix
  let m = board.length,
    n = board[0].length;
  let visited = [...Array(m)].map((x) => Array(n).fill(false));

  words = new Set(words);
  let res = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      dfs([], board, words, i, j, prefixSet, visited, res);
    }
  }

  return res;
};
var DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
var maxLen = 0;

const dfs = (path, board, words, i, j, prefixSet, visited, res) => {
  let m = board.length,
    n = board[0].length;
  path.push(board[i][j]);
  visited[i][j] = true;
  let word = path.join("");
  if (words.has(word)) {
    res.push(word);
    words.delete(word);
    //继续走下去，因为cat还有cats
  }

  for (const dir of DIRS) {
    if (path.length > maxLen) break;
    if (!prefixSet.has(word)) break;
    let x = i + dir[0];
    let y = j + dir[1];

    if (x < 0 || y < 0 || x >= m || y >= n) {
      continue;
    }
    if (visited[x][y]) {
      continue;
    }
    dfs(path, board, words, x, y, prefixSet, visited, res);
  }
  visited[i][j] = false;
  path.pop();
};
```

### 单词拆分 II

[140. 单词拆分 II](https://leetcode.com/problems/word-break-ii/)

> **思路** 这题本质上是用分治法处理子串组合问题。想象 s 是一个字符串，子串问题的连续性决定了可以把这个子串一切为二，头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么判断，如果头部是一个 word，那么只要判断尾部是不是一个可切分的字符串就可以了，这样这个问题的思路就很容易转化到递归思维。
>
> 最后说一下，这题是可以用 memo 来进行剪枝的，见下面解法 2.

```js
var wordBreak = function (s, wordDict) {
  if (!s) return [];

  let res = [];

  if (wordDict.includes(s)) res.push(s);

  for (let i = 0; i < s.length; i++) {
    let word = s.substring(0, i + 1);
    if (!wordDict.includes(word)) continue;

    let suffix = s.substring(i + 1);
    let remainings = wordBreak(suffix, wordDict);

    if (remainings.length > 0) {
      for (const rem of remainings) {
        res.push(word + " " + rem);
      }
    }
  }

  return res;
};
```

> 用 memo 剪枝

```js
var memo = {};
var wordBreak = function (s, wordDict) {
  memo = {};

  return dfs(s, wordDict);
};

const dfs = (s, wordDict) => {
  if (memo[s]) return memo[s];
  if (!s) return [];

  let res = [];

  if (wordDict.includes(s)) res.push(s);

  for (let i = 0; i < s.length; i++) {
    let word = s.substring(0, i + 1);
    if (!wordDict.includes(word)) continue;

    let suffix = s.substring(i + 1);
    let remainings = dfs(suffix, wordDict);

    if (remainings.length > 0) {
      for (const rem of remainings) {
        res.push(word + " " + rem);
      }
    }
  }

  memo[s] = res;
  return res;
};
```

### 回文串切割

[131. 回文串切割](https://leetcode.com/problems/palindrome-partitioning/)

> **思路** 这题跟上一题[单词拆分 II]()有异曲同工之妙，只不过这里，用 memo 剪枝作用几乎微乎其微。另外，这题是个非常典型的回溯问题，就连函数签名`const backtrack = (s, startIndex, partition, res)`都非常像极了[子集](./coding/dfs/subset?id=子集)这题，唯一的不同就是在递归进入下一层之前的剪枝`if (!isPalindrome[startIndex][i]) continue;`，因为这里剪枝条件是看是否为回文串。
>
> **敲黑板** 有个小技巧这里：判断一个一个字符串所有回文串的位置[i,j]的类似动规的写法，请看 code 里那个`getIsPalindrom`的函数。

```js
var isPalindrome = [];
var partition = function (s) {
  let n = s.length;
  isPalindrome = getIsPalindrom(s);
  let res = [];
  backtrack(s, 0, [], res);
  return res;
};

const backtrack = (s, startIndex, partition, res) => {
  if (startIndex == s.length) {
    formResultPath(s, partition, res);
    return;
  }

  for (let i = startIndex; i < s.length; i++) {
    if (!isPalindrome[startIndex][i]) continue;

    partition.push(i);
    backtrack(s, i + 1, partition, res);
    partition.pop();
  }
};

const formResultPath = (s, partition, res) => {
  let idx = 0;
  let path = [];
  for (let i = 0; i < partition.length; i++) {
    path.push(s.substring(idx, partition[i] + 1));
    idx = partition[i] + 1;
  }
  res.push([...path]);
};

const getIsPalindrom = (s) => {
  let n = s.length;
  let dp = [...Array(n)].map((x) => Array(n).fill(true));
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (i < j) {
        if (s.charAt(i) == s.charAt(j)) {
          dp[i][j] = dp[i + 1][j - 1];
        } else {
          dp[i][j] = false;
        }
      }
    }
  }

  return dp;
};
```

### 单词模式II

[829. 单词模式II](https://www.lintcode.com/problem/829/)

> **思路** 函数签名是`wordPatternMatch(pattern, str)`。这题算是 hard 题了，主要是这里用到了`双指针的技巧`，但是`双指针`的第二个指针 j 不是那么容易理解。
> 按照惯例，两个字符串，第一眼看上去得用`dp(s1, i, s2, j)`的函数签名技巧来解题了，但是仔细一想这里的第二个 string`s2`不是那么容易判断怎么走去下一个 j。但是回过头来想想在[单词拆分 II](#单词拆分II)和[回文串切割](#回文串切割)这两个题中，有一个重要的递归思想就是把一个字符串进行`str.substring(0,i+1)`和`str.substring(i+1)`的两段字符串切割，使得递归思想能运用进来。具体到这题呢，思想是这样的：`pattern`的输入能，只能单个字符单个字符的往右移动`i`指针，那么核心问题变成了用什么样的步骤让`j`指针有节奏的右移呢？没什么好方法对吧？那就**穷举**呗。怎么个穷举法呢？这就需要用到把 str 切成`str.substring(0,i+1)`和`str.substring(i+1)`的两段子串，先假设头部字符串`str.substring(0,i+1)`是 match 到`pattern[0]`的，然后再**想办法证明**尾部字符串`str.substring(i+1)`是可以基于这个假设成立的。如果最后证明假设的头部字符串 match 的事实是不成立，那么就再试下一个头部字符串（将`i++`就等于扩展了头部字符串的长度)。
>
> 这题还有一个难点是怎样证明尾部字符串`str.substring(i+1)`是可以基于头部 match 这个假设成立的。这里需要维护两个路径参数，一个叫**map**，一个叫**set**。
>
> 1. 举个例子，pattern 是`'aabb'`，str 是`'blueblueredred'`；**map**很容易理解，就是记录目前已知的假设，比如说 map 里有`map['a']='blue'`，所以当遇到第二个 a 的时候，就直接让`j 指针`右移四位，因为已经假设 a 对应的子串是 blue 了。
> 1. 举另个例子，pattern 是`'aabc'`，str 是`'blueblueredred'`；**set**有点难理解，这里就说明一下。如果你的假设成立，就是说当`i 指针`穷举到第四个时候，map 里应该已经有`map['b']='red'`了；这样的话，在穷举遍历 str 时候，发现同一个词`red`又出现了，这说明同一个词`red`需要对应两个不同的 pattern 里的字符，所以此路不通应该直接跳过 continue，注意这里有个前提就是**如果新遇到 pattern 还是 b 的话，因为`map['b']='red'`，所以这时候我们直接会让 j 指针跳 3 码(red 单词长度)，这样就意味的 red 这个单词再出现在 set 里肯定是 match 了不同的 pattern**。

```js
export class Solution {
  /**
   * @param pattern: a string,denote pattern string
   * @param str: a string, denote matching string
   * @return: a boolean
   */
  wordPatternMatch(pattern, str) {
    // write your code here
    let map = {},
      set = new Set();
    return this.backtrack(pattern, str, map, set);
  }

  backtrack(pattern, str, map, set) {
    //base case:
    if (pattern.length == 0) return str.length == 0;

    let p = pattern[0];
    if (map[p]) {
      let word = map[p];
      if (!str || !str.startsWith(word)) {
        return false;
      }
      return this.backtrack(
        pattern.substring(1),
        str.substring(word.length),
        map,
        set
      );
    }

    for (let i = 0; i < str.length; i++) {
      let prefix = str.substring(0, i + 1);
      //说明出现了相同的word，却对应着不同的character pattern
      if (set.has(prefix)) continue;

      //做选择
      map[p] = prefix;
      set.add(prefix);

      let suffix = str.substring(i + 1);
      //剪枝，遇到一个可以，立即退出
      if (this.backtrack(pattern.substring(1), suffix, map, set)) return true;

      //撤销选择
      delete map[p];
      set.delete(prefix);
    }

    return false;
  }
}
```

### 去重重复字母

[316. 去重重复字母](https://leetcode.com/problems/remove-duplicate-letters/)

> **思路** 字符串去重能多难？就直接用 hashmap 或者 trie 呗；但是这个 lexicographical order 还真是把人难住了，单单 hashmap 不好使啊。子串需要保持原序嘛，看到 lexi order 直接去单调栈上想吧。

```js
var removeDuplicateLetters = function (s) {
  let asciiA = Array(256).fill(0);

  //先给每个字符做个count
  for (const c of s) {
    let ascii = c.charCodeAt(0);
    asciiA[ascii]++;
  }

  let stk = [];
  for (const c of s) {
    let asciiC = c.charCodeAt(0);
    asciiA[asciiC]--;

    //去重
    if (stk.includes(c)) continue;

    while (stk.length > 0 && stk[stk.length - 1] > c) {
      let e = stk[stk.length - 1];
      let asciiE = e.charCodeAt(0);
      if (asciiA[asciiE] == 0) break; //只剩一个e了,不能再pop了

      stk.pop();
    }
    stk.push(c);
  }

  return stk.join("");
};
```

```java
class Solution {
    public String removeDuplicateLetters(String s) {
        //建occurance数列
        int[] occurance = new int[26];
        for(char c : s.toCharArray()){
            occurance[c-'a']++;
        }

        boolean[] visited = new boolean[26];
        Arrays.fill(visited, false);
        Stack<Character> stk = new Stack<>();

        //用单调栈
        for(char c : s.toCharArray()){
            occurance[c-'a']--;

            //if(occurance[c-'a']==0) continue;
            if(visited[c-'a']) continue;
            visited[c-'a'] = true;
            while(!stk.isEmpty() && occurance[stk.peek()-'a']>0 && c<stk.peek()){
                char e = stk.pop();
                visited[e-'a'] = false;
            }

            stk.push(c);
        }

        //return new String(stk.toArray());
        return String.join("", stk.stream().map(c->String.valueOf(c)).collect(Collectors.toList()));

    }
}
```

### 找字符串中符合 word 的子序列

[找字符串中符合 word 的子序列](#找字符串中符合word的子序列)
[领扣样题](https://www.lintcode.com/problem/1024/)

> **题目描述**
> 给出一个字典 words，例如[cat, tax, baby, bird, sky]，判断一个字符串 str 中是否含有一个子序能够形成字典中的任意 word。**注意**：这个子序的异构词能形成 word 即可。
>
> **思路** 拿到这题，我的第一反应是用类似滑动窗口处理子串问题的思想，即：给出一个 window，这个 window 里记录某个 word 的所有字符的出现次数，比如说 cat 这个词，就可以形成`{'c':1, 'a':1, 't':1}`。然后遍历 str 的每个字符，如果遍历过程中能让 cat 所对应的 window 里的键值对都满足，那就说明这个 word 就是答案。因为给出的是一个多个 word 的字典，那么就字典里的每个 word 都建立各自的 window 就好了。我说这个思路的原因是因为这样解题是错误的，因为严格意义上子序列是要遵循原序的，所以这样解题会输出错误答案。这题正确的答案会在第二部分给出。

```js
const find_embedded_word = (words, str) => {
  let wordMap = [];
  //先把每个word建成字母和occurance的键值对map
  for (const word of words) {
    let window = {};
    for (const c of word) {
      if (window[c]) {
        window[c]++;
      } else {
        window[c] = 1;
      }
    }
    wordMap.push(window);
  }

  //console.log(wordMap);

  for (const c of str) {
    for (let i = 0; i < wordMap.length; i++) {
      let word = wordMap[i];
      if (word[c]) {
        word[c]--;
      }

      if (word[c] == 0) delete word[c];
      //console.log(wordMap);

      //如果json object中的键值对都被删除了，说明这个对应的word就是答案
      if (Object.keys(word) == null || Object.keys(word).length == 0)
        return words[i];
    }
  }

  return null;
};

// console.log(find_embedded_word(words, string1));
// console.log(find_embedded_word(words, string2));
// console.log(find_embedded_word(words, string3));
// console.log(find_embedded_word(words, string4));
// console.log(find_embedded_word(words, string5));
// console.log(find_embedded_word(words, string6));
```

> **正确答案** 其实这题技巧性特别强，核心就是`isSubseq`函数，这个函数一定要吃透。

```js
export class Solution {
  /**
   * @param s: a string
   * @param words: a dictionary of words
   * @return: the number of words[i] that is a subsequence of S
   */
  numMatchingSubseq(S, words) {
    let n = S.length;
    let nxtPos = [...Array(n)].map((x) => Array(26));

    for (let i = 0; i < 26; i++) nxtPos[n - 1][i] = -1;

    for (let i = n - 1; i >= 0; i--) {
      nxtPos[i][S[i].charCodeAt(0) - 97] = i;
      if (i == 0) {
        break;
      }
      for (let j = 0; j < 26; j++) nxtPos[i - 1][j] = nxtPos[i][j];
    }

    let ans = 0;
    for (const word of words) {
      if (this.isSubseq(word, nxtPos)) {
        ans++;
      }
    }

    return ans;
  }

  isSubseq(word, nxtPos) {
    let lenw = word.length;
    let lens = nxtPos.length;
    let i, j;
    for (i = 0, j = 0; i < lenw && j < lens; i++, j++) {
      j = nxtPos[j][word[i].charCodeAt(0) - 97];
      if (j < 0) {
        return false;
      }
    }
    return i == lenw;
  }
}
```

```java
public class Solution {
    /**
     * @param s: a string
     * @param words: a dictionary of words
     * @return: the number of words[i] that is a subsequence of S
     */
    public int numMatchingSubseq(String s, String[] words) {
        //先建一个二维数组把每个字符的ascii存起来，
        int n = s.length();
        int[][] memo = new int[n][26];

        //把最下一行进行init，之后再一行一行的像是填充数据
        for(int j=0; j<26; j++){
            memo[n-1][j]=-1;
        }

        //遍历每个字符，让每个字符str.charAt(i)都填入相应的位置
        for(int i=n-1; i>=0; i--){
            //memo[i][j] 表示串str的第i个位置起, 下标最靠前的字符 str[j] (ascii代码-97) 的位置.
            memo[i][(int) s.charAt(i)-'a'] = i;
            if(i==0) break;

            //把当前行的数据，先拷贝一份去上一行
            for(int j=0; j<26; j++){
                memo[i-1][j] = memo[i][j];
            }
        }

        int res = 0;
        for(String word : words){
            if(isSubseq(word, memo)){
                res++;
            }
        }

        return res;
    }

    private boolean isSubseq(String word, int[][] memo){
        int lenw = word.length();
        int lens = memo.length;
        int i=0,j=0;
        for(; i < lenw && j < lens; i++, j++){
            //找到字符word.charAt(i)在当前行j的出现位置，这样就是字符word.charAt(i)在word[j...]子串里最早出现的位置
            // j++ 说明去到当前行之后的行
            j = memo[j][word.charAt(i) - 'a'];

            // j<0 说明在word[j...]里找不到字符word.charAt(i)
            if (j < 0) {
                return false;
            }
        }
        return i == lenw;
    }
}
```
