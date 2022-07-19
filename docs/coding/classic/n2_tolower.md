# 多项式级别的暴力问题的优化

> **DP与否**应该算是容易判断的，一个是求最值，一个是暴力解法很有可能是`O(n!)`或者`O(2^n)`指数级，然后你很肯定开始往重复子问题方向想了，然后再通过验证你对最优子结构的假设得出状态转化方程来，基本上问题就解决了，写出答案来通常是非常容易的。之前我在刷DP时候还有一个特征，就是说如果暴力解已经是多项式级别的了，很可能就不是DP思路解题了，这里就BB一下这类题的特征。
>
> 这篇算是半个总结篇吧，之所以要写主要是最近(**今天是2022-07-14**)在面Uber时候遇到了**滑动窗口题**，我竟然没能及时的转化到滑动窗口的思路上来，所以想借着热度来更广范围的思考一下自己的思维上的漏洞。这里呢，就说说如果你已经知道你一个暴力解已经是一个多项式级别的时间复杂度了，比如说`O(n^2)`，在这个基础上再继续优化的话，思考的思路通常有几条，但是思路都是空间换时间，比如说借助一个`HashMap`，借助一个`PQ`，借助一个`List`，甚至借助一个`TreeMap`或者`TreeSet`来达到效果。
>
> 这里说的题型给出的通常是一个数组或者字符串，数组可能是2D的矩阵，你能很快地锁定一个暴力解法出来，比如所先`外循环i`每个元素，然后针对每个元素i再`内循环j`遍历这个元素之后的数据。
>
>我直接上结论吧，思考的的思路不多不少只有四条：
>1. 往`O(nlogn)`方向思考，意思就是能不能先对一个集合继续排序，因为排序之后你就可以讨巧的思考双指针啊，二分法之类的技巧了；
>1. 往`O(n)`上思考，这里第一个方向就是能不能在遍历过程中维持一个**有序**，说白了就是往**单调栈**上思考，这个思路属于空间换时间的一种，但是单调栈的思路只适用于单向的，比如说递增单调栈或者递减单调栈，目前位置没看到需要同时维护递增和递减两种单调栈的。
>1. 还是往`O(n)`上思考，如果你发现单调栈的路可能不通，这时你就要思考**老猛男滑动窗口**了，这里怎么把问题分解成一个可以通过一个**窗口集合**来判断的条件是难点，最简单的能可能是窗口的大小不能超过某个宽度，中等的呢可能是保证窗口里的元素无重复(这时候呢用个`hashmap`基本就够了)，比较难的就是你要保证窗口里的元素可以增删查改(这时候呢基本上就是用一个`PQ`或者`TreeMap`之类的进行维护了，这时候的时间复杂度很可能是`O(nlogK)`了)。
>1. 这个思路应该放到最后，因为确实应用的题型比较固定，比如说最大子数组啊，就是往动态规划DP上思考。
>
>最后呢，建议是如果你思考了**2分钟以上**了还是没啥思路，那你应该跟面试官套套瓷，主要核心目的就是看能不能套出是往`O(nlogn)`方向思考呢，还是往`O(n)`上思考。这种套磁基本不会扣分，因为不算直接提示，而且面试官也愿意给出这种提示。

