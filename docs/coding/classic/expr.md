# 表达式相关的几个问题

> 数字的ascii码第大于`'+','-','*','/'`(43,45,42,47)运算符的。

> **更新** 2022-07-21: 今天Twilio面试**翻车**了，主要原因我还没深入总结出来，但是说明自己思维上的缺口还是要注意。原题在各大刷题网站上肯定找不到，但是这个题确实是个好题，虽然面试官(华人小哥，叫Darryl Yong)有点欠扁，但是不得不说题出的还不错。简单说一下，给你一个ofx格式的字符串，然后将这个ofx格式转成合法的xml格式。比如说下面的例子就是ofx格式。
>1. 很明显，这不是严格的xml格式，比如说`<Amount>`里没有closing的`</Amount>`；
>1. 题里直接提示了：用一个data structure来存`fieldName`和`fieldValue`会比较容易解题;
>
> **思路** 我拿到题，基本上已经确定了是个expr类表达式处理的问题，所以借助一个stack栈是肯定的了；不过解题过程中，主要有两部分卡住了：
> 1. 如何确定要压栈的元素的结尾？比如说，`OFX`就是个结尾；
> 1. 如何确定层级关系，使同层的tag可以用一个list串起来？比如说 Amount和DatePosted在同一层，所以希望得到[{Amount:53}, {DatePosted: 20220721100000}]这种数据结构。
>
> 照着这个思路，我开始写码了，从左往右遍历每个字符，`'<'`以这个做delimiter标记每个tag的开始，当遇到开始了，就用一个内循环一直走知道遇到下一个`'>'`，这里要加一个条件，那就是`'<'`能否成为tag开始的标记，要看下一位是否是`'/'`，如果是，那么也是一个内循环一直走到下一个`'>'`，这不过要忽略掉ending的这个tag。
>
> 上面的思路其实能够解决怎么parse tag的问题，不过怎么解决在遍历过程中记录**层**的概念呢？有了层才有可能使同层的tag可以用一个list串起来。这个思路基本上算是让我走到了死角；
>
> 再骂一下那个二B面试官，我寻求帮助说有没有什么提示，结果他的提示却也特别弯曲：**你可以考虑把parse字符串和最终形成xml分开来想**，在当时的压力下，基本上我是没从这个提示里攫取到有效信息。
>
> 现在回头想想，面试官是想提示我不需要维护那个**层**的概念，层不层的问题留给后序处理生成xml的时候再处理。也就是说你可以这么想：维护一个栈，你就直接把当前能切的tag的name-value对加入到栈里，之后再根据栈中元素是否是key-value pair来决定在那一层上。比如说下面例子就可以形成这么一个栈：OFX | Transactions | Transaction | Amount:53 | DatePosted:20220721100000 | Transaction | Amount:35 | Amount:35 | DatePosted:20220721100000，基于这个栈，你就可以遍历栈中元素，根据元素是个String类型还是Name-Value对类型决定如何升一层。具体直接看[代码](#Twilio面试真题)吧。
>
>
### 表达式的一些总结

### **中序表达式转后序**
> 关于表达式，其实这类问题特别统一，基本上都是借助一个`"运算符单调栈"`的概念，这个单调栈的**序**是按照运算符计算优先级来的。
>
> 比如说，给你一个`中缀表达式`如`(5 - 3*6) * 7`让你求值。一种最noble的做法就是将这个`中缀表达式`先转成所谓的`后缀表达式`(即`逆波兰表达式`, RPN)，然后再去基于这个RPN算出最终值来。比如说，`(5 - 3*6) * 7`可以转成`["5", "3", "6", "*", "-", "7", "*"]`。
>
> 所以此思路的重点就是怎么让这个字符串`(5 - 3*6) * 7`转成**RPN**，这就解法嘛，你现在在脑子里想象这么一个`Data Structure`，里面一个**运算符单调栈**stack处理运算符优先级，一个`字符串集合`(e.g.，你就叫它rpn集合好了)存储RPN结果。这里就牵扯一个核心概念就是所谓的`计算优先级`，用这个计算优先级来维护一个递增的`运算符优先级单调递增栈`，也就是**说把运算优先级底的压在栈底**，因为优先级底的需要**后计算**，压栈过程中呢，比自己运算优先级高的也会随之pop出来放入rpn集合中。比如说，处理`5 - 3*6`的时候，遇到数字就直接放入结果rpn集(会依次得到`5|3|6`)，遇到运算符就压栈，这样栈里就是`'-'|'*'`，你看这个就是个**单调递增**栈，因为`-`号的计算优先级要小于`*`号，最后的rpn结果集会是`5|3|6|-|*`。
>
> 有了`计算优先级`还不够，还需要一个**分层**的概念。你体会体会，`中缀表达式`嘛，可以想想怎么从洋葱里**掏心**。遇到左括号，就是预示着一个新的起点对吧？到什么时候结束呢？答案是遇到`下一个`右括号的时候。你细品一下，这不正好符合了计算机的递归**掏心**思路吗？当然了，你可以选择迭代方式**掏心**，那就用那个已经存在的`运算符优先级单调递增栈`呗（本来主要是用来处理字符串计算优先级的），遇到左括号就将其`"("`压栈，直到遇到下一个右括号，然后把栈里上个左括号之后的元素作相应处理，是不是很直观？
>
```java
for(String str : expression){ //expression是["(","5","-", "6", ")", "*", "7"]，没有空字符
    if(str.equals("(")){
        stack.push(str); //遇到左括号，压栈，这里也正好预示了这个“层”的开始
    }
    else if(str.equals(")")){
        // 遇到右括号，说明当前层已经结束，那就把当前层的元素都放到RPN的队列里吧
        while(!stack.isEmpty() && !stack.peek().equals("(")) {
            res.add(stack.pop());
        }
        stack.pop(); //记得把上一个左括号pop掉哟
    }
    else if(Character.isDigit(str.charAt(0))){
        res.add(str); //是个数字，所以不用跟栈扯上半毛钱关系，直接加到RPN队列即可
    }
    else { //是运算符，所以要压栈，但是压栈前呢，要把优先级比此运算符大的pop出来加入RPN队列
        while(!stack.isEmpty() && getPriority(str)<=getPriority(stack.peek())) {
            res.add(stack.pop());
        }
        stack.push(str); //将当前运算符压栈
    }
}
```
> 至于`后缀表达式RPN`，就是那个字符串的集合`List<String>`，运算优先级高的先放到RPN的队列头部，因为RPN的核心就是**从头往后算**。得到了RPN后，再从头到尾遍历RPN队列，这个计算就简单直白了，遇到数字直接压栈，遇到符号从栈里pop()前两个元素，然后计算完并将结果压回栈里。
```java
private int getPriority(String str) {
    if (str.equals("*") || str.equals("/")) {
        return 3;
    }
    if (str.equals("+") || str.equals("-")) {
        return 2;
    }
    if (str.equals(")")) {  // 遇到数字弹栈的过程只可能遇到右括号
        return 1;
    }
    return 0;
}
```
>
> 另外一种转化思路就是将`中缀表达式`转成一颗`表达二叉树`。这个转成表达二叉树的解法，技巧性就在于遇到左括号`(`就增加一个大的**底数base**，遇到右括号`)`就减去那个大的底数base，这个base可以取值为10，这样可以达到分层的效果，而且可以以此来模拟递归进栈出栈。比如说表达式`2*6-(23+7)/(1+2)`可以转化成以下`表达二叉树`：
```
	                 [ - ]
	             /          \
	        [ * ]              [ / ]
	      /     \           /         \
	    [ 2 ]  [ 6 ]      [ + ]        [ + ]
	                     /    \       /      \
	                   [ 23 ][ 7 ] [ 1 ]   [ 2 ]
```
> 有了这个`表达二叉树`，你会不会后序遍历求结果呢？典型的**后序遍历**的应用。注意顺序哟，是左儿子**除以或减去**右儿子哟。

> 到这里了，我们讲的都是比较generic的处理方法，但是关于表达式`求值`，还有一种比较取巧但是又很容易理解的方法。这种思路呢，你还是需要一个`栈`，当时这个栈不存储运算符，只存储数据。至于**运算符的优先级**，处理技巧写在逻辑code里，至于处理括号嘛，那就直接用递归思想，遇到左括号就递归进入下一层，遇到右括号就结束递归返回结果到上一层。我们一步一步的捋一捋哈，这个方法其实写起来挺多坑的。
>
> 这个思路的核心在于看数字之前的那个计算符来决定怎么入栈。TODO待续
>
> 现在一步一步来扒皮洋葱：首先假设你只需要处理`+``-`运算，这时候不用处理运算优先级的问题，相对容易些。加减运算都需要左右两个元素对吧？那说明只有当你遇到运算符的时候才能决定怎么将数字放在栈里。那怎么才知道是遇到第二个右元素了呢？举个例子：`1+4-3`，首先有个小技巧，那就是把最initial的运算符初始化为`'+'`，这样当你从左往右遍历表达式过程中，当遇到**下**一个运算符时候，说明表达式已经切分结束。比如说当我们遍历到`第2(i==1)`位置时，你发现字符是`+`号，那说明你要处理之前的元素了，处理完了要把当前运算符设为**上次已知运算符**。
>
>
### 刷题列表
1. [领扣424. 逆波兰表达式求值](#逆波兰表达式求值)
1. [领扣370. 将表达式转换为逆波兰表达式](#将表达式转换为逆波兰表达式) 
1. [领扣368. 表达式求值](#表达式求值) 
1. [领扣575. 字符串解码](#字符串解码)
1. [领扣1289. 原子的数量](#原子的数量) 
1. [领扣367. 表达树构造](#表达树构造)
1. [Uber面试真题](#Uber面试真题) 
1. [Twilio面试真题](#Twilio面试真题) 

### 逆波兰表达式求值
[领扣424. 逆波兰表达式求值](https://www.lintcode.com/problem/424)
> 简单粗暴的从左往右遍历 
```java
public int evalRPN(String[] tokens) {
        // 一个栈足以
        Stack<Integer> stack = new Stack<>();
        for(String token : tokens){
            if(Character.isDigit(token.charAt(0)) || token.length()>1)
                stack.push(Integer.parseInt(token));
            else {
                int second = stack.pop();
                int first = stack.pop();
                switch (token){
                    case "+":
                        stack.push(first+second);
                        break;
                    case "-":
                        stack.push(first-second);
                        break;
                    case "*":
                        stack.push(first*second);
                        break;
                    case "/":
                        stack.push((int) first/second);
                        break;
                }
            }
        }
        
        return stack.pop();
    }
```

### 将表达式转换为逆波兰表达式
[领扣370. 将表达式转换为逆波兰表达式](https://www.lintcode.com/problem/370) 
>
> 借助`栈`我们可以实现中缀表达式到后缀表达式(即逆波兰表达式, RPN)的转换.
>
> 从左到右遍历中缀表达式:
>
> 1. 如果碰到`数字`, 直接追加到 RPN 末尾.
> 1. 如果碰到`左括号`, 入栈
> 1. 如果碰到`右括号`, 弹栈, 并将弹出的元素依次追加到 RPN 末尾, 直至左括号弹出(左括号不追加至PN)
> 1. 如果碰到`运算符`, 弹栈直至栈顶元素优先级 小于 当前运算符, 所有弹出的元素依次追加到 RPN 末尾, 最后再将该运算符入栈
>
> 出于方便, 我们设定所有元素的优先级: */ 最高, +- 次之, 然后是数字, 最后是括号. (把括号设为最低是因为, 碰到运算符弹栈时, 遇到括号也要停止, 所以可以直接设为最低)
>
> 最后, 如果栈还有剩余, 弹栈, 依次追加到 RPN 末尾, 然后我们就得到了正确结果 RPN.
>
>
```java
//解法1
public class Solution {
    /**
     * @param expression: A string array
     * @return: The Reverse Polish notation of this expression
     */
    public List<String> convertToRPN(String[] expression) {
        // write your code here
        List<String> res = new ArrayList<>();
        Stack<String> stack = new Stack<>();

        for(String str : expression){
            if(str.equals("(")){
                stack.push(str);
            }
            else if(str.equals(")")){
                while(!stack.isEmpty() && !stack.peek().equals("(")) {
                    res.add(stack.pop());
                }
                stack.pop();
            }
            else if(Character.isDigit(str.charAt(0))){
                res.add(str);
            }
            else { //运算符
                while(!stack.isEmpty() && getPriority(str)<=getPriority(stack.peek())) {
                    res.add(stack.pop());
                }
                stack.push(str);
            }
        }
        while (!stack.empty()) {
            res.add(stack.pop());
        }
        return res;
        
    }

    private int getPriority(String str){
        if(str.equals("*") || str.equals("/")){
            return 3;
        }

        if(str.equals("+") || str.equals("-")){
            return 2;
        }

        if(str.equals("(")){
            return 1;
        }

        return 0;
    }
}
```
```java
//解法2
class TreeNode {
    public int val;
    public String s;
    public TreeNode left, right;

    public TreeNode(int val, String ss) {
        this.val = val;
        this.s = ss;
        this.left = this.right = null;
    }

}

public class Solution {

    int getPriority(String a, Integer base) {
        if (a.equals("+") || a.equals("-"))
            return 1 + base;
        if (a.equals("*") || a.equals("/"))
            return 2 + base;

        return Integer.MAX_VALUE;
    }

    void dfs(TreeNode root, ArrayList<String> as) {
        if (root == null)
            return;
        if (root.left != null)
            dfs(root.left, as);

        if (root.right != null)
            dfs(root.right, as);
        as.add(root.s);
    }

    /**
     * @param expression: A string array
     * @return: The Reverse Polish notation of this expression
     */
    public List<String> convertToRPN(String[] expression) {
        // write your code here
        Stack<TreeNode> stack = new Stack<TreeNode>();
        TreeNode root = null;
        int val = 0;
        Integer base = 0;
        for (int i = 0; i < expression.length; i++){
            if (expression[i].equals("(")) {
                base += 10;
                continue;
            }
            if (expression[i].equals(")")) {
                base -= 10;
                continue;
            }
       
            val = getPriority(expression[i], base);
            TreeNode node = new TreeNode(val, expression[i]);
            while (!stack.isEmpty() && node.val <= stack.peek().val) {
                node.left = stack.pop();
            }
            if (!stack.isEmpty()) {
                stack.peek().right = node;
            }
            stack.push(node);
        }

        ArrayList<String> reversepolish = new ArrayList<String>();
        if (stack.isEmpty()) {
            return reversepolish;
        }
        TreeNode rst = stack.pop();
        while (!stack.isEmpty()) {
            rst = stack.pop();
        }
        dfs(rst, reversepolish);

        return reversepolish;
    }
}
```

### 表达式求值
[领扣368. 表达式求值](https://www.lintcode.com/problem/368)
```java
public class Solution {
    /**
     * @param expression: a list of strings
     * @return: an integer
     */
    public int evaluateExpression(String[] expression) {
        // write your code here
        if(expression.length<=0) return 0;
        List<String> rpn = convertToRPN(expression);
        if(rpn.size()<=0) return 0;
        return evalRPN(rpn);
    }

    private int evalRPN(List<String> tokens) {
        // write your code here
        Stack<Integer> stack = new Stack<>();
        for(String token : tokens){
            if(token.equals("+")){
                Integer first = stack.pop();
                Integer second = stack.pop();
                stack.push(second + first);
            }
            else if(token.equals("-")){
                Integer first = stack.pop();
                Integer second = stack.pop();
                stack.push(second - first);
            }
            else if(token.equals("*")){
                Integer first = stack.pop();
                Integer second = stack.pop();
                stack.push(second * first);
            }
            else if(token.equals("/")){
                Integer first = stack.pop();
                Integer second = stack.pop();
                stack.push((int) second/first);
            }
            else {
                stack.push(Integer.parseInt(token));
            }
        }

        return stack.pop();
    }

    private List<String> convertToRPN(String[] expression) {
        List<String> RPN = new ArrayList<String>();
        Stack<String> stack = new Stack<String>();
        for (String str : expression) {
            if (str.equals("(")) {
                stack.push(str);
            }
            else if (str.equals(")")) {
                while (!stack.peek().equals("(")) {
                    RPN.add(stack.pop());
                }
                stack.pop();
            }
            else if (Character.isDigit(str.charAt(0))) {
                RPN.add(str);
            }
            else {
                int priority = getPriority(str);
                while (!stack.empty() && getPriority(stack.peek()) >= priority) {
                    RPN.add(stack.pop());
                }
                stack.push(str);
            }
        }
        while (!stack.empty()) {
            RPN.add(stack.pop());
        }
        return RPN;
    }
    
    private int getPriority(String str) {
        if (str.equals("*") || str.equals("/")) {
            return 3;
        }
        if (str.equals("+") || str.equals("-")) {
            return 2;
        }
        if (str.equals(")")) {  // 遇到数字弹栈的过程只可能遇到右括号
            return 1;
        }
        return 0;
    }
}
```

```java
//解法2
public class Solution {
    class TreeNode {
        public int val;
        public String s;
        public TreeNode left, right;

        public TreeNode(int val, String ss) {
            this.val = val;
            this.s = ss;
            this.left = this.right = null;
        }

    }
    /**
     * @param expression: a list of strings
     * @return: an integer
     */
    public int evaluateExpression(String[] expression) {
        // write your code here
        if(expression.length<=0) return 0;
        TreeNode rpn = convertToRPN(expression);
        //if(rpn.size()<=0) return 0;
        return evalRPN(rpn);
    }

    private int evalRPN(TreeNode root) {
        // write your code here
        if(root==null) return 0;
        if(Character.isDigit(root.s.charAt(0))) return Integer.parseInt(root.s);
        int left = evalRPN(root.left);
        int right = evalRPN(root.right);

        int res = 0;
        if(root.s.equals("+")){
            res = left + right;
        }
        if(root.s.equals("-")){
            res = left - right;
        }
        if(root.s.equals("*")){
            res = left * right;
        }
        if(root.s.equals("/")){
            res = (int) left/right;
        }

        //System.out.println(res);
        return res;
    }

    int getPriority(String a, Integer base) {
        if (a.equals("+") || a.equals("-"))
            return 1 + base;
        if (a.equals("*") || a.equals("/"))
            return 2 + base;

        return Integer.MAX_VALUE;
    }

    /**
     * @param expression: A string array
     * @return: The Reverse Polish notation of this expression
     */
    public TreeNode convertToRPN(String[] expression) {
        // write your code here
        Stack<TreeNode> stack = new Stack<TreeNode>();
        TreeNode root = null;
        int val = 0;
        Integer base = 0;
        for (int i = 0; i < expression.length; i++){

            if (expression[i].equals("(")) {
                base += 10;
                continue;
            }
            if (expression[i].equals(")")) {
                base -= 10;
                continue;
            }
            val = getPriority(expression[i], base);
            TreeNode node = new TreeNode(val, expression[i]);
            while (!stack.isEmpty() && node.val <= stack.peek().val) {
                node.left = stack.pop();
            }
            if (!stack.isEmpty()) {
                stack.peek().right = node;
            }
            stack.push(node);
        }
        
        if (stack.isEmpty()) {
            return null;
        }
        TreeNode rst = stack.pop();
        while (!stack.isEmpty()) {
            rst = stack.pop();
        }
        return rst;
    }
}
```
> 递归解法：递归解法需要维护一个global的index参数
```java
//解法3：
public class Solution {
    /**
     * @param expression: a list of strings
     * @return: an integer
     */
    private int index=0;
    public int evaluateExpression(String[] expression) {
        // write your code here
        
        return helper(expression);
    }

    private int helper(String[] expression){
        Stack<Integer> stack = new Stack<>();
        Character sign = '+';
        int num = 0;
        while(index<expression.length){
            String expr = expression[index];
            index++;
            if(Character.isDigit(expr.charAt(0)))
                //stack.push(Integer.parseInt(expr));
                num = Integer.parseInt(expr);
            
            if("(".equals(expr))
                num = helper(expression);
            
            if(!Character.isDigit(expr.charAt(0)) || index==expression.length){

                int pre = 0;
                switch(sign){
                    case '+':
                        stack.push(num);
                        break;
                    case '-':
                        stack.push(-num);
                        break;
                    case '*':
                        pre = stack.pop();
                        stack.push(pre*num);
                        break;
                    case '/':
                        pre = stack.pop();
                        stack.push((int) pre/num);
                        break;

                }
                sign = expr.charAt(0);
                num = 0;
            }

            if(")".equals(expr)) break;
        }

        int res = 0;
        while(!stack.isEmpty()){
            res += stack.pop();
        }
        return res;
    }
}
```

### 字符串解码
[领扣575. 字符串解码](https://www.lintcode.com/problem/575)
```java
public class Solution {
    /**
     * @param s: an expression includes numbers, letters and brackets
     * @return: a string
     */
    public String expressionExpand(String s) {
        // write your code here
        Stack<Object> stk = new Stack<>();
        Integer rem = 0;
        for(char c : s.toCharArray()){
            if(Character.isDigit(c)){
                rem = rem*10 + Integer.parseInt(String.valueOf(c));
            }
            else if(c=='['){
                stk.push(rem);
                rem=0;
            }
            else if(c==']'){
                String base = popStack(stk);
                Integer cnt = (Integer) stk.pop();
                String interim = "";
                for(int i=0; i<cnt; i++){
                    interim += base;
                }
                stk.push(interim);
            }
            else {
                stk.push(String.valueOf(c));
            }
        }

        return popStack(stk);
    }

    private String popStack(Stack<Object> stk){
        Stack<String> buffer = new Stack<>();
        // pop until a number
        while(!stk.isEmpty() && stk.peek() instanceof String){
            buffer.push((String) stk.pop());
        }
        StringBuilder sb = new StringBuilder();
        while(!buffer.isEmpty()){
            sb.append(buffer.pop());
        }
        
        return sb.toString();   
    }
}
```

> 递归解法：递归解法需要维护一个global的index参数
```java
public class Solution {
    /**
     * @param s: an expression includes numbers, letters and brackets
     * @return: a string
     */
    int index = 0;
    public String expressionExpand(String s) {
        // write your code here
        if (s.length() == 0) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        
        int repeat = 0;
        
        while (index < s.length()) {
            char c = s.charAt(index);
            if (c == '[') {
                index++;
                String sub = expressionExpand(s);
                for (int i = 0; i < repeat; i++) {
                    sb.append(sub);
                }
                repeat = 0;
                index++;
            } else if (c == ']') {
                return sb.toString();
            } else if (Character.isDigit(c)) {
                repeat = repeat * 10 + c - '0';
                index++;
            } else {
                sb.append(c);
                index++;
            }
        }
        
        return sb.toString();
    }
}
```

### 原子的数量
1. [领扣1289. 原子的数量](https://www.lintcode.com/problem/1289)
> 还是来个递归解法吧：维护一个global参数i
```java
public class Solution {
    /**
     * @param formula: a string
     * @return: return a string
     */
    private int i, n;
    private String formula;
    public String countOfAtoms(String formula) {
        // write your code here
        this.i = 0; this.n=formula.length();
        this.formula=formula;
        Stack<TreeMap<String, Integer>> stack = new Stack<>();

        TreeMap<String, Integer> resMap = new TreeMap<>();
        stack.push(resMap);

        while(i<n){
            char c = formula.charAt(i);
            if(c=='('){
                i++;
                TreeMap<String, Integer> newMap = new TreeMap<>();
                stack.push(newMap);
            } 
            else if(c==')'){
                i++;
                Integer num = getNum();
                TreeMap<String, Integer> cur = stack.pop();
                TreeMap<String, Integer> top = stack.peek();

                for(Map.Entry<String, Integer> entry : cur.entrySet()){
                    String k = entry.getKey();
                    Integer v = entry.getValue();
                    top.put(k, top.getOrDefault(k, 0) + v*num);
                }

            } else {
                //i++放在了getElement和getNum的函数里
                TreeMap<String, Integer> top = stack.peek();
                String elem = getElement();
                Integer num = getNum();
                top.put(elem, top.getOrDefault(elem, 0) + num);
            }
        }

        //form the result
        StringBuilder sb = new StringBuilder();
        for(Map.Entry<String, Integer> entry : resMap.entrySet()){
            String k = entry.getKey();
            Integer v = entry.getValue();
            sb.append(k);
            if(v>1) sb.append(v.toString());
        }

        return sb.toString();

    }

    private String getElement(){
        StringBuilder sb = new StringBuilder();
        sb.append(String.valueOf(formula.charAt(i++)));
        while(i<n && Character.isLowerCase(formula.charAt(i))){
            sb.append(String.valueOf(formula.charAt(i++)));
        }

        return sb.toString();
    }

    private Integer getNum(){
        if(i>=n || !Character.isDigit(formula.charAt(i))) return 1;
        Integer res = 0;
        while(i<n && Character.isDigit(formula.charAt(i))){
            res = res*10+Integer.parseInt(String.valueOf(formula.charAt(i++)));
        }

        return res;
    }
}
```

### 表达树构造
[领扣367. 表达树构造](https://www.lintcode.com/problem/367)
```java
/**
 * Definition of ExpressionTreeNode:
 * public class ExpressionTreeNode {
 *     public String symbol;
 *     public ExpressionTreeNode left, right;
 *     public ExpressionTreeNode(String symbol) {
 *         this.symbol = symbol;
 *         this.left = this.right = null;
 *     }
 * }
 */

public class Solution {
    class TreeNode {
        int val;
        ExpressionTreeNode eNode;
        public TreeNode(int val, String s) {
            this.val = val;
            eNode = new ExpressionTreeNode(s);
        }
    }

    /**
     * @param expression: A string array
     * @return: The root of expression tree
     */
    public ExpressionTreeNode build(String[] expression) {
        // write your code here
        if (expression == null || expression.length == 0) {
            return null;
        }
        
        Stack<TreeNode> stack = new Stack<>();
        int base = 0, val=0;
        for(int i=0; i< expression.length; i++){
            if (expression[i].equals("(")) {
                base += 10;
                continue;
            }
            if (expression[i].equals(")")) {
                base -= 10;
                continue;
            }

            val = getWeight(base, expression[i]);
            TreeNode node = new TreeNode(val, expression[i]);
            while (!stack.isEmpty() && node.val <= stack.peek().val) {
                node.eNode.left = stack.pop().eNode;
            }
            if (!stack.isEmpty()) {
                stack.peek().eNode.right = node.eNode;
            }
            stack.push(node);
        }

        if (stack.isEmpty()) {
            return null;
        }
        TreeNode rst = stack.pop();
        while (!stack.isEmpty()) {
            rst = stack.pop();
        }
        return rst.eNode;
    }

    private int getWeight(int base, String str){
        if(str.equals("+") || str.equals("-")){
            return base + 1;
        } else if(str.equals("*") || str.equals("/")){
            return base + 2;
        }

        return Integer.MAX_VALUE;
    }
}
```

### 字符串的最短长度编码
[领扣885. 字符串的最短长度编码](https://www.lintcode.com/problem/885)


### Uber面试真题
> **原题**：给你一个csv的内容，让你parse成key-value的集合，例如：
```json
//example input
column1,column2
"Hilary",7
"Tonna,Marc","java"
"Bryce,Beverly","kid\"s"

//output
{
    {
        "column1": "Hilary",
        "column2": "7"
    },
    {
        "column1": "Tonna,Marc",
        "column2": "java"
    },
    {
        "column1": "Hilary",
        "Bryce,Beverly": "kid"s"
    }
}
```
> **思路** 典型的字符串分治法，那就是找每一层的开头和结尾。
>
>
```java
class Parser {
    public static List<Map<String, String>> parse(String[] csv){
        List<String> headers = new ArrayList<>();
        parseOneLine(headers, csv[0]);

        List<Map<String, String>> results = new ArrayList<>();
        for(int i=1; i<csv.length; i++){
            List<String> parsed = new ArrayList<>();
            parseOneLine(parsed, csv[0]);
            Map<String, String> parsedMap = new HashMap<>();
            for(int j=0; j<headers.size(); j++){
                parsedMap.put(headers.get(j), parsed.get(j));
            }
            results.add(parsedMap);
        }

        return results;
    }

    private static void parseOneLine(List<String> result, String line){
        if(line==null || line.isEmpty()) return;
        
        char target = line[0]=='"'?'"':',';
        //int begin = line[0]=='"'?1:0;
        int i=1;
        for(; i<line.length(); i++){
            if(line.charAt(i)==target && line.charAt(i-1) != '\\'){
                result.add(line.substring(0, i));
                break;
            }
        }

        int end = line[0]=='"'?i+2:i+1;
        String suffix = line.substring(end);
        parseOneLine(result, suffix);
    }

}
```

### Twilio面试真题
```java
/*
<OFX>
    <Transactions>
        <Transaction>
            <Amount>53
            <DatePosted>20220721100000</DatePosted>
        <Transaction>
        <Transaction>
            <Amount>35
            <Amount>45
            <DatePosted>20220721100000</DatePosted>
        <Transaction>
    <Transactions>
<OFX>    
*/

import java.util.*;
import java.util.stream.*;

public class MyClass {
    
    public static Stack<Object> connvertOfxToXml(String ofx){
        Stack<Object> stack = new Stack<>();
        int n=ofx.length();
        int i=0;
        int tagBegin = 0;
        while(i<n){
            if(ofx.charAt(i)=='<'){
                tagBegin = i;
                i++;
                if(ofx.charAt(i)=='/'){
                    while(i<n && ofx.charAt(i)!='<'){
                        i++;
                    }
                    continue;
                }

                while(ofx.charAt(i)!='>'){
                    i++;
                }
                String tag = ofx.substring(tagBegin+1, i);
                //System.out.println(tag);
                if(i<n-1 && ofx.charAt(i+1)!='<'){
                    tagBegin = ++i;
                    while(ofx.charAt(i)!='<'){
                        i++;
                    }
                    String value = ofx.substring(tagBegin, i);
                    //System.out.println(tag+"|"+value);
                    stack.push(Map.of(tag, value));
                }
                else {
                    stack.push(tag);
                    i++;
                }
            }
        }
        
        //stack.stream().forEach(s->System.out.println(s));
        return stack;
    }
    
    public static String marshalToXml(Stack<Object> stack){
        String res = "";
        List<String> list = new ArrayList<>();
        while(!stack.isEmpty()){
            Object cur = stack.pop();
            //System.out.println(cur);
            //根据cur的类型判断处理方式
            if(cur instanceof String){
                String inside = "";
                if(list.size()>0){
                    for(String ele : list){
                        inside += ele;
                        //System.out.println(inside);
                    }
                        
                    list = new ArrayList<>();
                    inside = "<"+cur+">"+inside+"</"+cur+">";
                    //System.out.println(inside);
                }
                //System.out.println(cur+"|"+inside);
                res = inside.isEmpty()?"<"+cur+">"+res+"</"+cur+">":inside+res;
            }
            else {
                Object tagName = ((Map)cur).keySet().iterator().next();
                Object tagValue = ((Map)cur).get(tagName);
                //System.out.println(tagName+"|"+tagValue);
                String ele = "<"+tagName+">"+tagValue+"</"+tagName+">";
                list.add(ele);
            }
        }
        
        //System.out.println(res);
        
        return res;
    }

    public static void main(String args[]) {
      String ofx="<OFX><Txns><Txn><Amt>53<DatePosted>2022</DatePosted></Txn><Txn><Amt>43<Amt>66<DatePosted>2023</DatePosted></Txn></Txns></OFX>";
      String res = marshalToXml(connvertOfxToXml(ofx));
      System.out.println(res);
      
    }
}
```
>
