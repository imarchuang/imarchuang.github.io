# 同向型双指针 - 滑动窗口老猛男

> 之前提过同向型双指针主要是快慢指针，这篇重点讲一下同向型双指针的另一类 -> **滑动窗口老猛男**

滑动窗口的题leetcode上挺多的，但是我想开篇提一下我刚刚在wayfair面试的时候遇到的[这道题](#wayfair面试真题)。正好沉着对滑动窗口的热度，今天把这个老猛男能解决的问题都扫一遍。

> 滑动窗口的框架很直接，就是两个while loop，但是唯一的难点在于把`更新逻辑`和`计算结果逻辑`放在哪里的问题，这篇帖子就好好扒一扒这层皮。`计算结果逻辑`其实只有三个地方可放，一是放在窗口扩展`更新逻辑`后的位置，二是放在窗口缩小`更新逻辑`前的位置，三是放在窗口扩展过程中`更新逻辑`的逻辑内部。
>
> 滑动窗口的窗口是个**左边右开**区间，所以当你一开始把left=0和right=0赋值之后呢，相当于`[0,0)`区间，意思就是个空区间，没有任何元素的。

### 刷题列表
1. [wayfair面试真题](#wayfair面试真题)
1. [Uber面试真题](#Uber面试真题)
1. [Square面试真题](#Square面试真题)
1. [76 最小覆盖子串](#最小覆盖子串) 
1. [567 字符串的排列](#字符串的排列)
1. [438 字符串中异位词](#字符串中异位词) 
1. [643 最大平均值子数组](#最大平均值子数组)
1. [3 无重复字符的最长子串](#无重复字符的最长子串) 
1. [386 领扣-最多有k个不同字符的最长子串](#最多有k个不同字符的最长子串)

### wayfair面试真题
先看看原题语义：

> Suppose we have an unsorted log file of accesses to web resources. Each log entry consists of an access time, the ID of the user making the access, and the resource ID. 
>
> The access time is represented as seconds since 00:00:00, and all times are assumed to be in the same day.

```js
Example:
logs1 = [
    ["58523", "user_1", "resource_1"],
    ["62314", "user_2", "resource_2"],
    ["54001", "user_1", "resource_3"],
    ["200", "user_6", "resource_5"],    
    ["215", "user_6", "resource_4"],
    ["54060", "user_2", "resource_3"],
    ["53760", "user_3", "resource_3"],
    ["58522", "user_22", "resource_1"],
    ["53651", "user_5", "resource_3"],
    ["2", "user_6", "resource_1"],
    ["100", "user_6", "resource_6"],
    ["400", "user_7", "resource_2"],
    ["100", "user_8", "resource_6"],
    ["54359", "user_1", "resource_3"],
]

Example 2:
logs2 = [
    ["300", "user_1", "resource_3"],
    ["599", "user_1", "resource_3"],
    ["900", "user_1", "resource_3"],
    ["1199", "user_1", "resource_3"],
    ["1200", "user_1", "resource_3"],
    ["1201", "user_1", "resource_3"],
    ["1202", "user_1", "resource_3"]
]

Example 3:
logs3 = [
    ["300", "user_10", "resource_5"]
]
```
> Write a function that takes the logs and returns the resource with the highest number of accesses in any 5 minute window, together with how many accesses it saw.
>
> Expected Output:
>most_requested_resource(logs1) # => ('resource_3', 3)
>Reason: resource_3 is accessed at 53760, 54001, and 54060
>
>most_requested_resource(logs2) # => ('resource_3', 4)
>Reason: resource_3 is accessed at 1199, 1200, 1201, and 1202
>
>most_requested_resource(logs3) # => ('resource_5', 1)
>Reason: resource_5 is accessed at 300
>
>Complexity analysis variables:
>
>n: number of logs in the input

!> **说说当时思路** 可能是我最近刷的题比较多，我听我面试官讲解题意，我基本上脑子已经确定是用`滑动窗口老猛男了`，又看到是个Array题，里边又有数字（时间），我基本上确定需要把array先sort一下。然后就是把这个思路讲解给面试官了，听到他觉得可行，我就开始写code了。下面展示的是我当时写出来的答案，我写的第一个struggle就是哪里放`找最大cnt结果的更新逻辑`，当时为了快点写完就放到了内嵌while loop之上（就是进入valid之前），不过在测试的时候就发现不太行，因为window的范围有可能已经超出5分钟限制了。后来一通改，先把`更新逻辑`试图写进内嵌while loop里，然后脑子过一下觉得这不科学，因为输入array可能会都在一个5分钟里，这样内嵌while loop就一直也run不到了。最后就把条件`if((logs[right-1][0]-logs[left][0])<=300)`加上了，这样就能保证`更新逻辑`只在valid时候被运行，算是写对了。但是还有一个问题没解决，结果总是显示resource对了，但是count不对，后来慢慢debug才发现是没有及时的更新`highestCnt = cnt`。

!> 面试官说了，做题时间是30分钟，如果做的快就给第二题。然后面试官还说可以google查找相关library怎么用之类的，但是不能copy-paste相关代码；搜索的时候也不可以直接搜问题的相关答案；我觉得这挺好的，因为30分钟做两道题的可能性很低，除非两道都是简单题。

!> 答案虽然给出来了，但是这里再说几点我觉得可以改进的地方：
> 1. 可以把`logs[right-1][0]-logs[left][0]<=300`抽象到一个variable里，比如说`let valid = logs[right-1][0]-logs[left][0]<=300`，这样就可以用这个variable来检查是否需要`更新逻辑`，和是否需要缩小window。
> 1. 再遇到滑动窗口的问题，先把最后需要的答案在写while loop之前写出来，比如说这题里的`let res = []; let highestCnt = -1;`，这样会让自己写答案的过程更顺畅。二者这题我觉得更好的写法是不要把res写成array，可以这么写`let resId = ''; let highestCnt = -1;` 最后再`return [resId,highestCnt];`。
 
!> 最后提一下，当时听题意的时候没太注意，后来面试官又补充了一次说函数不能修改原来array，所以我当时就很讨巧的说了句，`that's why I chose Javascript for coding challenges`, `because I can just use a spread operator to make it happen`。之后就把原来code`logs.sort((a,b)=> a[0]-b[0])`改成了`logs = [...logs].sort((a,b)=> a[0]-b[0])`，事情就解决了。

```js
const logs1 = [
    ["58523", "user_1", "resource_1"],
    ["62314", "user_2", "resource_2"],
    ["54001", "user_1", "resource_3"],
    ["200", "user_6", "resource_5"],   
    ["215", "user_6", "resource_4"],
    ["54060", "user_2", "resource_3"],
    ["53760", "user_3", "resource_3"],
    ["58522", "user_22", "resource_1"],
    ["53651", "user_5", "resource_3"],
    ["2", "user_6", "resource_1"],
    ["100", "user_6", "resource_6"],
    ["400", "user_7", "resource_2"],
    ["100", "user_8", "resource_6"],
    [ "54359", "user_1", "resource_3"],
];

const logs2 = [
    ["300", "user_1", "resource_3"],
    ["599", "user_1", "resource_3"],
    ["900", "user_1", "resource_3"],
    ["1199", "user_1", "resource_3"],
    ["1200", "user_1", "resource_3"],
    ["1201", "user_1", "resource_3"],
    ["1202", "user_1", "resource_3"],
];

const logs3 = [
    ["300", "user_10", "resource_5"],
];

const getHighestUsedResrouce = (logs) => {
  //console.log('initial input:: ',logs);
  //sort the logs input
  logs = [...logs].sort((a,b)=> a[0]-b[0]);
  //console.log(logs);

  let res = [];

  let left=0, right=0;
  let window = {};
  let highestCnt = -1;

  while(right<logs.length){
    let log = logs[right];
    right++;
    let resourceId = log[2];
    if(window[resourceId]){
      window[resourceId]++;
    } else {
      window[resourceId] = 1;
    }

    if((logs[right-1][0]-logs[left][0])<=300){
      //loop thru window object to calculate the hightest resourse 
      for(const [resId, cnt] of Object.entries(window)){
        if(cnt>highestCnt) {
          highestCnt = cnt;
          res = [resId, highestCnt];
        }
      }
      //console.log('-----------------------res--------------', res);
    }
    //console.log(window);
    
    while((logs[right-1][0]-logs[left][0])>300){
      let logD = logs[left];
      left++;
      let resourceIdToDel = logD[2];
      window[resourceIdToDel]--;

      //console.log(window);
    }
  }

  return res;
}

//testing
console.log('original', logs1);
console.log('final Result::', getHighestUsedResrouce(logs1));
console.log('after', logs1);

console.log('original', logs2);
console.log('final Result::', getHighestUsedResrouce(logs2));
console.log('after', logs2);

console.log('original', logs3);
console.log('final Result::', getHighestUsedResrouce(logs3));
console.log('after', logs3);
```
### Uber面试真题
**原题** Given input array [4,2,1,3,2,3,2,6,1], T=1, returnt the longest strict subarray. **strict subarray**: any two element in the subarray, the absolute value of their difference <= T.
**思考** 这题算是吃大亏了，主要问题在于对sliding问题的思路不够及时。给暴力算法的时候呢，我其实已经意识到是需要在遍历j的过程中维护一个min和max，只要min和max只差小于T就行，但问题就在于没有及时的意识到我其实可以缩小这个窗口，只要保证缩小的过程中依旧能知道窗口里所有元素的min和max就行。
```java
public static getLongestStrictSubarray(int[] array, int T){
    int n= array.length;
    TreeMap<Integer, Integer> window = new TreeMap<>();
    int left=0, right=0;
    int res = 1;
    while(right<n){
        window.put(array[right], right);
        while(window.lastKey() - window.firstKey() > T){
            res =  Math.max(res, right-left);
            int cur = array[left];
            int lastIdx = window.get(array[left]);
            if(array[left]==window.lastKey() || array[left]==window.firstKey()){
                if(window.get(array[++left]) < lastIdx)
                    window.remove(array[left]);
            }

            window.remove(cur);
        }
        right++;
    }
}
```

### 最小覆盖子串
[76 最小覆盖子串](https://leetcode.com/problems/minimum-window-substring/) 

!> **思路** 其实很容易就可以判断这是一个滑动窗口题，主要是因为这是个子串问题，字符串子串问题，通常会用滑动窗口来解决。这题直接用两个variables会比较顺畅，`let res = ''; let minLen = Number.MAX_VALUE;`, 因为这个minLen可以判断是否存在一个最短子串。此题`计算结果逻辑`放在窗口缩小`更新逻辑`前的位置，因为只有子串包含所有need的字母了才会有答案。还有就是窗口缩小的更新逻辑应该是`if(need[d] && window[d]<need[d]) valid--;`，要用小于号。

```js
var minWindow = function(s, t) {
    let left=0, right=0;
    let window = {};
    let need = {};
    let valid = 0;
    
    //init need first
    for(const c of t){
        if(need[c]){
            need[c]++;
        } else {
            need[c] = 1;
        }
    }
    let keyLen = Object.keys(need).length;
    
    let res = '';
    let minLen = Number.MAX_VALUE;
    
    while(right<s.length){
        let c = s[right];
        right++;
        
        if(window[c]){
            window[c]++;
        } else {
            window[c] = 1;
        }
        
        //更新逻辑
        if(window[c] == need[c]) valid++;
        
        while(valid==keyLen){
            
            if(minLen > right-left) {
                minLen = right-left;
                res = s.substring(left, right);
            }
            
            let d = s[left];
            left++;
            
            window[d]--;
            if(need[d] && window[d]<need[d]) valid--;
        }   
    }
    
    return minLen == Number.MAX_VALUE? '' : res;
};
```
### Square面试真题
> 这题的第一问是leetcode[这道题](https://leetcode.com/problems/maximum-average-subarray-i/)的变种，给你一个数组比如说`nums = [1.0,12.0,-5.0,-6.0,50.0,3.0]`，再给你一个窗口值`k = 2`，让你找moving average，比如说例子中的数字就会返回这个result数组：`[1.0,6.5,3.5,-5.5,22.0,26.5]`。
> 这题是典型的的**滑动窗口老猛男**题，套模板就好了。
```java
class Solution{
    public int getMovingAverages(double[] array, int k){
        int n = array.length;
        int right=0;
        int[] res = new int[n];
        int sum = 0;
        while(right<n){
            if(right>=k){
                sum -= array[right-k];
            }
            sum += array[right];

            int size = right>=k?k:right+1;
            res[right] = (double) Math.round(sum/size * 100) / 100;
        }

        return res;
    }
}
```
> 这题第二问followup是这样子的，现在再给你一个输入参数叫pct=0.05，比如说如果你新加入一个元素之后的moving average于之前的moving average的绝对值差超过了这个pct，那说明你直接跳过这个元素。这次你就不能单纯的靠一个right指针打天下了，而是需要清楚地知道目前选的元素是啥，这就需要一个list来维护一个window。
```java
class Solution{
    public int getMovingAverages(double[] array, int k, double pct){
        int n = array.length;
        int right=1;
        int[] res = new int[n];
        res[0] = array[0];
        List<Double> window = new ArrayList<>();
        window.add(array[0]);
        int sum = 0;
        while(right<n){
            if(right>=k){
                sum -= array[right-k];
            }
            sum += array[right];

            int size = window.size()>=k?k:window.size()+1;
            double potentialAvg = (double) Math.round(sum/size * 100) / 100;
            double preAvg = res[right-1];

            if(Math.abs(potentialAvg-preAvg)/preAvg <= pct){
                //maintain window
                window.add(array[right]);
                if(window.size()>k)
                    window.remove(0);
                res[right++] = potentialAvg;
            }
            else {
                //reset sum
                sum = preAvg*window.size();
                res[right++] = preAvg;
            }
        }

        return res;
    }
}
```

> 这题第三问followup是bonus，很可惜我面试时候没做到。不过我猜应该是这样的：**这次你不要通过pct判断是否要加入，而是把window里比当前要加入的元素最接近的值踢走**，这样来算moving average。这里的思路也很直白，就是要用TreeSet来维护这个window了，用PQ不好使，因为要踢走/删除元素。

### 字符串的排列
[567 字符串的排列](https://leetcode.com/problems/permutation-in-string/) 

!> **思路** 真理啊，子串问题全靠滑动窗口老猛男。字符串子串问题，通常会用滑动窗口来解决。这题返回的是true/false，`计算结果逻辑`放在窗口缩小`更新逻辑`前的位置，因为只有子串包含所有need的字母了才会有答案。注意算是否包含所有need的字母的时候，要算每个字母出现次数的和，然后判断这个和是否跟s1.length相等。

```js
var checkInclusion = function(s1, s2) {
    let left=0, right=0;
    let window = {};
    let need = {};
    
    //init need
    for(const c of s1){
        if(need[c]){
            need[c]++;
        }
        else {
            need[c] = 1;
        }
    }
    
    while(right<s2.length){
        let c = s2[right];
        right++;
        if(window[c]){
            window[c]++;
        }
        else {
            window[c] = 1;
        }
        
        while(right-left==s1.length){
            //check window and need
            let cnt = 0;
            for(const [key, val] of Object.entries(need)){
                if(window[key]!=val) break;
                cnt+=val;
            }
            
            if(cnt==s1.length) return true;
            
            let d = s2[left];
            left++;
            window[d]--;
        }
    }
    
    return false;
};
```
### 字符串中异位词
[438 字符串中异位词](https://leetcode.com/problems/find-all-anagrams-in-a-string/) 

!> **思路** 真理啊，子串问题全靠滑动窗口老猛男。这题和[字符串的排列](#字符串的排列)几乎是一样的，只不过不是true/false判断了，而是把结果全返回。异构次anagram就是排列的另一种说法，挺起来挺高大上的。

```js
var findAnagrams = function(s, p) {
    let left=0, right=0;
    let window={}, need={};
    
    let res = [];
    //init need
    for(const c of p){
        if(need[c]){
            need[c]++;
        } else {
            need[c] = 1;
        }
    }
    
    while(right<s.length){
        let c = s[right];
        right++;
        if(window[c]){
            window[c]++;
        } else {
            window[c] = 1;
        }
        
        while(right-left>=p.length){
            //计算结果逻辑
            let cnt = 0;
            for(const [key, val] of Object.entries(need)){
                if(window[key] != val) break;
                cnt += val;
            }
            
            if(cnt == p.length) res.push(left);
            
            let d = s[left];
            left++;
            window[d]--;
        }
    }
    
    return res;
};
```
### 无重复字符的最长子串
[3 无重复字符的最长子串](https://leetcode.com/problems/longest-substring-without-repeating-characters/) 

!> **思路** 真理啊，子串问题全靠滑动窗口老猛男。`计算结果逻辑`放在窗口扩展`更新逻辑`后的位置，因为不是一定要缩小窗口才有答案，当然这里比较讨巧的一个写法就是放在窗口扩展`更新逻辑`里的位置。

```js
var lengthOfLongestSubstring = function(s) {
    let left=0, right=0;
    let window = {};
    
    let longest = 0;
    let valid = false;
    
    while(right<s.length){
        let c = s[right];
        right++;
        
        if(window[c]){
            window[c]++;
            valid=true;
        } else {
            window[c] = 1;
            longest = Math.max(longest, right-left);
        }
        
        while(valid) {
            let d = s[left];
            left++;
            window[d]--;
            
            if(window[d]==1) valid=false;
        }
    }
    
    return longest;
};
```
### 最大平均值子数组
[643 最大平均值子数组](https://leetcode.com/problems/maximum-average-subarray-i/)  

!> **思路** 简单啊，子数组问题，滑动窗口啊，况且滑动窗口的大小都给你了叫k。`计算结果逻辑`放在窗口缩小`更新逻辑`前的位置，因为只有当窗口够k的长度了才会计算结果。

```js
var findMaxAverage = function(nums, k) {
    let left=0, right=0;
    
    let maxSum = -Number.MAX_VALUE;
    
    let sum = 0;
    
    while(right<nums.length){
        let num = nums[right];
        right++;
        
        sum += num;
        
        while(right-left>=k) {
            maxSum = Math.max(maxSum, sum);
            let numD = nums[left];
            left++;

            sum -= numD;
        }
    }
    
    return maxSum/k;
    
};
```
### 最多有k个不同字符的最长子串
[386 领扣-最多有k个不同字符的最长子串](https://www.lintcode.com/problem/386)

!> **思路** 子串问题，滑动窗口啊，况且滑动窗口的大小都给你了叫k。`计算结果逻辑`放在窗口缩小`更新逻辑`前的位置，因为只有当窗口够k的长度了才会计算结果。