# 数据结构题，不是数据结构设计

**这章主要是讲几个技巧类的数据结构** 

### 先BB
>说实话，这篇帖子想写有一段时间了，但是真的是苦于不知道怎么开始。回忆一下的话，当你我接触Java就是这么开始的，学了几个基础的数据结构Queue啊，Stack啊，LinkedList啊，Map啊Set啊之类的，后来又在IBM的时候因为工作需要，就看了好多处理多线程的一些数据结构，比如说ConcurrentHashMap，BlockingQueue之类的，所以自己似乎一直误解就是数据结构应该很容易。不过当你刷了很多题之后发现，数据结构的题虽然入手容易，但是真的要写好，而且要bug free的写好还真是个功夫活。
>
>虽然是计算机里只有两种结构，一个是组array，一个是链表List，但是吧这些你也就自己理解用的，真的面试中遇到数据结构设计实现题了，你还不得乖乖的用一些现成的语言里自带的结构包？这里就不得不提一下Java的优势，什么TreeMap啊TreeSet之类的真的是信手拈来，还有什么LinkedHashMap啊LinkedHashSet啊之类的也是好用的不得了。
>
>回过头来说说数据结构设计实现题的一些经验法则。
>1. 首先，这类题目并不是考验你对常见算法的思考深度，更多的时候看你能不能在有限的时间里把代码写成bug free。所以遇到此类题，切忌直接下手，先跟面试官话素一番，然后话素过程中一是清楚需求，而是顺便想想用那些数据结构可以用空间合理的换回时间来。
>1. 你不要怕declare多几个private的variable，这里的思想就是**宁愿多几个平行展开的hashmap，也不要嵌套很深的一个hashmap**，首先是平行展开你的逻辑更容易让面试官看懂，其次是平行展开和深度嵌套在空间上是没有什么优劣的，最后是深度嵌套很容易让你的code写的很难看。举个例子，就是**LFU设计**那题里，你会看到3个不同的map；
>1. 你不要试图把一个method函数写的太复杂，其实不是只有当你需要复用code的时候才知道新开一个private函数，只要是你觉得一块逻辑分出来让代码看上去更易理解，那你就分解出来，这里至少让面试官知道你不是一味地堆代码完任务，而是让别人知道你工程模块化能力是有的。
>1. 几乎所有的结构设计题都会至少含有两种函数接口，一个是添加元素，一个是搜索查询元素，这既是读和写。这里读和写之间往往会互相牵制，所以肯定会有复用代码，比如说**LRU设计**里的`markRecently`函数，尽量展示这种可复用等函数，这能体现你思维清晰度和模块化的能力。
>1. 在面试中出现的结构设计题90%以上都是一个某种形式的集合，这种集合通常是有种`特殊能力`或者说`特殊限制`，你的核心的函数一定会是对这种`限制规则`的实现。比如说让你设计一个带expire的cache，你需要做的就是通过put和get维护这个集合。
>
>还有一点就是面试过程中心态一定要平和，因为面试官给你一个结构设计题，说明他看的不是你刷题刷的多好，会多少道动规题，他其实有一个核心部分就是看你代码的模块化能力，和写出bug free代码的能力，所以心态平和，多跟面试官解释你的思路，这过程中也会帮你更可能写出bug free代码。
>
>我个人面试中，遇到设计数据结构已经两次了(**2020-07-06**)，一次是Google的二面时候，设计一个结构可以从一个二维平面上add一个点(x1,y1)也可以delete一个点(x2,y2)，然后不管是add还是delete都要返回一个能覆盖平面上所有点的矩形。第二次是Ripple面试的时候，让我设计一个带expire的cache。说实话，Google那次面试不是很成功，主要是因为没有用Java来写码，导致了没法用现成的TreeSet，只能最后跟面试官说了一下TreeSet的想法。
>
>

**数据结构考点**
>1. 数据结构的考点主要就是怎么巧妙地善用`HashMap/HashSet`以及`Heap/PriorityQueue`来巧妙地用空间换时间。延伸一下的话可以考你怎么善用`Trie`或者`UnionFind`等数据结构来解一些题，比如说最小生成树MST类。
>1. 对于单调栈和单调队列的题，属于较难的，所以会分出来独立讲解。
>1. 本篇着重于用`HashMap/HashSet`以及`Heap/PriorityQueue`的技巧，当然也会扩展到`LinkedHashMap`以及`TreeMap`的巧用。

