# 关于括号的常见问题

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