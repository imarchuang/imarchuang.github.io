# 用分治法暴力穷举

#### **关于分治** 
> 分治法，多少情况加对应的是动态规划类的问题，因为动规的实质是通过`最优子结构`一步一步向上解决全局问题，所以动规里一定有`子问题`，而且吧通常是`重复子问题`，用分治法肯定是合情合理，因为分治可以得到子问题的最优解。在暴力穷举的问题，我们很少看到大家推荐用分治的写法，而是用`回溯`或者其他`遍历模板`来code，注意原因是通过一个`路径、选择列表、结果集`来写递归函数，简单说就是通俗易懂，也非常符合递归的三要素(递归的定义，递归的出口，递归的拆解等)。但是有些题吧就是邪门，你用回溯模板写出来不容易，而且即使写出来了也不容易解释。
>
> 其实这个分治模板在`记忆化搜索`那帖子里写过类似的，这里的模板跟那个很相似，只不过不是求最优子结构的最值，而是要遍历子问题的结果然后往上递归返回。这里有个常用的技巧就是在某些情况下是可以用记忆化搜索memo来剪枝的。
>
```js
var memo = []
const div_con(路径，选择列表，状态1，状态2，...){
    //base case 递归出口
    if(满足结束条件，比如说状态1已结遍历完) return；// base case, 即递归出口

    if(memo[状态1][状态2][...] != 特定值) return memo[状态1][状态2][...];
    let res= []；//所求的结果集
    for(const 选择 of 选择列表){
        let subproblem = dp(路径，选择列表，状态1’，状态2‘，...)；
        //后序处理subproblem跟当前递归层的逻辑关系
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
> 总结一下跟回溯模板的不同：没有explicitly的`做选择`和`撤销选择`，因为`做选择`和`撤销选择`的步骤被直接当参数传去下一层了，这些参数也只是所谓的`状态`，可以用作memo里的索引。

> 这篇文章通过几个常见的暴力穷举题，看看分治法怎么应用到暴力穷举里。
>
>

### **刷题列表**
> 1. [144. 二叉树的前序遍历](#二叉树的前序遍历)
> 1. [140. 单词拆分II(困难)](#单词拆分II)

### 二叉树的前序遍历
[144. 二叉树的前序遍历](https://leetcode.com/problems/binary-tree-preorder-traversal/)

> **思路** 这个题吧，用递归的方式来做的话，你应该闭着眼也能背诵下来了吧。
```js
var preorderTraversal = function(root) {
    let res = [];
    traversal(root, res);
    return res;
    
};

const traversal = (root, res) => {
    if(!root) return;
    
    res.push(root.val);
    traversal(root.left, res);
    traversal(root.right, res);
}
```
> 当然这不是这篇帖子的重点。这篇帖子想要展示一下分治思想来解决这个问题。直接看code吧：
```js
var preorderTraversal = function(root) {
    
    let res = [];
    if(!root) return res;
    
    res.push(root.val);
    let leftRes = preorderTraversal(root.left);
    let rightRes = preorderTraversal(root.right);
    res = res.concat(leftRes).concat(rightRes);
    return res;
    
};
```
?> 这个解法短小精干，但为什么不常见呢？一个原因是这个算法的复杂度不好把控，比较依赖语言特性。

### 单词拆分II
[140. 单词拆分II(困难)](https://leetcode.com/problems/word-break-ii/)

> **思路** 这题吧，从答案要求可以不难得出这不是个动规题。穷举呗，第一想到的是回溯框架，但问题是这题套用穷举框架的话会很难入手，所以这题的正确思路是用分治思想，然后还可以用memo来进行剪枝。

```js
var memo = {};
var wordBreak = function(s, wordDict) {
    memo = {};
    return divCon(s, wordDict);
    
};

const divCon = (suffix, wordDict) => {
    
    if (memo[suffix]) {
        return memo[suffix];
    }
    
    let res = [];
    
    //base case
    if(!suffix || suffix.length==0) return res;
    
    if(wordDict.includes(suffix)) {
        res.push(suffix);
        //return res;
        //不能停，因为比s也可能是多个子串的combo
    }
    
    //做选择
    for(let i=1; i<=suffix.length; i++){
        let word = suffix.substring(0, i);
        if(!wordDict.includes(word)){
            continue;
        }

        let rem = suffix.substring(i);
        let subproblem = divCon(rem, wordDict);

        if(subproblem.length>0){
            for(const ele of subproblem){
                res.push(word+" "+ele);
            }
        }
        
    }
    
    memo[suffix] = [...res]; 
    return res;
}
```