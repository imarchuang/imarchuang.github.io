# 阅读并背诵全文

### **二叉搜索树BST的迭代器Iterator**
```js
/*
这里assume一个预设好的stack，这个stack的初始化也是在constructor里一路向西直到null；
*/
//升序排列找下个值
const next = (stack) => {
    let res = stack[stack.length-1];
    let node = res;
    //重新更新stack
    if(!node.right){//没有右子树，那就从当前路径中找到第一个左拐的节点
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