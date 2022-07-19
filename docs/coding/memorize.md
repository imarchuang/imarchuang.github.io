# 阅读并背诵全文

### **二叉搜索树BST的迭代器Iterator**
```js
/*
这里assume一个预设好的stack，这个stack的初始化也是在constructor里一路向西直到null；
*/
//升序排列找下个值
const next = (stack) => {
    let res = stack[stack.length-1]; //栈顶就是结果
    let node = res;
    //重新更新stack
    //没有右子树，那就从当前路径中找到第一个左拐的节点
    if(!node.right){
        node = stack.pop();
        while(stack.length>0 && stack[stack.length-1].right == node){
            node = stack.pop();
        }
        return res;
    }

    //存在右子树，然后一路向西
    node = node.right;
    while(node) {
	    stack.push(node);
	    node = node.left;
    }

    return res;
}
```

### **二叉搜索树BST的左边界和右边界**
```js

```
1. ### **二叉树的递归改迭代框架**
1. ### **快速排序的partition**
```java
private static int partition(int[] nums, int lo, int hi){
    int pivot = nums[lo];
    int left=lo+1, right=hi;
    //当i>j时循环结束，以保证[lo,hi]都被覆盖
    //这里要特别注意边界条件，(left,right)两端都是开区间，这样你才能保证++或--的过程中不越界
    while(left<=right){
        while(left<hi && nums[left]<=pivot){
            left++;
            //此while结束时恰好nums[left]>pivot
        }
        while(right>lo && nums[right]>pivot){
            right--;
            //此while结束时恰好nums[right]<=pivot
        }
        //此时[lo,left)<=pivot && (j,hi]>pivot

        if(i>=j) break;
        swap(nums, left, right);
    }
    //将pivot放到合适位置，即pivot左边元素较小，右边元素较大
    swap(nums, lo, right);
    return right;
}
private static void swap(int[] nums, int i, int j){
    int temp = nums[i];
    nums[i]=nums[j];
    nums[j]=temp;
}
```