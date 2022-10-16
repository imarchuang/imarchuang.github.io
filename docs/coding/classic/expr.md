# 表达式相关的几个问题之掏心问题

> 单个字符串做输入，或者一堆字符串的`array`做输入，你的思路不外乎以下几种：
>
> -  动规思路，刷到今天，这种题型应该很容易辨别出来了，就是**蛙跳**嘛，基本上都是子序列相关的问题，经典的例子像[最长回文子序](https://leetcode.com/problems/longest-palindromic-subsequence/)之类的。当然了，类似思路还有更原始的题型，比如说[找字符串中符合word的子序列](#https://www.lintcode.com/problem/1024/)，这子序类的思路在[这篇](./coding/classic/subsequence)详细讲解过，请温习。
> -  第二类思路呢，题型基本上就是`子串类`的，然后核心思路就是**二分字符串**，一头一尾，头部是`s.substring(0, i+1)`和尾部`s.substring(i+1)`，处理头部并递归尾部，这个思路特别好使，你可以秒杀相对复杂的题如`单词模式II`，`单词拆分II`等。这种思路能还算性对线性，利用的使你对**二分**思想的应用，说白了吧还是棵往右下方延伸的树。
> -  第三类思路就是本文的重点，我自己称之为**掏心**思路。这种情况主要是相对线性的**二分**思想的建树的过程中你发现每个节点都是棵树，这时候你可能直接用计算机的*递归树*就不太容易解题了，*递归树*的核心思想就是栈的应用嘛，那你就自己显式的维护一个栈呗。这个**掏心**过程中，肯定是要用栈的，栈的作用通常有两个，一个是缓存**某一层的处理结果**，另一个作用呢，通常是让你顺便维持某个**序**，好让你根据这个序做出类似单调栈之类的操作。如果你用一个栈就是想这两个功能，那就一个栈，要是发现分开比较好解释，那就用两个栈。现在举例细究一下这个思路：
>
>1. 给你一个类似`3[2[ad]3[pf]]xyz`这样一个字符串，让你把这个展成`"adadpfpfpfadadpfpfpfadadpfpfpfxyz"`，即把3这样的乘数/系数所对应的子字符串给展开了，系数对应的*子字符串*是被`[...]`包裹起来的，你是不是意识到**掏心**思维了？这个怎么**掏心**法呢？
>       - 你是否记得上面提到的栈有两个功能？一个是**能够起初的标识栈的起点和终点**，另一个是**站内能维护某种寓意的序**。
>       - 你脑子里现在开始从左往右遍历字符，把遍历的字符放到*栈*里，先是`3`（是个系数），那就直接压栈`3|`，接下来是`[`，这其实是**新一层**的开始标识，但是你发现这个*开始标识*其实可以用数字来标识的，那就略过吧，再遇到`2`（是个系数），那就直接压栈`3|2|`，继续遍历是`a`，是个字母，没商量直接压栈`3|2|a|`，再继续遍历遇到`d`，是个字母，没商量直接压栈`3|2|a|d|`，再继续遍历，现在你遇到右括号`]`字符了，说明当前层结束，你要进行 aggregate 了。
>       - 什么是aggregate呢？首先，你脑子里很清楚，你要aggregate的**范围是目前的运算层**，就这题来说是`[...]`对应的元素们，所以我说**掏心**问题其实是个**分治法的变形**，你的算出当前被`[...]`包裹的子问题的值。还记得我们之前遇到`[`字符的时候直接跳过的原因吗？因为我们说数字字符也可以标识*当前层开始*，那好了，我们现在去pop栈中元素吧，到啥时候结束呢？那就是当你pop到一个数字字符的时候呗，正好可以根据这个最后pop出来的数字字符，对字母字符(串)们进行乘法对吧？这样你就做`'2'*'ad'=adad`，有了这个子问题的咋整？**子问题**的结果是要缓存起来的，哪儿存在呢？那个栈不是在那儿的嘛，拿来用不客气：`3|adad|`;
>       - 继续遍历你遇到了`3`（是个系数），那就直接压栈`3|adad|3|`，接下来的步骤我就省略了，直到最后你的栈里的状态是这样的：`adadpfpfpfadadpfpfpfadadpfpfpf|x|y|z|`，那好了最后再扫一遍栈，就能得到结果了。
>
>1. 再举个例子，给你一个化学式`"K4(ON(SO3)2)2"`这样一个字符串，让你把这个展成字典序的`"K4N2O14S4""`，啥意思呢？就是让你把化学元素出现的次数统计一遍，跟上题是不是有点类似？只不过系数是放在后边的。
>       - 你是否记得上面提到的栈有两个功能？一个是**能够起初的标识栈的起点和终点**，另一个是**站内能维护某种寓意的序**。起始标识是`(`结束标识`)`这个很明显，但是不太明显的是你的站内元素应该放什么值？回到题意，最终让你求得是**每个化学元素出现的次数**，那你的**当前层子问题**就是统计当前层里每个出现元素的次数；为了计算方便呢，这个子问题**当前层的统计数据**的维护，你先new一个**hashmap**并压入栈中形成`{}|`，这个栈底的**hashmap**也是你最终答案的统计数据，前提是能把子问题的统计数据能一层层的按部就班的roll up上来。
>       - 这个怎么**掏心**法呢？要自左往右遍历字符。这时候你先把栈顶的**hashmap**进行peek（记得初始时候我们压了一个空**hashmap**在栈顶），把这个栈顶的**hashmap**当做你统计数据的cache。首先遇到大写字符`K`，这时候元素可能是"Kg，Kt"之类的，那就需要看看后边跟的字符是不是个小写字母，直到遇到非小写字符。
>           * 如果之后遇到的非小写字符是个大写字符，那你就暂时认为个数是1, 即`{k:1}`;
>           * 如果最后遇到的非小写字符是个数字，太好了，说明这是这个化学元素对应的个数，比如说这里就遇到了数字字符`4`，这里再说一下小细节，遇到`4`了你应该看看下一码，因为有可能下一码还是个数字嘛。到这里你应该压栈了：`{K:4}|`；这时候
>       - 下一码遇到`(`字符了，标志着新一层的开始。这里的问题是怎么有效利用这个开始标识呢？
>           * 答案是你要new一个新的hashmap了，并将之压栈形成`{K: 4}|{}|`。这样栈顶的空**hashmap**就是你当前层统计数据的cache；
>           * 然后你继续遍历字符`O`,`N`，你的栈内状态是这样的`{K: 4}|{N: 1, O: 1}|`;
>           * 这时候你又遇到`(`开始标识了，那咋办呢？跟上一次遇到`(`字符时一样，这标志着新一层的开始。你要new一个新的hashmap了，并将之压栈形成`{K: 4}|{N: 1, O: 1}|{}|`；
>       - 类似的，你会遍历`S`，`O`字符，你的栈内状态是这样的`{K: 4}|{N:1, O:1}|{S:1, O:3}|`；之后呢你遇到了结束标识`)`，这时候你遇到结束标识了，你就可以**aggregate**子问题的统计数据并roll up倒上一层了：
>           * 这里需要从`)`之后的几码字符来找**系数**(注意这个系数是可能多位的)，找到系数是`2`；
>           * 然后你需要把栈顶的**hashmap**(`{S:1, O:3}`)pop出来，pop完站内状态是这样的`{K: 4}|{N:1, O:1}|`，栈顶**hashmap**是`{N:1; O:1}`，你需要的操作就是将`{S:1, O:3}乘以2`然后merge进`{N:1; O:1}`，这样之后你的站内状态就是`{K: 4}|{N:1, O:7, S:2}|`;
>       - 之后的操作就是类似的了，最终你的栈内状态会是这样的：`{K:4, N:2, O:14, S:4}|`，栈内只有一个元素，也就是你最初初始化的那个**hashmap**，如果你还保持了指针指向它的话，你可以直接对这个**hashmap**转成字符串操作了，答案就是：`K4N2O14S4`;
> 
>1. 继续举例子，给你一个类似`(5 - 3*6) * 7`这样一个字符串，让你求值:
>       - 你是否记得上面提到的栈有两个功能？一个是**能够起初的标识栈的起点和终点**，另一个是**站内能维护某种寓意的序**。起始标识是`(`结束标识`)`这个很明显，在这个**子问题层**里要做啥呢？无他，加减乘除法而已嘛；有个要点就是在子问题层内，如何**有效的维护计算符优先级**。处理优先级吧，只用一个栈似乎逻辑变得复杂不好解释了，那就**每层子问题都维护一个栈**呗；
>       - 循规蹈矩，你脑子应该有个栈，而且为了递归处理方便，每次遇到左括号`(`，**赶紧递归**，每次递归计算层里都**创建一个新的栈**，这个栈的数据状态是这样的`+5|-3|`：
>           * 然后发现下个是乘号`*`，这样就对栈进行处理`+5|-3*6|`，也就是说把乘号`*`后的字符`6`与栈顶元素进行运算并压回栈中；
>           * 然后看到下个是右括号`)`，说明当前层结束，需要aggregeate了。把站内元素全**加吧加吧**，并将结果返回，返回的是递归树的上一层，那么上一层的栈就可以是`-13|...`。
>       - 这题还是利用了栈，这个栈的作用范围是当前`(...)`计算层；然后利用了递归树（也是一个栈），把子问题的结果一步步roll up回去；
>       - 这里展示的**掏心分治解法**，但是这题比较常见的解法是`逆波兰表达式`，即RPN，也是**掏心分治解法**，那个解法里不需要*递归树*，维护一个栈外加一个结果链表即可。
>
>1. 继续举例子：给你一个类似`"Bryce,Beverly","kid\"s"`这样一个 csv 格式的字符串，让你把这个 parse 成`[Bryce,Beverly,kid"s]`，这个怎么**掏心**法呢？这个呢其实不算**掏心**，因为没有设计**层**的概念，你可以基本上从左往右扫描一遍就能解决了。
>
>1. 最后一个比较难的例子：给你一个类似"<OFX><Txns><Txn><Amt>53<DatePosted>2022</DatePosted></Txn><Txn><Amt>43<Amt>66<DatePosted>2023</DatePosted></Txn></Txns></OFX>"这样一个字符串，让你把这个展成<OFX><Txns><Txn><Amt>53</Amt><DatePosted>2022</DatePosted></Txn><Txn><Amt>43</Amt><Amt>66</Amt><DatePosted>2023</DatePosted></Txn></Txns></OFX>，这个怎么**掏心**法呢？你脑子里应该有个栈，栈里存这样的数据：OFX | Transactions | Transaction | Amount:53 | DatePosted:20220721100000 | Transaction | Amount:35 | Amount:35 | DatePosted:20220721100000，这里不要在 parse 字符串的过程中**试图分层**，具体的分层等处理这个栈的时候再判定。怎么判定？你可以遍历栈中元素，根据元素是个 String 类型还是 Name-Value 对类型决定如何升一层。
>
> - **总结** 小结一下，**掏心**做法呢不外乎用个栈，但是栈里存啥很注重技巧。你可以单纯的对字符压栈，然后遇到**结束信号**(e.g.,右括号)时候就处理栈内元素直到你确定**当前层**的开始(e.g., 是个数字，比如说左括号前肯定是个数字)，这个类似二叉树的后序逻辑；你也可以在遇到**开始信号**(e.g.,左括号)时候就直接对当前层确定一个范围，比如说 init 一个新的 TreeMap，所以你可以在遇到结束信号时候直接 pop 出这个 TreeMap 做逻辑处理，这个类似二叉树的前序逻辑，因为你在一开始就界定了**层内**的数据范围；还有一种更`暴力美学`的做法，那就是每次遇到**开始信号**(e.g.,左括号)时候就直接递归到下一层，然后每层递归都维护自己的 stack 栈。最后呢，还要一类相对比较难的，那就是开始结束点不太明显的，就不要在 parse 的过程中试图分层，分层留给后序总的处理器吧。

> 数字的 ascii 码第大于`'+','-','*','/'`(43,45,42,47)运算符的。
>
> **更新** 2022-07-21: 今天 Twilio 面试**翻车**了，主要原因我还没深入总结出来，但是说明自己思维上的缺口还是要注意。原题在各大刷题网站上肯定找不到，但是这个题确实是个好题，虽然面试官(华人小哥，叫 Darryl Yong)有点欠扁，但是不得不说题出的还不错。简单说一下，给你一个 ofx 格式的字符串，然后将这个 ofx 格式转成合法的 xml 格式。比如说下面的例子就是 ofx 格式。
>
> 1.  很明显，这不是严格的 xml 格式，比如说`<Amount>`里没有 closing 的`</Amount>`；
> 1.  题里直接提示了：用一个 data structure 来存`fieldName`和`fieldValue`会比较容易解题;
>
> **思路** 我拿到题，基本上已经确定了是个 expr 类表达式处理的问题，所以借助一个 stack 栈是肯定的了；不过解题过程中，主要有两部分卡住了：
>
> 1. 如何确定要压栈的元素的结尾？比如说，`OFX`就是个结尾；
> 1. 如何确定层级关系，使同层的 tag 可以用一个 list 串起来？比如说 Amount 和 DatePosted 在同一层，所以希望得到[{Amount:53}, {DatePosted: 20220721100000}]这种数据结构。
>
> 照着这个思路，我开始写码了，从左往右遍历每个字符，`'<'`以这个做 delimiter 标记每个 tag 的开始，当遇到开始了，就用一个内循环一直走知道遇到下一个`'>'`，这里要加一个条件，那就是`'<'`能否成为 tag 开始的标记，要看下一位是否是`'/'`，如果是，那么也是一个内循环一直走到下一个`'>'`，这不过要忽略掉 ending 的这个 tag。
>
> 上面的思路其实能够解决怎么 parse tag 的问题，不过怎么解决在遍历过程中记录**层**的概念呢？有了层才有可能使同层的 tag 可以用一个 list 串起来。这个思路基本上算是让我走到了死角；
>
> 再骂一下那个二 B 面试官，我寻求帮助说有没有什么提示，结果他的提示却也特别弯曲：**你可以考虑把 parse 字符串和最终形成 xml 分开来想**，在当时的压力下，基本上我是没从这个提示里攫取到有效信息。
>
> 现在回头想想，面试官是想提示我不需要维护那个**层**的概念，层不层的问题留给后序处理生成 xml 的时候再处理。也就是说你可以这么想：维护一个栈，你就直接把当前能切的 tag 的 name-value 对加入到栈里，之后再根据栈中元素是否是 key-value pair 来决定在那一层上。比如说下面例子就可以形成这么一个栈：OFX | Transactions | Transaction | Amount:53 | DatePosted:20220721100000 | Transaction | Amount:35 | Amount:35 | DatePosted:20220721100000，基于这个栈，你就可以遍历栈中元素，根据元素是个 String 类型还是 Name-Value 对类型决定如何升一层。具体直接看[代码](#Twilio面试真题)吧。

### 表达式的一些总结

### **中序表达式转后序**

> 关于表达式，其实这类问题特别统一，基本上都是借助一个`"运算符单调栈"`的概念，这个单调栈的**序**是按照运算符计算优先级来的。
>
> 比如说，给你一个`中缀表达式`如`(5 - 3*6) * 7`让你求值。一种最**noble**的做法就是将这个`中缀表达式`先转成所谓的`后缀表达式`(即`逆波兰表达式`, RPN)，然后再去基于这个 RPN 算出最终值来。比如说，`(5 - 3*6) * 7`可以转成`["5", "3", "6", "*", "-", "7", "*"]`。
>
> 所以此思路的重点就是怎么让这个字符串`(5 - 3*6) * 7`转成**RPN**，这就解法嘛，你现在在脑子里想象这么一个`Data Structure`，里面一个**运算符单调栈**stack 处理运算符优先级，一个`字符串集合`(e.g.，你就叫它 rpn 集合好了)存储 RPN 结果。这里就牵扯一个核心概念就是所谓的`计算优先级`，用这个计算优先级来维护一个递增的`运算符优先级单调递增栈`，也就是**说把运算优先级底的压在栈底**，因为优先级底的需要**后计算**，压栈过程中呢，比自己运算优先级高的也会随之 pop 出来放入 rpn 集合中。比如说，处理`5 - 3*6`的时候，遇到数字就直接放入结果 rpn 集(会依次得到`5|3|6`)，遇到运算符就压栈，这样栈里就是`'-'|'*'`，你看这个就是个**单调递增**栈，因为`-`号的计算优先级要小于`*`号，最后的 rpn 结果集会是`5|3|6|-|*`。
>
> 有了`计算优先级`还不够，还需要一个**分层**的概念。你体会体会，`中缀表达式`嘛，可以想想怎么从洋葱里**掏心**。遇到左括号，就是预示着一个新的起点对吧？到什么时候结束呢？答案是遇到`下一个`右括号的时候。你细品一下，这不正好符合了计算机的递归**掏心**思路吗？当然了，你可以选择迭代方式**掏心**，那就用那个已经存在的`运算符优先级单调递增栈`呗（本来主要是用来处理字符串计算优先级的），遇到左括号就将其`"("`压栈，直到遇到下一个右括号，然后把栈里上个左括号之后的元素作相应处理，是不是很直观？

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

> 至于`后缀表达式RPN`，就是那个字符串的集合`List<String>`，运算优先级高的先放到 RPN 的队列头部，因为 RPN 的核心就是**从头往后算**。得到了 RPN 后，再从头到尾遍历 RPN 队列，这个计算就简单直白了，遇到数字直接压栈，遇到符号从栈里 pop()前两个元素，然后计算完并将结果压回栈里。

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

> 另外一种转化思路就是将`中缀表达式`转成一颗`表达二叉树`。这个转成表达二叉树的解法，技巧性就在于遇到左括号`(`就增加一个大的**底数 base**，遇到右括号`)`就减去那个大的底数 base，这个 base 可以取值为 10，这样可以达到分层的效果，而且可以以此来模拟递归进栈出栈。比如说表达式`2*6-(23+7)/(1+2)`可以转化成以下`表达二叉树`：

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

> 到这里了，我们讲的都是比较 generic 的处理方法，但是关于表达式`求值`，还有一种比较取巧但是又很容易理解的方法。这种思路呢，你还是需要一个`栈`，当时这个栈不存储运算符，只存储数据。至于**运算符的优先级**，处理技巧写在逻辑 code 里，至于处理括号嘛，那就直接用递归思想，遇到左括号就递归进入下一层，遇到右括号就结束递归返回结果到上一层。我们一步一步的捋一捋哈，这个方法其实写起来挺多坑的。
>
> 这个思路的核心在于看数字之前的那个计算符来决定怎么入栈。TODO 待续
>
> 现在一步一步来扒皮洋葱：首先假设你只需要处理` +``- `运算，这时候不用处理运算优先级的问题，相对容易些。加减运算都需要左右两个元素对吧？那说明只有当你遇到运算符的时候才能决定怎么将数字放在栈里。那怎么才知道是遇到第二个右元素了呢？举个例子：`1+4-3`，首先有个小技巧，那就是把最 initial 的运算符初始化为`'+'`，这样当你从左往右遍历表达式过程中，当遇到**下**一个运算符时候，说明表达式已经切分结束。比如说当我们遍历到`第2(i==1)`位置时，你发现字符是`+`号，那说明你要处理之前的元素了，处理完了要把当前运算符设为**上次已知运算符**。

### 刷题列表

1. [领扣 424. 逆波兰表达式求值](#逆波兰表达式求值)
1. [领扣 370. 将表达式转换为逆波兰表达式](#将表达式转换为逆波兰表达式)
1. [领扣 368. 表达式求值](#表达式求值)
1. [领扣 575. 字符串解码](#字符串解码)
1. [领扣 1289. 原子的数量](#原子的数量)
1. [领扣 367. 表达树构造](#表达树构造)
1. [Uber 面试真题](#Uber面试真题)
1. [Twilio 面试真题](#Twilio面试真题)

### 逆波兰表达式求值

[领扣 424. 逆波兰表达式求值](https://www.lintcode.com/problem/424)

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

[领扣 370. 将表达式转换为逆波兰表达式](https://www.lintcode.com/problem/370)

> 借助`栈`我们可以实现中缀表达式到后缀表达式(即逆波兰表达式, RPN)的转换.
>
> 从左到右遍历中缀表达式:
>
> 1. 如果碰到`数字`, 直接追加到 RPN 末尾.
> 1. 如果碰到`左括号`, 入栈
> 1. 如果碰到`右括号`, 弹栈, 并将弹出的元素依次追加到 RPN 末尾, 直至左括号弹出(左括号不追加至 PN)
> 1. 如果碰到`运算符`, 弹栈直至栈顶元素优先级 小于 当前运算符, 所有弹出的元素依次追加到 RPN 末尾, 最后再将该运算符入栈
>
> 出于方便, 我们设定所有元素的优先级: \*/ 最高, +- 次之, 然后是数字, 最后是括号. (把括号设为最低是因为, 碰到运算符弹栈时, 遇到括号也要停止, 所以可以直接设为最低)
>
> 最后, 如果栈还有剩余, 弹栈, 依次追加到 RPN 末尾, 然后我们就得到了正确结果 RPN.

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

[领扣 368. 表达式求值](https://www.lintcode.com/problem/368)

> **思路** 这题是这篇文章的精髓，可以用我们上边提到的三种解法分别作答：
>
> 1.  把输入转成`后缀表达式RPN`，然后再求值；
> 1.  把输入转成`表达树`，然后再求值。这里的要点就是在表达树 node 里存一个 val 的参数，这个参数表示计算优先级，而且每层层次变化都需要加一个或者减一个 base；
> 1.  讨巧的用计算符`sign`来切割字符串，然后用`(`和`)`来界定递归的**层**；

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

> **递归解法**：递归解法需要维护一个 global 的 index 参数

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

[领扣 575. 字符串解码](https://www.lintcode.com/problem/575)

> **思路** 如原题所述，给你一个输入`S = 3[2[ad]3[pf]]xyz`，你需要写一个函数能够输出:`"adadpfpfpfadadpfpfpfadadpfpfpfxyz"`。这题是否就像[Twilio 面试真题](#Twilio面试真题)一样呢？可能不太一样，因为这题毕竟非常容易的切割出**层**的概念，而且这题如果你不在切的过程中维持**层**的概念，你会切出`3|2|ad|3|pf|xyz`，这样可能是`3[2[ad]3[pf]]xyz`，这可能是`3[2[ad]]3[pf]xyz`对吧？所以还是按部就班的切的过程中维持**层**数才会得到答案。
>
> 1.  遇到数字就缓存，因为数字可能是多位数；
> 1.  遇到左括号“[”，就把之前存的数字压入栈，并重置数字为零；
> 1.  遇到左括号“]”，说明此层遍历结束，需要对此层的相关栈内元素进行处理，那么结束的标志是什么呢？**那就是 pop 栈过程中遇到了数字**，这时候把字符串重复 n(数字)遍，并将结果压回栈；
> 1.  遇到字符没商量，直接压栈；

```java
//遍历解法
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

> 递归解法：递归解法需要维护一个 global 的 index 参数

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

1. [领扣 1289. 原子的数量](https://www.lintcode.com/problem/1289)
   > 还是来个递归解法吧：维护一个 global 参数 i

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
> 手撸一个python解法：
```python
class Solution:
    """
    @param formula: a string
    @return: return a string
    """
    def count_of_atoms(self, formula: str) -> str:
        from collections import deque
        from sortedcontainers import SortedDict
        i, n = 0, len(formula)

        def get_num():
            nonlocal i,n
            if i>=n or not formula[i].isnumeric():
                return 1
            res = 0
            while i<n and formula[i].isnumeric():
                res = res*10 + int(formula[i])
                i += 1
            return res

        def get_element():
            nonlocal i,n
            res = ''
            res += formula[i]
            i += 1
            while i<n and formula[i].islower():
                res += formula[i]
                i += 1
            return res

        stack = deque([])
        first_dict = SortedDict({})
        stack.append(first_dict)
        while i<n:
            c = formula[i]
            if c == '(':
                stack.append(SortedDict({}))
                i += 1
            elif c == ')':
                i +=1
                num = get_num()
                cur = stack.pop()
                top = stack[-1]

                for k, v in cur.items():
                    top[k]=top.get(k, 0)+v*num
            else:
                top = stack[-1]
                elem = get_element()
                num = get_num()
                top[elem]=top.get(elem, 0)+num
        
        # print(first_dict)
        res = ''
        for k, v in first_dict.items():
            res += k
            if v>1:
                res += str(v)
        return res
```


### 表达树构造

[领扣 367. 表达树构造](https://www.lintcode.com/problem/367)

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

[领扣 885. 字符串的最短长度编码](https://www.lintcode.com/problem/885)

### Uber 面试真题

> **原题**：给你一个 csv 的内容，让你 parse 成 key-value 的集合，如下：

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

### Twilio 面试真题

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
