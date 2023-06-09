# 关于异位词的一些问题见解

### 刷题列表
1. [49. 字母异位词分组](#字母异位词分组)
1. [921. 使括号有效的最少添加](#使括号有效的最少添加)
1. [1541. 平衡括号字符串的最少插入次数](#平衡括号字符串的最少插入次数)

### 字母异位词分组
[49. 字母异位词分组](https://leetcode.com/problems/group-anagrams/)

> 先声明一下，这题在亚麻的电面里出现了。我的回答过程也很巧妙，所以想借这题简单讲一下遇到简单题时候增加互动场面的一些技巧。
>
> **思路** 核心主要是在给你一串字符串的前提下怎么找共同的**底**base。因为所谓的异位词就是一个字母组合的各种排列。最近简单的思路就是把这个字符排序一下，那么看俩个词是否为异位词就出结果了，这是这个排序是O(nlogn)的，所以在字符串很长的时候是很耗时的。有没有一个O(n)的解法呢？答案是有的：因为都是字符，所以你可以用一个26长度的数组，然后每个位置代表一个alphabet，里面的数据代表这个alphabet出现的次数，时不时很聪明？

```js
var groupAnagrams = function(strs) {
    
    let m = {};
    for(const str of strs){
        let base = genBase(str);
        if(m[base]){
           m[base].push(str); 
        }
        else {
           m[base] = [str]; 
        }
    }
    
    return Object.values(m);
};

const genBase = (str) => {
    //return str.split('').sort().join('');
    let arr = Array(26).fill(0);
    for(const c of str){
        let ascii = c.charCodeAt(0);
        if(arr[ascii-97]){
            arr[ascii-97]++;
        } else {
            arr[ascii-97] = 1;
        }
    }
    
    return arr.join(',');
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