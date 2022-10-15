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
// ----------找右边界--------------
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
