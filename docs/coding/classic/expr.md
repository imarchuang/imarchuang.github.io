# 表达式相关的几个问题

### 第一类：表达式拆分
!> **敲黑板** 这里穷举问题多数都是子串切割问题，
1. [领扣424. 逆波兰表达式求值](#逆波兰表达式求值) https://www.lintcode.com/problem/424



### 第二类：动规类，通常是两个字符串作为输入
!> **敲黑板** 这类动规问题里通常会用到一种状态转化思想，那就是答案里不含有s1[i]，或者答案里不含有s2[j]，或者答案里不含有s1[i]和s2[j]，最后一种情况就当`s1[i]==s2[j]`时怎么处理。
>
1. [72. 编辑距离](https://leetcode.com/problems/edit-distance/) 
>   **思路** 这题看着就让人懵啊，不过还是按照套路来嘛，又是两个字符串的问题，凭经验也应该快速写出对应的dp函数`dp(s1, i, s2, j)`，然后顺着语义把这个dp函数定义清楚，`dp函数代表s1[0...i]和s2[0...j]之间的最小编辑距离`，然后接下来就是套我们记忆化搜索模板。这题需要**注意**的是，其实选择列表有四个选项，增删替，还有就是啥都不做，当`s1[i]==s2[j]`时，其实啥都不做就是最优的选择。这题的详解可以[看这里](./coding/dp/sebusequence?id=编辑距离)，而且这题的记忆化搜索解法可以[看这里](./coding/memo/index?id=编辑距离)。
>
1. [1143. 最长公共子序列](https://leetcode.com/problems/longest-common-subsequence/) 
>   **思路** 这题是子序动规里经典的问题了(LCS)。一共4种情况吧，情况1：如果`s1[i]==s2[j]`，说明此字符一定存在于公共子序中，所以就直接递归到下一层`1+dp(s1, i+1, s2, j+1);`。情况2：s1[i]不在最长公共子序中；情况3：s2[j]不在最长公共子序中；情况4：s1[i]和s2[j]都不在最长公共子序中；因为是求最长公共子序嘛，所以情况4已经被情况2和情况3涵盖了，所以当`s1[i]!=s2[j]`时，我们要取最优`Math.max(dp(s1, i+1, s2, j),dp(s1, i, s2, j+1));`。这题的详解可以[看这里](./coding/dp/sebusequence?id=最长公共子序列)。
>
1. [79. 最长公共子串](https://www.lintcode.com/problem/79/) 
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
1. [面试真题. 找字符串中符合word的子序列](#找字符串中符合word的子序列)

### 逆波兰表达式求值
[领扣424. 逆波兰表达式求值](https://www.lintcode.com/problem/424) 

> **思路** 经典题目，逆波兰的好处就是用一个stack从前往后遍历即可。

```java
public class Solution {
    /**
     * @param tokens: The Reverse Polish Notation
     * @return: the value
     */
    public int evalRPN(String[] tokens) {
        // 表达式拆解，肯定是用stack的
        Stack<Integer> stack = new Stack<>();

        for(String c : tokens){
            if("+".equals(c)){
                int second = stack.pop();
                int first = stack.pop();
                stack.push(first+second);

            } else if("-".equals(c)){
                int second = stack.pop();
                int first = stack.pop();
                stack.push(first-second);
            } else if("*".equals(c)){
                int second = stack.pop();
                int first = stack.pop();
                stack.push(first*second);
            } else if("/".equals(c)){
                int second = stack.pop();
                int first = stack.pop();
                stack.push((int) first/second);
            } else {
                stack.push(Integer.valueOf(c));
            }
        }

        return stack.pop();
    }
}
```

### 单词拆分II
[140. 单词拆分II](https://leetcode.com/problems/word-break-ii/) 

> **思路** 这题本质上是用分治法处理子串组合问题。想象s是一个字符串，子串问题的连续性决定了可以不把这个子串一切为二，头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`。这样就可以这么判断，如果头部是一个word，那么只要判断尾部是不是一个可切分的字符串就可以了，这样这个问题的思路就很容易转化到递归思维。
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
> 按照惯例，两个字符串，第一眼看上去得用`dp(s1, i, s2, j)`的函数签名技巧来解题了，但是仔细一像这里的第二个strinng s2不是那么容易判断怎么走去下一个j。但是回过头来想想在[单词拆分II]()和[回文串切割]()这两个题中，有一个重要的递归思想就是把一个字符串进行`str.substring(0,i+1)`和`str.substring(i+1)`的两段字符串切割，使得递归思想能运用进来。具体到这题呢，思想是这样的：pattern的输入能，只能单个字符单个字符的往右移动i指针，那么核心问题变成了用什么样的步骤让j指针有节奏的右移呢？没什么好方法对吧？那就穷举呗。怎么个穷举法呢？这就需要用到把str切成`str.substring(0,i+1)`和`str.substring(i+1)`的两段字符串，先假设头部字符串`str.substring(0,i+1)`是match到`pattern[0]`的，然后再想办法证明尾部字符串`str.substring(i+1)`是可以基于这个假设成立的。如果最后证明假设的头部字符串match的事实是不成立，那么就再试下一个头部字符串（将i++就等于扩展了头部字符串的长度)。
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

### 找字符串中符合word的子序列
[找字符串中符合word的子序列](#找字符串中符合word的子序列)
[领扣样题](https://www.lintcode.com/problem/1024/)

> **题目描述**
> 给出一个字典words，例如[cat, tax, baby, bird, sky]，判断一个字符串str中是否含有一个子序能够形成字典中的任意word。**注意**：这个子序的异构词能形成word即可。
>
> **思路** 拿到这题，我的第一反应是用类似滑动窗口处理子串问题的思想，即：给出一个window，这个window里记录某个word的所有字符的出现次数，比如说cat这个词，就可以形成`{'c':1, 'a':1, 't':1}`。然后遍历str的每个字符，如果遍历过程中能让cat所对应的window里的键值对都满足，那就说明这个word就是答案。因为给出的是一个多个word的字典，那么就字典里的每个word都建立各自的window就好了。我说这个思路的原因是因为这样解题是错误的，因为严格意义上子序列是要遵循原序的，所以这样解题会输出错误答案。之后会给出正确的答案。
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
> **正确答案** 
```js

const find_embedded_word = (words, str) => {
    //先建一个二维数组把每个字符的ascii存起来，
    let n = str.length;

    定义 memo[n][26], 其中 memo[i][j] 表示串str的第i个位置起, 下标最靠前的字符 str[j] (ascii代码-97) 的位置.
    let memo = [...Array(n)].map(x=>Array(26));
    //init
    for(let j=0; i<26; j++){
        memo[n-1][j]=-1;
    }

    //遍历每个字符，让每个字符str[i]都填入相应的位置
    for(let i=n-1; i>=0; i++){
        memo[i][str[i].charCodeAt(0)-97] = i;
        if(i==0) break;
        
        for(let j=0; i<26; j++){
            memo[i-i][j] = memo[i][j];
        }
    }

    let res = 0;
    for(const word of words){
        if(isSubseq(word, memo)){
            res++;
        }
    }

    return res;
}

const isSubseq = (word, memo) => {
    let lenw = word.length;
    let lens = memo.length;
    let i,j;
    for(i=0, j=0; i < lenw && j < lens; i++, j++){
        j = memo[j][word[i].charCodeAt(0) - 97];
        if (j < 0) {
            return false;
        }
    }
    return i == lenw;
}

```
