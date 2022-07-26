# 关于字符串的几大类问题

>关于字符串，永远都是面试题里最受欢迎的，而且我也写过好几篇相关总结类的帖子了，比如说一下三个
>1. [表达式处理](./coding/classic/expr) -  主要是总结了**掏心**的概念，是一类特殊的`字串问题`，主要的特点在切割过程中有嵌套的特点，所以需要一个stack栈来维护**层**的概念。
>1. [子序概论](./coding/classic/subsequence) -  主要是总结了**子序**的概念，但是并非只是针对字符串，而是针对字符串的数组特性。
>1. [括号处理](./coding/classic/parentheses) -  主要是总结了**Rolling State**的概念。
>
>我觉得总结的还是不够透彻，所以再写一篇，试图再深入的扒扒皮。
>1. 就像我们之前说整个计算机其实只有两种结构，一个是数组一个是链表，这里我也试图高屋建瓴得说字符串的题只有两种，一是字串类，另一个是子序类。再细一点儿说就是字符串就是个数组，而且数组里的元素都是可以转成ascii码的，所以这些元素都是**可以排序**的，这个序通常称为lexi字典序。
>1. 当你依着字符串就是个数组的思路，那么数组的一些聪明的遍历技巧你就可以用了，比如说：
>       * 双指针技巧，比如说怎么判断一个字符串是回文串；
>       * 二分法技巧，毕竟字符串里的元素是有大小的，所以二分法也是使用的，只不过这类题还真是少见；
>       * 滑动窗口老猛男，算是同向双指针，这类题目真的很多，不过判定窗口是**要扩张还是缩小**的手段通常是按照字符的一些特性来的，比如说有没有重复字符啊之类的；具体的细节，请读这篇帖子。
>       * 合理利用单调栈技巧，例题就是去**重重复字母**，因为题目中要求字典序。
>1. 字符串本身是不具备链表特质的，所以那些链表的一些技巧比如快慢指针找中点之类的在这儿就不适用了。
>1. 来说说子串类相关吧。子串嘛，肯定就是对字符串进行有效切割了对吧，这类也是比较多样的：
>       * 子串类题目，上述提到的滑动窗口啊，单调栈啊，都是你应该考虑的有限思路，这类题也比较有特点，所以认出是这类题并不难；
>       * 子串类题目的第二类思路就是直接往递归上去想，最直接的递归思路就是将字符串切割成两段**子串**：头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`；这样二分切得好处就是可以去验证头部比较小的子串是否符合题意，如果符合，就可以递归式的对尾部子串进行相同的递归式处理了。这个思路基本上都可以用分治或者回溯框架写出答案来；这里举个经典的例子，让你把`"catsanddog"`切分成字典里的单词，字典是这样的`[’cat','cats','and','sand','dog]`，这个解法就是(二)分治，如果你看到头部`s.substring(0, 3)`是cat，那么你只要再去用相同的方式切`s.substring(3)=sanddog`就好了；
>       * 子串类题目的第三类思路就是所谓的**掏心**嵌套式切分，也就是说你切分的单位可能是嵌套在**不同层**的，这时候**栈**就是一个特别好的缓存结构，因为是先进后出LIFO，很适合嵌套结构，但是栈里存啥很**注重技巧**。按部就班，从左往右遍历所有字符，遇到**开始信号**(e.g.,左括号)，你就需要利用栈合理的比较这是**某一层**的开始，然后你可以单纯的对此层字符压栈，然后遇到**结束信号**(e.g.,右括号)时候就处理栈内元素直到你之前标记的**当前层**的开始(比如说，此层开始的时候你压了个数字，因为你确定说左括号前肯定是个数字)，这个类似二叉树的**后序逻辑**；你也可以在遇到**开始信号**(e.g.,左括号)时候就直接对当前层确定一个范围，比如说instantiate一个新的TreeMap，然后你可以单纯的对此层字符进行TreeMap内的操作，直到在你遇到结束信号时候直接pop出这个TreeMap做逻辑处理，这个类似二叉树的**前序逻辑**，因为你在一开始就界定了**层内**的数据范围；你也可以在遇到**开始信号**(e.g.,左括号)时候就直接对将这个左括号压栈，然后依规处理此层的字符(比如说压栈)，直到在你遇到结束信号时候直接pop栈内元素做逻辑处理直到遇到你一开始时候压的那个左括号；还有一种更`暴力美学`的做法，那就是每次遇到**开始信号**(e.g.,左括号)时候就直接递归到下一层，然后每层递归都维护自己的stack栈。最后呢，还要一类相对比较难的，那就是开始结束点不太明显的，就不要在parse的过程中试图分层，分层留给后序总的处理器吧。；   
>1. 现在再来说说子序列类相关的吧。
>       * 子序列的问题应该不难看出来，基本上都牵扯**蛙跳**的逻辑在题意里。如果是书字符串，这种情况可以说非常的模板化，基本上都是针对s1[i]和s2[j]是否相等，进行四种选择：(a) 跳过s1[i]，(b) 跳过s2[j]，(c) 跳过s1[i]和s2[j]，(d) 两者都不跳；还有一种问法就是让你做通配符匹配，概念上是一样的。
>       * 针对单个字符串的子序列的问题类型，
>       * 还有一类暴力子序列问题，就直接问你一个字符串a是否为另一个字符串b的子序列，这个的核心技巧就在于你可以先把字符串b转成一个二维数组，比如说`abcdebdde`就可以转成如下二维数组，matrix[i][j]向表示b中第i个字符开始的后边每个字符的最早的而出现位置，j坐标就是字符(小写字母)的asscii码;
>
>
>
```java
//abcdebdde => 
[
    [  0, 1, 2, 3, 4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第0行
    [ -1, 1, 2, 3, 4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第1行
    [ -1, 5, 2, 3, 4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第2行
    [ -1, 5,-1, 3, 4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第3行
    [ -1, 5,-1, 6, 4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第4行
    [ -1, 5,-1, 6, 8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第5行
    [ -1,-1,-1, 6, 8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第6行
    [ -1,-1,-1, 7, 8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], //第7行
    [ -1,-1,-1,-1, 8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]  //第8行
]
```


### 第一类：穷举呗，回溯遍历或者分治都是思考路线
!> **敲黑板** 这里穷举问题多数都是子串切割问题，那么既然是子串（连续性），那算法复杂度就应该是控制在`O(n^2)`这样子。q这类穷举问题里通常会用到一种递归思想，那就是把一个字符串切割成两段子串：头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么假设头部符合某个条件（比如说头部是一个word），那么基于这个假设成立再证明尾部是正确的就可以了，这样这个问题的思路就很容易转化到递归思维已经证明尾部的问题。
1. [212. 单词查找II](#单词查找II)
1. [140. 单词拆分II](#单词拆分II) 
1. [131. 回文串切割](#回文串切割) 
1. [829. 单词模式II](#单词模式II)

### 第二类：动规类，通常是两个字符串作为输入
!> **敲黑板** 这类动规问题里通常会用到一种状态转化思想，那就是答案里不含有s1[i]，或者答案里不含有s2[j]，或者答案里不含有s1[i]和s2[j]，最后一种情况就当`s1[i]==s2[j]`时怎么处理。
>
1. [72. 编辑距离](https://leetcode.com/problems/edit-distance/) 
>   **思路** 这题看着就让人懵啊，不过还是按照套路来嘛，又是两个字符串的问题，凭经验也应该快速写出对应的dp函数`dp(s1, i, s2, j)`，然后顺着语义把这个dp函数定义清楚，`dp函数代表s1[0...i]和s2[0...j]之间的最小编辑距离`，然后接下来就是套我们记忆化搜索模板。这题需要**注意**的是，其实选择列表有四个选项，增删替，还有就是啥都不做，当`s1[i]==s2[j]`时，其实啥都不做就是最优的选择。这题的详解可以[看这里](./coding/dp/sebusequence?id=编辑距离)，而且这题的记忆化搜索解法可以[看这里](./coding/memo/index?id=编辑距离)。
>
1. [1143. 最长公共子序列](https://leetcode.com/problems/longest-common-subsequence/) 
>   **思路** 这题是子序动规里经典的问题了(LCS)。一共4种情况吧，情况1：如果`s1[i]==s2[j]`，说明此字符一定存在于公共子序中，所以就直接递归到下一层`1+dp(s1, i+1, s2, j+1);`。情况2：s1[i]不在最长公共子序中；情况3：s2[j]不在最长公共子序中；情况4：s1[i]和s2[j]都不在最长公共子序中；因为是求最长公共子序嘛，所以情况4已经被情况2和情况3涵盖了，所以当`s1[i]!=s2[j]`时，我们要取最优`Math.max(dp(s1, i+1, s2, j),dp(s1, i, s2, j+1));`。这题的详解可以[看这里](./coding/dp/sebusequence?id=最长公共子序列)。
>
1. [领扣79. 最长公共子串](https://www.lintcode.com/problem/79/) 
>   **思路** 这题核心是个数学归纳法。解决子串问题吧，就要谨记连续这个词，所以整着遍历字符串，看看以这个数结尾的子串最长公共子序是多少是多少？这是不是就好找多了？所以思路变得很简单，如果`s1[i]==s2[j]`，那就看dp[i-1][j-1]的值，直接是`dp[i][j] = 1+dp[i-1][j-1];`，因为前一个字母结尾的最长公共子串再加1才是当前的最长公共子串。同理，如果`s1[i]!=s2[j]`，那就`dp[i][j] = 0`。这题的详解可以[看这里](./coding/dp/indices?id=最长公共子串)。
>
1. [516 最长回文子序](https://leetcode.com/problems/longest-palindromic-subsequence/)
>   **思路** 这题是为数不多的单个字符串但需要二维dp数组的问题。当`s[i]==s[j]`时, 简单啊，答案就是`2 + dp(s, i+1, j-1)`。当`s[i]!=s[j]`时, 就三种情况了，分别是
>   1. 最长子回文序列里含有s[i];
>   1. 最长子回文序列里含有s[j];
>   1. 最长子回文序列里既不含有s[i]也不含有s[j];
> 第三种情况可以不考虑，因为我们再找最长回文子序，情况1和2其实已经涵盖了情况3了。你仔细体会一下，这个思路是不是跟[最长公共子序列]()一模一样的？
>
> 这题的详解可以[看这里](./coding/dp/sebusequence?id=最长回文子序)。
>
1. [1312. 构造回文的最小插入次数](https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/) 
>   **思路** 这题和上一题[最长回文子序]()其实本质上是镜面操作题。你琢磨琢磨，`把一个字符串变成回文串的最少操作次数`是不是可以先找`这个字符串的最长回文子序`。这题的详解可以[看这里](./coding/dp/sebusequence?id=构造回文的最小插入次数)。
>

### 第三类：单纯子串类，通常是要介入滑动窗口老猛男
> 这类相关问题请阅读[这篇帖子](./coding/twopointer/sliding)。

### 第IV类：单调栈类
1. [316. 去重重复字母](#去重重复字母) 

### 第V类：子序列类
1. [Karat面试真题 - 找字符串中符合word的子序列](#找字符串中符合word的子序列)

### 单词查找II
[212. 单词查找II](https://leetcode.com/problems/word-search-ii/) 
> **思路** 这题本质是图（矩阵）的遍历问题，这题矩阵吧不像是flood-fill那类的问题，可以直接替换原矩阵的值来标记是否已经visited过，所以外加一个visited变量，这个变量可以用二维数组也可以用json object，不过不考虑空间的话，二维数组比较简单易懂。这题要想通过leetcode的online judge的话，`最关键的是init一个prefixSet变量`。
>
> **敲黑板** 图的遍历和回溯框架的核心区别：
> 1. 把节点加入path的代码和之后pop出去的代码（`做选择和撤销选择`）要放到For循环外，要不会漏掉记录起始点的遍历；
> 1. For循环内，进入递归下一层前进行必要的剪枝检查，比如说有没有出界啊，有没有已经visited过了呀之类的；

```js
/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function(board, words) {
    //form a prefix set to speed up
    let prefixSet = new Set();
    for(const word of words) {
        for(let i=1; i<=word.length; i++){
            let pre = word.substring(0,i);
            prefixSet.add(pre);
        }
    }
    maxLen = Math.max(...words.map(x=>x.length));
    
    //loop thru the whole matrix
    let m=board.length, n=board[0].length;
    let visited=[...Array(m)].map(x=>Array(n).fill(false));
    
    words = new Set(words);
    let res = [];
    for(let i=0; i<m; i++){
        for(let j=0; j<n; j++){
           dfs([], board, words, i, j, prefixSet, visited, res); 
        }
    }
    
    return res;
};
var DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
var maxLen = 0;

const dfs = (path, board, words, i, j, prefixSet, visited, res) => {
    let m=board.length, n=board[0].length;
    path.push(board[i][j]);
    visited[i][j] = true;
    let word = path.join('');
    if(words.has(word)){
        res.push(word);
        words.delete(word);
        //继续走下去，因为cat还有cats
    }
    
    for(const dir of DIRS){
        if(path.length>maxLen) break;
        if(!prefixSet.has(word)) break;
        let x=i+dir[0];
        let y=j+dir[1];
        
        if(x<0 || y<0 || x>=m || y>=n){
            continue;
        }
        if(visited[x][y]){
            continue;
        }
        dfs(path, board, words, x, y, prefixSet, visited, res);
    }
    visited[i][j] = false;
    path.pop();
}
```

### 单词拆分II
[140. 单词拆分II](https://leetcode.com/problems/word-break-ii/) 

> **思路** 这题本质上是用分治法处理子串组合问题。想象s是一个字符串，子串问题的连续性决定了可以把这个子串一切为二，头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么判断，如果头部是一个word，那么只要判断尾部是不是一个可切分的字符串就可以了，这样这个问题的思路就很容易转化到递归思维。
>
> 最后说一下，这题是可以用memo来进行剪枝的，见下面解法2.

```js
var wordBreak = function(s, wordDict) {
    if(!s) return [];
    
    let res = [];
    
    if(wordDict.includes(s)) res.push(s);
    
    for(let i=0; i<s.length; i++){
        let word = s.substring(0, i+1);
        if(!wordDict.includes(word)) continue;
        
        let suffix = s.substring(i+1);
        let remainings = wordBreak(suffix, wordDict);
        
        if(remainings.length>0){
            for(const rem of remainings){
                res.push(word+" "+rem);
            }
        }
    }
    
    return res;
};
```

> 用memo剪枝
```js
var memo = {};
var wordBreak = function(s, wordDict) {
    memo = {};
    
    return dfs(s, wordDict);
}

const dfs = (s, wordDict) => {
    if(memo[s]) return memo[s];
    if(!s) return [];
    
    let res = [];
    
    if(wordDict.includes(s)) res.push(s);
    
    for(let i=0; i<s.length; i++){
        let word = s.substring(0, i+1);
        if(!wordDict.includes(word)) continue;
        
        let suffix = s.substring(i+1);
        let remainings = dfs(suffix, wordDict);
        
        if(remainings.length>0){
            for(const rem of remainings){
                res.push(word+" "+rem);
            }
        }
    }
    
    memo[s] = res;
    return res;
};
```
### 回文串切割
[131. 回文串切割](https://leetcode.com/problems/palindrome-partitioning/) 
> **思路** 这题跟上一题[单词拆分II]()有异曲同工之妙，只不过这里，用memo剪枝作用几乎微乎其微。另外，这题是个非常典型的回溯问题，就连函数签名`const backtrack = (s, startIndex, partition, res)`都非常像极了[子集](./coding/dfs/subset?id=子集)这题，唯一的不同就是在递归进入下一层之前的剪枝`if (!isPalindrome[startIndex][i]) continue;`，因为这里剪枝条件是看是否为回文串。
>
> **敲黑板** 有个小技巧这里：判断一个一个字符串所有回文串的位置[i,j]的类似动规的写法，请看code里那个`getIsPalindrom`的函数。

```js
var isPalindrome = [];
var partition = function(s) {
    let n = s.length;
    isPalindrome = getIsPalindrom(s);
    let res = [];
    backtrack(s, 0, [], res);
    return res;
};

const backtrack = (s, startIndex, partition, res) => {
    if (startIndex == s.length){
        formResultPath(s, partition, res);
        return;
    }

    for (let i = startIndex; i < s.length; i++) {
        if (!isPalindrome[startIndex][i]) continue;
    
        partition.push(i);
        backtrack(s, i + 1, partition, res);
        partition.pop();
    }
}

const formResultPath = (s, partition, res) => {
    let idx = 0;
    let path = [];
    for(let i=0; i<partition.length;i++){
        path.push(s.substring(idx, partition[i] + 1));
        idx = partition[i] + 1;
    }
    res.push([...path]);
}

const getIsPalindrom = (s) => {
    let n = s.length;
    let dp = [...Array(n)].map(x=>Array(n).fill(true));
    for(let i=n-2; i>=0; i--){
        for(let j=i+1; j<n; j++){
            if(i<j){
                if(s.charAt(i)==s.charAt(j)){
                    dp[i][j] = dp[i+1][j-1]; 
                } else {
                    dp[i][j] = false;
                }
                    
            } 
        }
    }
    
    return dp;
    
}
```
### 单词模式II
[829. 单词模式II](https://www.lintcode.com/problem/829/) 

> **思路** 函数签名是`wordPatternMatch(pattern, str)`。这题算是hard题了，主要是这里用到了`双指针的技巧`，但是`双指针`的第二个指针j不是那么容易理解。
> 按照惯例，两个字符串，第一眼看上去得用`dp(s1, i, s2, j)`的函数签名技巧来解题了，但是仔细一像这里的第二个strinng s2不是那么容易判断怎么走去下一个j。但是回过头来想想在[单词拆分II](#单词拆分II)和[回文串切割](#回文串切割)这两个题中，有一个重要的递归思想就是把一个字符串进行`str.substring(0,i+1)`和`str.substring(i+1)`的两段字符串切割，使得递归思想能运用进来。具体到这题呢，思想是这样的：pattern的输入能，只能单个字符单个字符的往右移动i指针，那么核心问题变成了用什么样的步骤让j指针有节奏的右移呢？没什么好方法对吧？那就穷举呗。怎么个穷举法呢？这就需要用到把str切成`str.substring(0,i+1)`和`str.substring(i+1)`的两段字符串，先假设头部字符串`str.substring(0,i+1)`是match到`pattern[0]`的，然后再想办法证明尾部字符串`str.substring(i+1)`是可以基于这个假设成立的。如果最后证明假设的头部字符串match的事实是不成立，那么就再试下一个头部字符串（将i++就等于扩展了头部字符串的长度)。
>
> 这题还有一个难点是怎样证明尾部字符串`str.substring(i+1)`是可以基于头部match这个假设成立的。这里需要维护两个路径参数，一个叫map，一个叫set。
> 1. 举个例子，patter是'aabb'，str是'blueblueredred'；map很容易理解，就是记录目前已知的假设，比如说map里有`map['a']='blue'`，所以当遇到第二个a的时候，就直接让j指针右移四位，因为已经假设a对应的子串是blue了。
> 1. 举另个例子，patter是'aabc'，str是'blueblueredred'；set有点难理解，这里就说明一下。如果你的假设成立，就是说当i指针穷举到第四个时候，map里应该已经有`map['b']='red'`了；这样的话，在穷举遍历str时候，发现同一个词`red`又出现了，这说明同一个词`red`需要对应两个不同的pattern里的字符，所以此路不通应该直接跳过。
>

```js
export class Solution {
  /**
   * @param pattern: a string,denote pattern string
   * @param str: a string, denote matching string
   * @return: a boolean
   */
  wordPatternMatch(pattern, str) {
    // write your code here
    let map = {}, set=new Set();
    return this.backtrack(pattern, str, map, set);
  }

  backtrack(pattern, str, map, set) {

    //base case:
    if(pattern.length == 0) return str.length == 0;

    let p = pattern[0];
    if(map[p]) {
      let word = map[p];
      if(!str || !str.startsWith(word)){
            return false;
        }
      return this.backtrack(pattern.substring(1), str.substring(word.length), map, set);
    }

    for(let i=0; i<str.length; i++) {
      let prefix = str.substring(0, i+1);
      //说明出现了相同的word，却对应着不同的character pattern
      if(set.has(prefix)) continue;

      //做选择
      map[p] = prefix;
      set.add(prefix);

      let suffix = str.substring(i+1);
      //剪枝，遇到一个可以，立即退出
      if(this.backtrack(pattern.substring(1), suffix, map, set)) return true;

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

> **思路** 字符串去重能多难？就直接用hashmap或者trie呗；但是这个lexicographical order还真是把人难住了，单单hashmap不好使啊。子串需要保持原序嘛，看到lexi order直接去单调栈上想吧。

```js
var removeDuplicateLetters = function(s) {
    let asciiA = Array(256).fill(0);
    
    //先给每个字符做个count
    for(const c of s){
        let ascii = c.charCodeAt(0);
        asciiA[ascii]++;
    }
    
    let stk = [];
    for(const c of s){
        let asciiC = c.charCodeAt(0);
        asciiA[asciiC]--;
        
        //去重
        if(stk.includes(c)) continue;
        
        while(stk.length>0 && stk[stk.length-1]>c){
            let e = stk[stk.length-1];
            let asciiE = e.charCodeAt(0);
            if(asciiA[asciiE]==0) break; //只剩一个e了,不能再pop了
            
            stk.pop();
        }
        stk.push(c);
    }
    
    return stk.join('');
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

### 找字符串中符合word的子序列
[找字符串中符合word的子序列](#找字符串中符合word的子序列)
[领扣样题](https://www.lintcode.com/problem/1024/)

> **题目描述**
> 给出一个字典words，例如[cat, tax, baby, bird, sky]，判断一个字符串str中是否含有一个子序能够形成字典中的任意word。**注意**：这个子序的异构词能形成word即可。
>
> **思路** 拿到这题，我的第一反应是用类似滑动窗口处理子串问题的思想，即：给出一个window，这个window里记录某个word的所有字符的出现次数，比如说cat这个词，就可以形成`{'c':1, 'a':1, 't':1}`。然后遍历str的每个字符，如果遍历过程中能让cat所对应的window里的键值对都满足，那就说明这个word就是答案。因为给出的是一个多个word的字典，那么就字典里的每个word都建立各自的window就好了。我说这个思路的原因是因为这样解题是错误的，因为严格意义上子序列是要遵循原序的，所以这样解题会输出错误答案。这题正确的答案会在第二部分给出。
>
```js
const find_embedded_word = (words, str) => {
   let wordMap = [];
   //先把每个word建成字母和occurance的键值对map
   for(const word of words) {
     let window = {};
     for(const c of word){
       if(window[c]){
         window[c]++;
       } else {
         window[c] = 1;
       }
     }
     wordMap.push(window);
   }

   //console.log(wordMap);

   for(const c of str) {
     for(let i=0; i<wordMap.length; i++){
       let word = wordMap[i];
       if(word[c]){
         word[c]--;
       }

       if(word[c]==0) delete word[c];
       //console.log(wordMap);

       //如果json object中的键值对都被删除了，说明这个对应的word就是答案
       if(Object.keys(word)==null || Object.keys(word).length==0) return words[i];
     } 
   }

   return null;
}

// console.log(find_embedded_word(words, string1));
// console.log(find_embedded_word(words, string2));
// console.log(find_embedded_word(words, string3));
// console.log(find_embedded_word(words, string4));
// console.log(find_embedded_word(words, string5));
// console.log(find_embedded_word(words, string6));
```
>
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
    let nxtPos = [...Array(n)].map(x=> Array(26));
    
    for (let i = 0; i < 26; i++)
        nxtPos[n - 1][i] = -1;
        
    for (let i = n - 1; i >= 0; i--) {
        nxtPos[i][S[i].charCodeAt(0) - 97] = i;
        if (i == 0) {
            break;
        }
        for (let j = 0; j < 26; j++)
            nxtPos[i - 1][j] = nxtPos[i][j];
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
    let i,j;
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
