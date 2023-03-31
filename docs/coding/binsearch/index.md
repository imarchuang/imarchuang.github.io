# 二分法的四种境界

### BFS知识要点列表
1. [套模板](./coding/binsearch/template.md)
1. [OOXX](./coding/binsearch/ooxx.md)
1. [一半一半](./coding/binsearch/half.md)
1. [二分答案](./coding/binsearch/binanswer.md)

### **二分通用痛点**
**二分法的题其实不简单，一是理解题意需要用二分法解决，而是理解题意转化题为找特定值或者找左右边界值得二分问题。**

**更新(2022-10-13)**: 二分法是双指针技巧里比较特殊的一类，我个人觉得跟**滑动窗口老猛男**一样，属于用两个指针框定区间的用法。二分法里最希望的就是不断让两个指针距离变窄，直到exit条件满足。这么说好了，二分法解题框架可能很多，但我只推荐一种，那就是用**左闭右开**方法去寻找左右边界的题。这几条规则应该牢记：
> 1. 这样缩小区间的路径只有**left=mid+1**或者**right=mid**
> 1. 左边界返回left，右边界返回left-1
> 1. 处理出界问题只有一种方法：找左边界时候left值可能到了nums.length了所以要查left==nums.length；找右边界时候left可能还是0，left-1就明显出界了所以要查left==0；只要没出界，统一返回nums[left(左边界)或者left-1(右边界)]==target?left(左边界)或者left-1(右边界): -1;

> 1. **找特定值的二分题，用左右都闭的区间模板，然后用`while(left<=right)`带等号，因此扩展条件是`left=mid+1和right=mid-1`；不要忘记在while循环外最后返回-1**，比如说，`寻找单个元素`的题例子：[162,1901] 找极大值
> 1. **找左右边界的二分题，用左开右闭的区间模板，然后用`while(left<right)`带等号，因此扩展条件是`left=mid+1和right=mid`**
>    * 左边界可以理解为：nums中含有小于target的元素有left个，返回left
>    * 右边界可以理解为：nums中含有小于等于target的元素有left-1个，返回left-1

**更新(2023-03-31)**: 二分法和滑动窗口都算是双指针里技巧性比较强的特殊类别，都属于用**搜索区间**概念来框定搜索范围的算法。东哥写了首诗来描述二分搜索框架里的注意事项，我这里更精华一点，如果你看了这几个提示能够在脑子勾勒出二分搜索框架来，我感觉你也不用再花一个小时去读东哥的帖子了。
> 1. 找特定值的二分题最简单，但是面试中不怎么见。建议用**左右都闭**的区间模板，即`[left, right]`，这里记住三点：
>    * 左右都闭区间代表着你要搜索区间里的所有元素，包括left和right索引上的元素，所以while循环的结束条件是`[right+1, right]`也就是说区间里不可能存在任何元素了，所以while循环的结束条件是`while(left<=right)`；
>    * 左右都闭区间代表着你要搜索区间里的所有元素，包括left和right索引上的元素，所以你right的初始值是`nums.length-1`，因为你是需要搜索`nums[right]`的；
>    * 这个左右都闭区间怎么缩小法？因为如果你检查到`nums[mid]==target`就直接返回了，所以其他情况要这么缩小区间：`[left, mid-1]`或者`[mid+1, right]`；
> 
> 1. 找左右边界的二分题，用**左开右闭**的区间模板，即`[left, right)`，这里记住五点：
>    * 左开右闭区间代表着你要搜索区间里的所有元素除了right索引上的那个，所以while循环的结束条件是`[right, right)`(其实也是`[left, left)`)就已经说明区间里不可能存在任何元素了，所以while循环的结束条件是`while(left<right)`不带等号，且扩展规则是`[left, mid)`或者`[mid+1, right)`；
>    * 左开右闭区间代表着你要搜索区间里的所有元素除了right索引上的那个，所以你right的初始值是`nums.length`，因为**不需要**搜索`nums[right]`的；
>    * 这个左开右闭区间区间怎么缩小规则是：`[left, mid)`或者`[mid+1, right)`，重点就是怎么处理`nums[mid]==target`的情况：
>       * 当你搜索左边界时候，即使遇到了`nums[mid]==target`，你还是*期望*这个mid的**左边**还有target元素对吧？最差就是mid索引了对吧？所以你要把右边界right缩小，即`right=mid`。你知道最差也是mid，然后你还把区间边界改成`[left, mid)`，说明你最终*可能*需要返回left; 这里的**可能**是因为你可能压根就没找到target，还有一种可能就是你搜过了所有元素全部都小于target，说明`left=right == nums.length`;
>       * 当你搜索左边界时候，即使遇到了`nums[mid]==target`，你还是*期望*这个mid的**右边**还有target元素对吧？最差就是mid索引了对吧？所以你要把右边界right缩小，即`left=mid+1`，这时候你知道最差也是mid，然后你还把区间边界改成`[mid+1, right)`，说明你最终*可能*需要返回left-1; 这里的**可能**是因为你可能压根就没找到target，还有一种可能就是你搜过了所有元素全部都大于target，说明`left=right == 0`;

