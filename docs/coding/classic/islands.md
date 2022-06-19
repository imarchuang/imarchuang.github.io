# 岛屿问题

> 岛屿问题又称floodfill，很形象吧？就是水没金山寺的感觉。

### 一些心得总结
> 关于。
>
> 。
>
> 有？
>


### 刷题列表
1. [领扣424. 逆波兰表达式求值](#逆波兰表达式求值)
1. [领扣370. 将表达式转换为逆波兰表达式](#将表达式转换为逆波兰表达式) 
1. [领扣368. 表达式求值](#表达式求值) 
1. [领扣575. 字符串解码](#字符串解码)
1. [领扣1289. 原子的数量](#原子的数量) 
1. [领扣367. 表达树构造](#表达树构造)

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