>刷题列表：
>1. [Twilio面试真题](#Twilio面试真题)
>1. [Rippling面试真题](#Rippling面试真题)
>1. [Flexport面试真题](#Flexport面试真题)
>1. [Wish面试真题](#Wish面试真题)
>1. [380. O(1)时间插入、删除和获取随机元素](#获取随机元素) https://leetcode.cn/problems/insert-delete-getrandom-o1/
>1. [710. 黑名单中的随机数](#黑名单中的随机数) https://leetcode.cn/problems/random-pick-with-blacklist/
>1. [528. 按权重随机选择](#按权重随机选择) https://leetcode.cn/problems/random-pick-with-weight/
>1. [领扣642. 数据流滑动窗口平均值](#数据流滑动窗口平均值) 
>1. [387. 字符串中的第一个唯一字符](#字符串中的第一个唯一字符) https://leetcode.cn/problems/first-unique-character-in-a-string/
>1. [973. 最接近原点的K个点](#最接近原点的K个点) https://leetcode.cn/problems/k-closest-points-to-origin/
>1. [347. 前K个高频元素](#前K个高频元素) https://leetcode.com/problems/top-k-frequent-elements/
>1. [23. 合并K个升序链表](#合并K个升序链表) https://leetcode.cn/problems/merge-k-sorted-lists/
>1. [264. 丑数II](#丑数II) https://leetcode.cn/problems/ugly-number-ii/
>1. [146. LRU缓存](#LRU缓存) https://leetcode.cn/problems/lru-cache/
>1. [460. LFU缓存](#LFU缓存) https://leetcode.cn/problems/lfu-cache/

### Twilio面试真题
> **原题** 给你一个数组比如说`[2, 1, 3, 4]`, 再给你一个目标差值`k = 2`; 让你从数组中能找到数据对pair能使二者差值为k，问你有多少个？比如说，例子中的答案是2，因为你可以找到两组`[1,3]`和`[2,4]`。
> **思路** 这个基本上是TwoSum的变种，只不过不是求和，而是求差。这里唯一的不同就是求差的话，每个数字有两个可能的target，一个是`val-k`，一个是`val+k`，这里可能容易想不到。所以说，一个map直接就O(n)了对吧？直接看代码吧：
```java
import java.io.*;
import java.util.*;
import java.text.*;
import java.math.*;
import java.util.regex.*;

public class Solution {

/**
 * l - [2, 1, 3, 4], k = 2; return 2
 * l - [2, 1, 3, 4, 4], k = 2; return 2
 * l - [2, 1, 3, 4], k = 3; return 1 
 * l - [2, 1, 3, 4], k = 8; return 0
 * l - [2, 2, 3, 4], k = 0; return 1
 * l - [2, 2, 2, 2], k = 0; return 1
 * l - [-1, 3, 3, -1], k=4; 
 **/

public static Integer complement(List<Integer> l, Integer k) {
    Map<Integer, Integer> occurances = new HashMap<>();
    Set<String> resSet = new HashSet<>();
    Integer res = 0;
    for(Integer ele : l){
        int k1 = ele-k;
        int k2 = ele+k;
        if(occurances.containsKey(k1)){
            occurances.put(k1, occurances.get(k1)-1);
            if(occurances.get(k1)==0)
                occurances.remove(k1);
            String sKey = ele>k1?k1+"_"+ele:ele+"_"+k1;
            if(!resSet.contains(sKey)) res++;
            resSet.add(sKey);
            
        }
        else if(occurances.containsKey(k2)){
            occurances.put(k2, occurances.get(k2)-1);
            if(occurances.get(k2)==0)
                occurances.remove(k2);
            String sKey = ele>k2?k2+"_"+ele:ele+"_"+k2;
            if(!resSet.contains(sKey)) res++;
            resSet.add(sKey);
            
        }
        else {
            if(occurances.containsKey(ele))
                occurances.put(ele, occurances.get(ele)+1);
            else
                occurances.put(ele, 1);
        }
    }
    
    return res;
}


public static void main(String[] args) {
    //List<Integer> l = Arrays.asList(2);
    List<Integer> l = new ArrayList<>();
    int k = 8;
    int ans = complement(l, k);
    System.out.println(ans);
}
}
```

### Rippling面试真题
>**原题** 给你一大堆的一个服务的endpoint，比如说["some_endpoint/foo", "some_endpoint/bar"]之类的，现在让你设计一个能够track每个endpoint再过去的5分钟被叫了多少次。
>
>这题拿到手，你应该直到是个类似于expired cache的设计相关的类型，主要是这个5分钟的window给了我们很多信息。
>
>要跟面试官讨论一下啥时候清理evict过期的cache，是在get时候呢？还是在hit时候？还是两个函数都要？各种选择的优劣是啥？
>
>
```java
class MetricsCounter {
    private Map<String, LinkedHashMap<Integer, Integer>> cache = new HashMap<>();
    private int window = 300; //300s
    public void hit(String endpoint, int timestamp, int occurance){
        cache.putIfAbsent(endpoint, new LinkedHashMap<Integer, Integer>());
        LinkedHashMap<Integer, Integer> occurances = cache.get(endpoint);
        occurances.put(timestamp, occurances.getOrDefault(timestamp, 0)+occurance);
    }

    public int get(String endpoint, int timestamp){
        if(!cache.containsKey(endpoint)) return 0;

        LinkedHashMap<Integer, Integer> occurances = cache.get(endpoint);
        Iterator<Map.Entry<Integer, Integer>> itr = occurances.entrySet().iterator();
        int res = 0;
        while(itr.hasNext()){
            Map.Entry<Integer, Integer> entry = itr.next();
            if(entry.getKey()<timestamp-window){
                itr.remove();
                continue;
            }
            res += entry.getValue();
        }

        return res;
    }
}
```

### Flexport面试真题
> **原题** 题目给的特别清晰，说给你一个Shipment，shipment里包含不同的dimensions，比如说`{{"kgs": 4},{"cm": 6},{"crew": 2}}`，再给你一个叫做RateScheduler的东西，里面有各个dimension的单价，比如说`{{"kgs": 6},{"cm": 4},{"crew": 100}}`，让你写一个函数来就是一个shipment的总价。
>
> **思路** 当然原题其实写的比较含蓄，但是核心意思呢也就那样。主要就是考你Map的用法把这两个abstraction给包起来。
>
> **Followup** followup也很直白，说如果现在RateScheduler的规则变了，说RateScheduler里变复杂了，现在给出的规则是这样的：包裹的kgs那项呢，不是一个单价了，而是变成了这样：包裹小于6kgs就按4收费，包裹大于6kgs小于9kgs就按6收费，包裹大于9kgs就按13收费。
>
> 这里为了简化，就直接把followup的代码一起展示了。
```java
class Shipment{
    int id;
    Map<String, Integer> dimensions = new HashMap<>();
}

class RateScheduler{
    Map<String, Integer> costs = new HashMap<>();
    Map<String, TreeMap<Integer, Integer>> breakCosts = new HashMap<>();
}

class CostCalculator{

    int getCosts(Shipment shipment, RateScheduler rateScheduler){
        int res = 0;
        for(String key : shipment.dimensions.keySet()){
            if(breakCosts.containsKey(key)){
                int units = shipment.dimensions.get(key);
                TreeMap<Integer, Integer> breakCost = breakCosts.get(key);
                int unitCost = breakCost.higherEntry(units-1);
                res += unitCost*units;
                continue;
            }

            if(costs.containsKey(key)){
                int unitCost = costs.get(key);
                int units = shipment.dimensions.get(key);
                res += unitCost*units;
                //continue;
            }

        }
        return res;
    }

}
```

### Wish面试真题
>**原题** 给你一个堆Food，让你设计一个Food Rating系统，这个系统要支持
>1. 能够修改某个Food的rating；
>1. 能够返回某种cuisine的rating最高的一个Food；
>
>

### 按权重随机选择
[528. 按权重随机选择]() https://leetcode.cn/problems/random-pick-with-weight/

### 数据流滑动窗口平均值
[领扣642. 数据流滑动窗口平均值](https://www.lintcode.com/problem/642/) 
> **思路** 这题的主要考点就是借助一个额外的数据结构**Queue**来储存所有的window里的值，因为当这个window的size超过capacity时，需要删除最早的那个元素值。这里的**Queue**，我们用了LinkedList，因为它删除第一个元素的时间复杂度是O(1)，而相较用ArrayList的删除第一个元素的时间复杂度是O(n)。
```java
ublic class MovingAverage {
    private int size = 0;
    private double sum = 0;
    private Queue<Integer> nums = new LinkedList<>();
    /*
    * @param size: An integer
    */public MovingAverage(int size) {
        // do intialization if necessary
        this.size = size;
    }

    /*
     * @param val: An integer
     * @return:  
     */
    public double next(int val) {
        // write your code here
        nums.offer(val);
        sum += val;
        if(this.size<nums.size()){
            sum -= nums.poll();
        }

        return (double) sum/nums.size();
    }
}
```