直接上模板吧

> ----------找特定值--------------
```js
// 用左右都闭区间
const find_target = (nums, target) => {
    let left=0, right=nums.length-1; //左右都闭区间
    while(left<=right){ //时间的结束条件是这个区间值[right-1, right]
        let mid = left + Math.floor((right-left)/2);
        if(nums[mid]==target){
            return mid;
        } 
        else if(nums[mid]>target){
            right=mid-1;
        }
        else if(nums[mid]<target){
            left=mid+1;
        }
    }
    return -1;
}
```
> ----------找左右边界--------------
```js
// ----------找左边界--------------
// 用**左闭右开**区间
const find_left_bound = (nums, target) => {
    let left=0, right=nums.length; //左闭右开区间
    while(left<right){ //时间的结束条件是这个区间值[right, right]，即left==right了
        let mid = left + Math.floor((right-left)/2);
        if(nums[mid]==target){
            //把区间缩小至到mid（不包含mid）的空间，再去找target，
            //因为结束条件是[right, right]，所以left之后最大会达到这个mid值
            right = mid; 
        } 
        else if(nums[mid]>target){
            right=mid;
        }
        else if(nums[mid]<target){
            left=mid+1;
        }
    }

    //nums中含有小于target的元素有left个
    if(left==nums.length) return -1
    return nums[left]==target ? left : -1; 
}

// ----------找右边界--------------
// 用**左闭右开**区间
const find_right_bound = (nums, target) => {
    let left=0, right=nums.length; //左开右闭区间
    while(left<right){ //时间的结束条件是这个区间值[right, right]，即left==right了
        let mid = left + Math.floor((right-left)/2);
        if(nums[mid]==target){
            //把区间缩小至到[mid+1,right)（不包含right）的空间，再去找target，
            //因为结束条件是[right, right]，所以left之后最小会达到这个mid+1值
            //这是为什么返回的时候要left-1
            left = mid+1; 
        } 
        else if(nums[mid]>target){
            right=mid;
        }
        else if(nums[mid]<target){
            left=mid+1;
        }
    }

    //nums中含有小于等于target的元素有left-1个
    if(left==0) return -1;
    return nums[left-1]==target ? left-1 : -1; 

}
```

### **九章模板**
> 使用条件
> 1. 排序数组 (30-40%是二分) 
> 1. 当面试官要求你找一个比 O(n) 更小的时间复杂度算法的时候(99%) 
> 1. 找到数组中的一个分割位置,使得左半部分满足某个条件,右半部分不满足(100%)
> 1. 找到一个最大或最小值使得某个条件满足(90%)

> 复杂度
> 时间 O(logN)
> 空间 O(1)
