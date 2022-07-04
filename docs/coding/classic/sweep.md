# 扫描线问题

> 我之前在几个知名半导体工厂工作过大于6年，其实在那儿的工作50%左右的时间在解决排程scheduling相关的问题，正好想写一些区间相关的算法题的理解，那就用工厂里的一些案例来形象的深入思考一下吧。
>
>1. 场景1：假设工厂里某个生产环节只有一台机器可以用，现在假设有若干**货**需要加工这个步骤（每种货的加工时间可能不一样），可以想象这些货到达这个机器时候，机器不一定是闲着的，你老板的唯一KPI就是如何将尽可能多的**货**安排到这台机器上？这里你的老板其实是有点儿傻的，因为货的数量多了，并不一定机器的利用率就高。这个问题需要将这些货（区间）按结束时间（右端点）排序，然后进行处理，
>       * 如果； 
>       * 还有以加强理解。
>1. 场景2；给你一个时间段（你可以想象成你的值班时间），然后现在一大堆货（区间来表示的），和一个较长的视频片段，请你从较短的片段中尽可能少地挑出一些片段，拼接出较长的这个片段。



### 刷题列表
1. [253. 安排会议室II](#安排会议室II)
1. [1288. 删除被覆盖区间](#删除被覆盖区间)
1. [1541. 平衡括号字符串的最少插入次数](#平衡括号字符串的最少插入次数)

### 安排会议室II
[253. 安排会议室II](https://leetcode.com/problems/meeting-rooms-ii/)

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