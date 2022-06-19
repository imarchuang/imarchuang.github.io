# 同向型双指针

### 同向型双指针主要是快慢指针
1. 链表上的快慢双指针
1. 数组上的快慢双指针
1. 用快慢双指针思维进行递归条件检测


> 这篇帖子主要是深入理解一下快慢指针的妙处。滑动窗口老猛男也是同向双指针，不过老猛男类题的妙处在于所求答案通常在窗口的大小里，所以移动左指针还是右指针通常取决于整个窗口内的元素是否符合某个限制条件。快慢双指针呢，它的妙处在于，快指针用来探索，当快指针探索到某个特定条件时候，这时候通常再对慢指针进行处理。打个不太准确的比喻，你几乎可以想象成快指针是用来扫描用的，慢指针呢就是用来存储用的。快指针通常用来探测什么呢？
> 1. 数组/链表是否到头了？检测是否有环等
> 1. 是否探测到了某种特质的元素了？不等于0的元素？跟慢指针不相等的元素？
>
> 还有啊，有一类需要用到快慢指针策略的题通常都是要求你去重或者其他类似的**原地删除**。

### **刷题列表**
1. [26. 删除有序数组中的重复项（简单）](#删除有序数组中的重复项)
1. [83. 删除排序链表中的重复元素（简单）](#删除排序链表中的重复元素)
1. [27. 移除元素（简单）](#移除元素)
1. [283. 移动零（简单）](#移动零)
1. [202. 快乐数字](#快乐数字) https://leetcode.com/problems/happy-number/

### 删除有序数组中的重复项
[26. 删除有序数组中的重复项（简单）](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)  
?> **[思路]** 思路就是快慢指针，因为数组有序嘛，所以重复的元素是挨着的，主要是原题要求**原地修改**。一个fast来探头，一个slow来收尾，如果发现他俩同值，那就是重复项了，就让fast跳过它继续recon，这里你是否觉得有点子序类动规的思想了？这题本质是个子序题。当快慢指针不同值了，说明快指针指向了一个不能被跳的元素，这时候保留这个数值的**原地**做法就是把这个值保存在`++slow`的位置上，意思就是：slow指针前进一位，然后前进完要赋值fast指针所指向的值。

```js
var removeDuplicates = function(nums) {
    let slow=0, fast=0;
    
    while(fast<nums.length) {
        if(nums[slow]==nums[fast]){
            fast++;
        } else {
            nums[++slow] = nums[fast]; //slow指针前进一位，然后前进完要赋值fast指针所指向的值
            fast++;
        }
    }
    
    return slow+1;
};
```
### 删除排序链表中的重复元素
[83. 删除排序链表中的重复元素（简单）](https://leetcode.com/problems/find-the-duplicate-number/)  
?> **[思路]** 跟[上一题](#删除有序数组中的重复项)思路相同，只不过将数组变成链表了。那就来一个fast来探头，再来一个slow来收尾，如果发现他俩同值，那就是重复项了，那就跳过它让fast继续recon，直到他俩不同值了，说明需要++slow来保持fast指针的值了，不过这里链表有个好处，就是它的node有个next指针，所以直接**去改将slow.next指向fast节点吧，还要记得slow也要移到fast现在的位置哟**。

```js
if (!head) return null;
    let fast=head, slow=head;
    while(fast){
        if(slow.val != fast.val) {
            slow.next = fast;
            slow = slow.next;
        }
        
        fast = fast.next;
    }
    
    // 断开与后面重复元素的连接
    slow.next = null;
    return head;
```

### 移除元素
[27. 移除元素（简单）](https://leetcode.com/problems/remove-element/)
> **[思路]** 这题还是一个**原地删除**的题，所以用双针是必须的了。有两种思路，一是同向双指针，另一是对向双指针。
> 1. 先说说对向的：思路就是类似QuickSelect里的partition思维，就是说把数组partition成两个部分，前半部分是不等于target的元素，后半部分是等于target的元素。这里时空复杂度都是最优的，但是呢，这个思路不能维持原序，就不是处理子序列类的思维了。用两根指针从两边往中间对头走，当左指针指向等于target值时，说明要换到右半部分去，那就左右交换。这里一个小技巧就是交换后左指针先不动，右指针左移一位，这样就巧妙的处理了让右指针指向右起最早的那个非target元素。
> 1. 再说说同向的：如果题目需要你原地删除的同时还要维持原序呢？那就是用同向双指针。思路在上两个类似原地删除的题里演示过了，用一个fast来探头，一个slow来收尾，如果发现快指针指向了一个不等于target值得元素，说明我们可以让slow所指的位置赋值fast所指的值了，并且slow++；这里隐含的意思就是如果碰到fast指向了一个等于target的值，那就让fast跳过它继续recon；这里你是否觉得有点子序类动规的思想了？这就是为什么这种解法能维持原序。

```js
var removeElement = function(nums, target) {
    //还是双指针，遇到target就跟最后一个元素换并j--，要不就i++
    let i=0, j=nums.length-1;
    while(i<=j){
        if(nums[i]==target){
            [nums[i],nums[j]]=[nums[j],nums[i]]; //swap
            j--;
        }
        else {
            i++;
        }
    }
    
    return i;
};
```
```js
var removeElement = function(nums, target) {
    let slow=0, fast=0;
    while(fast<nums.length){
        if(nums[fast]!=target){
            nums[slow]=nums[fast];
            slow++;
        }
        fast++;
    }
    
    return slow;
};
```

### 移动零
[283. 移动零（简单）](https://leetcode.com/problems/move-zeroes/) 

?> **[思路]** 这题是[上一题](#移除元素)的套娃，因为题中明确要求了需要保持非0值的原序（子序），所以借鉴你可以回看上一题同向双指针的思路的详细解释来加深理解：先把非0的值都移到左边，然后剩下的赋值0就好了。


```js
var moveZeroes = function(nums) {
    let p = removeElement(nums,0);
    for(let i=p;i<nums.length;i++){
        nums[i]=0;
    }
};

var removeElement = function(nums, val) {
    let slow=0, fast=0;
    while(fast<nums.length){
        if(nums[fast]!=val){
            nums[slow]=nums[fast];
            slow++;
        }
        fast++;
    }
    
    return slow;
};
```

### 快乐数字
1. [202. 快乐数字](https://leetcode.com/problems/happy-number/) 
> **[思路]** 这题呢，题目一眼肯定看不出来是快慢指针的问题，但是核心思路是怎么从递归答案里找环，所以用的就是同向快慢指针的思维。
```java
public class Solution {
    public boolean isHappy(int n) {
        int slow = n;
        int fast = n;
        while(slow>1){
            slow = cal(slow) ;
            if(slow==1) return true ;
            fast = cal(cal(fast));
            if(fast==1) return true ;

            if(slow==fast) return false;
        }
        return true;
    }
    private int cal(int n){
        int x = n;
        int s = 0;
        while(x>0){
            s = s+(x%10)*(x%10);
            x = x/10;
        }
        return s;
    }
}
```
