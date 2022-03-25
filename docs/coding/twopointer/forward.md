# 同向型双指针

### 同向型双指针主要是快慢指针
1. 链表上的快慢双指针。
1. 数组上的快慢双指针。


> 这篇帖子主要就是演示怎么从题目抽象出抽象函数f(x)和目标值target的思路过程。

### **刷题列表**
1. [26. 删除有序数组中的重复项（简单）](#删除有序数组中的重复项)
1. [83. 删除排序链表中的重复元素（简单）](#删除排序链表中的重复元素)
1. [27. 移除元素（简单）](#移除元素)
1. [283. 移动零（简单）](#移动零)

### 删除有序数组中的重复项
[26. 删除有序数组中的重复项（简单）](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)  

?> **[思路]** 思路就是快慢指针。一个fast来探头，一个slow来收尾，如果发现他俩同值，那就是重复项了，就让fast继续recon，知道他俩不同值了，说明slow要前进了，而且前进完要赋值=fast的值。

```js
var removeDuplicates = function(nums) {
    let slow=0, fast=0;
    
    while(fast<nums.length) {
        if(nums[slow]==nums[fast]){
            fast++;
        } else {
            nums[++slow] = nums[fast];
            fast++;
        }
    }
    
    return slow+1;
};
```
### 删除排序链表中的重复元素
[83. 删除排序链表中的重复元素（简单）](https://leetcode.com/problems/find-the-duplicate-number/)  

?> **[思路]** 根[这题](#删除有序数组中的重复项)思路基本相同，只不过数组变链表了。一个fast来探头，一个slow来收尾，如果发现他俩同值，那就是重复项了，就让fast继续recon，知道他俩不同值了，说明slow要前进了，`不过这里不用去改slow.next的值，而是可以直接吧slow连过去fast`。

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

?> **[思路]** 这题有两种思路，一是同向双指针，另一是对向双指针。想说说对向的，从两边往中间走。首先，遇到左边指向target值就左右交换，交换后左边不动，右指针左移一位。这里注意对向双指针不能维持原来非target值得原序。

```js
var removeElement = function(nums, val) {
    //还是双指针，遇到val就跟最后一个元素换并j--，要不就i++
    let i=0, j=nums.length-1;
    while(i<=j){
        if(nums[i]==val){
            [nums[i],nums[j]]=[nums[j],nums[i]];
            j--;
        }
        else {
            i++;
        }
    }
    
    return i;
};
```

?> **[思路]** 这题再提供一种思路，就是能不能修改数组的同时还维持原序？那就是用同向双指针。
```js
var removeElement = function(nums, val) {
    let slow=0, fast=0;
    while(fast<nums.length){
        if(nums[fast]!=val){
            nums[slow]=[nums[fast];
            slow++;
        }
        fast++;
    }
    
    return slow;
};
```

### 移动零
[283. 移动零（简单）](https://leetcode.com/problems/move-zeroes/) 

?> **[思路]** 这题要求了需要保持非0值的原序，所以借鉴[这题](#移除元素)同向双指针的思路，先把非0的值都移到左边，然后剩下的赋值0就好了。


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
            nums[slow]=[nums[fast];
            slow++;
        }
        fast++;
    }
    
    return slow;
};
```

