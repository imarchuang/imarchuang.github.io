# 关于括号的常见问题

> 括号类的题有两种，一种是跟括号的合法性相关，另一种是关于括号生成的。
>
>1. 关于第一类，主要就是要维护一个rolling state的概念，这个思路类似于扫描线数飞机，遇到左括号就+1，遇到右括号就-1，以此来判定括号的合理性。这里的rolling state是两个参数值，一个叫left，一个叫right，就是说如果当前left==0，说明state里没有左括号（或者说左括号已经被平衡掉），这时候再遇到右括号，需要right++，这样能遍历一遍就找到不合法的左括号数和右括号数。
>       * 如果括号有多种类型，或者需要找到invalid括号的index时候，我们需要维护一个栈stack来辅助保存当下状态； 
>       * 还有一种情况需要栈stack，就是当我们需要前一层的数字计算值(e.g., 数字和)的时候，这类问题非常像表达式类的问题思路，情况[此篇](./coding/classic/expr)以加强理解。
>1. 关于第二类，主要的思路就是用backtracking生产括号的组合，类似于subset子集类问题；

### 刷题列表
1. [20. 有效的括号](#有效的括号)
1. [921. 使括号有效的最少添加](#使括号有效的最少添加)
1. [1541. 平衡括号字符串的最少插入次数](#平衡括号字符串的最少插入次数)

### 有效的括号
[20. 有效的括号](https://leetcode.com/problems/valid-parentheses/)

> **思路** 用一个叫做left的栈，遇到左括号就入栈，遇到有括号就去栈中寻找最近的左括号，看是否匹配。

```js
var isValid = function(s) {
    let left = [];
    
    for(let i=0; i<s.length; i++){
        let c = s[i];
        if(['(', '[', '{'].includes(c)){
            left.push(c);
        }
        else {
            if(left.length>0 && left[left.length-1] == leftOf(c)){
                left.pop();
            } else {
                return false;
            }
        }
    }
    
    return left.length==0;
};

const leftOf = (c) => {
    let res;
    switch(c) {
        case ')':
            res = '(';
            break;
        case ']':
            res = '[';
            break;
        case '}':
            res = '{';
            break;
        default:
            res = '';
    }
    
    return res;
}
```
### 使括号有效的最少添加
[921. 使括号有效的最少添加](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/)

```js
var minAddToMakeValid = function(s) {
    // res 记录插入次数, need 变量记录右括号的需求量
    let res = 0, need = 0;
    for(let i=0; i<s.length; i++){
        if (s[i] == '(') {
            // 对右括号的需求 + 1
            need++;
        }
        
        if (s[i] == ')') {
            // 对右括号的需求 - 1
            need--;

            if (need == -1) {
                need = 0;
                // 需插入一个左括号
                res++;
            }
        }
    }
    
    return res + need;
};
```
### 平衡括号字符串的最少插入次数
[1541. 平衡括号字符串的最少插入次数](https://leetcode.com/problems/minimum-insertions-to-balance-a-parentheses-string/)

> **思路** 跟[上一题](#使括号有效的最少添加)特别类似，此题假设`1个`左括号需要匹配`2个`右括号才叫做有效的括号组合。这题的难点在于`当遇到左括号时，若对右括号的需求量为奇数，需要插入 1 个右括号`.

```js
var minInsertions = function(s) {
    let res=0, need=0;
    
    for(let i=0; i<s.length; i++){
        let c = s[i];
        if(c=='('){
            need += 2;
            
            if(need%2==1){
                res++;
                need--;
            }
        }
        
        if(c==')'){
            need--;
            if(need==-1){
                res++;
                need=1;
            }
        }
    }
    
    return res+need;
};
```