>先说说这题，也是一道`Wish面试真题`，给你一串intervals，比如`[[1,4],[2,3],[3,4]]`，然后让你找每个interval右边紧邻的interval(跟自己没有overlap的最近的右边那个)在原数组中的坐标，前面给出的例子中的答案就是`[-1,2,-1]`，这里是说如果右边不存在和自己没有overlap的话就返回-1，而且原题还说**You can assume that the starting value of the interval is unique in the given array**。
>1. 考到这题呢，你应该**无脑的相信**一个interval的数组就应该先排序，是按start排还是end排，还是先按start再按end排，这个要根据题仔细思考，但是对区间数组进行排序几乎是100%的。这题比较容易看出，我们可以按start排。
>1. 排序完了，那针对`第i个`interval，你就可以直接看从`第i+1`个开始后面的intervals了，找到第一个符合条件的不就解决了嘛，这样的暴力解法肯定是`O(n^2)`的。
>1. 排序已经花了`O(nlogn)`了，这种情况下你可能在想**能不能不排序**给出解法啊？你很可能脑子里开始思考**单调栈**了，但是你思来思去可能也没找到通路，这时候我建议就是跟面试官套磁一下，说说你的想法，你觉得`O(nlogn)`可能是你能想到的最好解法了，这样优化是不是面试官想要的。
>1. `O(nlogn)`的解法是啥呢？容易嘛，因为你之前不是排过序了嘛，那你从`第i+1个`开始后面的intervals了里找答案的时候不就可以用二分法了吗？那就是看后面的interval的start里哪个是第一个比自己(第i个interval的end)大的。
>1. 最好说一下，因为答案要求原来数组中坐标位置，所以需要借助一个额外的`hashmap`来存储原数组的坐标。
```java
// Example 1:
// Input: intervals = [[1,2]]
// Output: [-1]
// Explanation: There is only one interval in the collection, so it outputs -1.

// Example 2:
// Input: intervals = [[1,4],[2,3],[3,4]]
// Output: [-1,2,-1]
// Explanation: 
// There is no right interval for [1,4] and [3,4].
// The right interval for [2,3] is [3,4] since start2 = 3 is the smallest start that is >= end1 = 3.

// Example 3:
// Input: intervals = [[3,4],[2,3],[1,2]]
// Output: [-1,0,1]
// Explanation: 
// There is no right interval for [3,4].
// The right interval for [2,3] is [3,4] since start0 = 3 is the smallest start that is >= end1 = 3.
// The right interval for [1,2] is [2,3] since start1 = 2 is the smallest start that is >= end2 = 2.

import java.io.*;
import java.util.*;
import java.text.*;
import java.math.*;
import java.util.regex.*;

public class Solution {
    
    private static int[] getRightElePosition(int[][] intervals){
        Map<String, Integer> positions = new HashMap<>();
        for(int i=0; i<intervals.length; i++){
            positions.put(intervals[i][0]+"_"+intervals[i][1], i);
        }
        
        //sort it
        Arrays.sort(intervals, (a,b)-> a[0]-b[0]);
        int[] startValues = new int[intervals.length];
        for(int i=0; i<intervals.length; i++){
            startValues[i] = intervals[i][0];
        }
        
        int[] res = new int[intervals.length];
        for(int i=0; i<intervals.length; i++){
            int target = intervals[i][1];
            int pos = binSearch(startValues, i+1, target);
            
            int orig = positions.get(intervals[i][0]+"_"+intervals[i][1]);
            
            if(pos<0) res[orig] = -1;
            else res[orig] = positions.get(intervals[pos][0]+"_"+intervals[pos][1]);
        }
        
        return res;
    }
    
    private static int binSearch(int[] startValues, int startIndex, int target){
        int pos = Arrays.binarySearch(startValues, startIndex, startValues.length, target);
        //System.out.println(pos);
        return pos;
    }

    public static void main(String[] args) {
        //int[][] intervals = {{3,4},{2,3},{1,2}};
        //int[][] intervals = {{1,4},{2,3},{3,4}};
        int[][] intervals = {{1,2}};
        
        int[] testResult = getRightElePosition(intervals);
        for(int e : testResult)
            System.out.println(e);
    }
}
```

>再说说这题，是一道`Uber面试真题`，原题是这样的，给你一个数组`[4,2,1,3,2,3,2,6,1]`, 再给你一个`T=1`，让你找这个数组里的**longest strict subarray**。啥是**strict subarray**呢？就是说这个subarray里的任意两个元素的差(绝对值)是小于等于`T`的。
>1. **strict subarray**你要先把握准，怎么判断一个subarray是不是strict的呢？是不是只需要看在这个数组里的最大值和最小值只差就好了？
>1. 暴力解法应该很好想吧？先外循环数组里的每个i元素，然后针对每个元素i再内循环遍历这个i元素之后的j个元素，遍历j的过程中你就可以维护最大值和最小值来判断啥时候结束内循环，这样的暴力解法肯定是`O(n^2)`的。
>1. 这时候跟面试官说说你的暴力思路，面试官基本上会直接问你能不能优化一下。然后你可能先思考`O(nlogn)`方向，但是这题显然不能先排序，因为题目里说的subarray，这类题通常排序会不灵光。
>1. 那就只剩`O(n)`方向了，**单调栈**试试？很快你就发现这题行不通，因为暴力解的时候你已经发现了主要是看subarray里最大值和最小值，单调栈通常只能看一面，或者最大后者最小。
>1. **PS** 这时候我犯了思维定式的毛病，我天真的因为这题应该是个类似于最大子数组的题，用动规的解法看以i元素结尾的subarray去找思路，显然是掉进了坑里。
>1. 这题的正确思路应该是**老猛男滑动窗口**，借助于暴力解时你发现的维护最大值和最小值来判断啥时候右移左指针和右指针。
>1. 但是这题难点在于这个最大值和最小值在你右移左指针的时候是需要删除元素的，所以用一个合理的数据结构来维护这个窗口变成了重点，`PQ`适合找最大值最小值，但是不能删除元素，所以你应该很快的想到应该用`TreeMap`或者`TreeSet`，这样插入和删除都是logK的复杂度。
```java
public static getLongestStrictSubarray(int[] array, int T){
    int n= array.length;
    TreeMap<Integer, Integer> window = new TreeMap<>();
    int left=0, right=0;
    int res = 1;
    while(right<n){
        window.put(array[right], right);
        while(window.lastKey() - window.firstKey() > T){
            res =  Math.max(res, right-left);
            int cur = array[left];
            int lastIdx = window.get(array[left]);
            if(array[left]==window.lastKey() || array[left]==window.firstKey()){
                if(window.get(array[++left]) < lastIdx)
                    window.remove(array[left]);
            }

            window.remove(cur);
        }
        right++;
    }
}
```

