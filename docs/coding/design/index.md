# 二分法的四种境界

### BFS知识要点列表
1. [套模板](./coding/binsearch/template.md)
1. [OOXX](./coding/binsearch/ooxx.md)
1. [一半一半](./coding/binsearch/half.md)
1. [二分答案](./coding/binsearch/binanswer.md)

### **二分通用痛点**
**二分法的题其实不简单，一是理解题意需要用二分法解决，而是理解题意转化题为找特定值或者找左右边界值得二分问题。**

> 1. **找特定值的二分题，用左右都闭的区间模板，然后用`while(left<=right)`带等号，因此扩展条件是`left=mid+1和right=mid-1`；不要忘记在while循环外最后返回-1** 
> 比如说，`寻找单个元素`的题例子：[162,1901] 找极大值
> 1. **找左右边界的二分题，用左开右闭的区间模板，然后用`while(left<right)`带等号，因此扩展条件是`left=mid+1和right=mid`**
>    * 左边界可以理解为：nums中含有小于target的元素有left个，返回left
>    * 右边界可以理解为：nums中含有小于等于target的元素有left-1个，返回left-1

直接上模板吧

```js
// ----------找特定值--------------
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

```js
// ----------找左边界--------------
// 用左开右闭区间
const find_left_bound = (nums, target) => {
    let left=0, right=nums.length; //左开右闭区间
    while(left<right){ //时间的结束条件是这个区间值[right, right]
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
    return left; //nums中含有小于target的元素有left个
}
```
```js
// ----------找右边界--------------
// 用左开右闭区间
const find_right_bound = (nums, target) => {
    let left=0, right=nums.length; //左开右闭区间
    while(left<right){ //时间的结束条件是这个区间值[right, right]
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
    return left-1; //nums中含有小于等于target的元素有left-1个
}
```