>再说说这题，是一道`Google面试真题`，原题是这样的，给你一个二维平面, 现在允许你往这个平面里加坐标点，也可以删除坐标点，不管是添加还是删除，你都要**很快的**返回一个矩形，这个矩形是能cover平面上当前所有点的并且面积最小。
>1. 这题吧，暴力解话就是维护所有坐标点在一个array里，然后每次添加完或者删除完都去遍历这些所有点然后找这四个值：Xmin, Xmax, Ymin, Ymax，这样就能确定最小矩形了，这样的暴力解法肯定是`O(n)`的。
>1. 面试官会告诉你`O(n)`还不够，能不能优化一下，说实话，从`O(n)`开始优化，思路很直接：或者二分法做的`O(logn)`或者用一些奇淫异巧做到`O(1)`。这题添加或者删除做都做到`O(1)`真的不太现实，而且这种算法在面试中出现的概率基本为零，因为主要就是数学知识。
>1. 那怎么做到`O(logn)`呢？肯定是二分法对吧？那二分法的话，我们肯定要预先维护好数据的**顺序**了对吧？通常用什么数据结构呢？你可能想到了纯原始数组肯定不行，因为你要二分插入，插入数组肯定要`O(n)`。那你是不是想到了PQ，这样总行了吧，两个`PQ`，一个找最大一个找最小，插入是`logk`的，查询是`O(1)`的。但是很不幸PQ的最大缺点就是不能删除，所以一旦牵扯到删除了，PQ肯定就不好使了。
>1. 这时你应该想到`TreeSet`了对吧？插入和删除都是`log(n)`的复杂度，这也正是这题的答案。
```java
class MinRectangle {
    private TreeSet<Integer> xAxis = new TreeSet<>();
    private TreeSet<Integer> yAxis = new TreeSet<>();
    private Set<String> points = new HashSet<>();
    private Map<Integer, Integer> pointsX = new HashMap<>();
    private Map<Integer, Integer> pointsY = new HashMap<>();

    public int[] add(int x, int y){
        if(!points.contains(x+"_"+y)){
            points.add(x+"_"+y);
            xAxis.add(x);
            pointsX.put(x, pointsX.getOrDefault(x, 0)+1);
            yAxis.add(y);
            pointsY.put(y, pointsY.getOrDefault(y, 0)+1);
        }

        return getMinRectangle();
    }

    public int[] delete(int x, int y){
        
        if(points.contains(x+"_"+y)){
            points.delete(x+"_"+y);
            pointsX.put(x, pointsX.get(x)-1);
            if(pointsX.get(x)==0){
                pointsX.remove(x);
                xAxis.remove(x);
            }
            
            pointsY.put(x, pointsY.get(y)-1);
            if(pointsY.get(y)==0){
                pointsY.remove(y);
                xAxis.remove(y);
            }
        }

        return getMinRectangle();
    }

    private int[] getMinRectangle(){
        int[] res = {Integer.MIN_VALUE,Integer.MAX_VALUE,Integer.MIN_VALUE,Integer.MAX_VALUE};
        if(xAxis.size()>0){
            res[0] = xAxis.first();
            res[1] = xAxis.last();
            res[2] = yAxis.first();
            res[3] = yAxis.last();
        }

        return res;
    }
}
```


