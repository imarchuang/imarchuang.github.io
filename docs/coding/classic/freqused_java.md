# java刷题时的常用技巧

**敲黑板**：刷题时常用的一些奇淫异巧。

#### **技巧分类**
1. [队列和数组相关](#队列和数组相关)
1. [常用集合](#常用集合)
1. [字符串相关](#字符串相关)
1. [Random随机数](#Random随机数)

### 队列和数组相关
> **Java里的队列和数组** 
```java
import java.util.*;
import java.util.stream.*;

public class MyClass {
    public static void main(String args[]) {

      //int, char, String互转
      int i=45; //--> 转String
      System.out.println(Integer.toString(i)); //45
      String s = "45"; //--> 转int
      System.out.println(Integer.valueOf(s)); //45
      System.out.println(Integer.parseInt(s)); //45
      String c = "4"; //--> 转int
      System.out.println(Integer.valueOf(String.valueOf(c))); //4
      System.out.println(Integer.parseInt(String.valueOf(c))); //4


      //char array转 string
      char[] chars = new char[]{'a','b','c','1'};
      
      System.out.println(new String(chars)); //abc1
      System.out.println(String.valueOf(chars)); //abc1
      System.out.println(Arrays.toString(chars)); //[a, b, c, 1]
      
      //List of chars转string
      System.out.println(Arrays.asList(chars).stream().map(String::valueOf).collect(Collectors.joining(""))); //abc1
      
      //int array 转string 打印数组
      int[] ints = new int[]{1,2,3,4};
      System.out.println(Arrays.toString(ints)); //[1, 2, 3, 4]
      System.out.println(IntStream.of(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      System.out.println(Arrays.stream(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      
      //List of ints转string

      //String array 转string
      String[] strs = new String[]{"ab", "cd", "ef"};
      System.out.println(String.join("", strs)); //abcdef
      
      //String list 转string
      List<String> strsL = Arrays.asList(strs);
      System.out.println(String.join("", strsL)); //abcdef
      
      //List of ints转string
      System.out.println(Arrays.stream(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      
      
      //int array 里找最大最小，算sum
      int[] ints2 = new int[]{1,2,3,4,5,6};
      System.out.println(IntStream.of(ints2).min().getAsInt()); //1
      System.out.println(Arrays.stream(ints2).min().getAsInt()); //1
      
      System.out.println(IntStream.of(ints2).max().getAsInt()); //6
      System.out.println(Arrays.stream(ints2).max().getAsInt()); //6
      
      
      System.out.println(IntStream.of(ints2).sum()); //21
      System.out.println(Arrays.stream(ints2).sum()); //21
      
      //int List 里找最大最小，已经算sum
      List<Integer> intsL2 = Arrays.stream(ints2).boxed().collect(Collectors.toList());//1->2->3->4->5->6
      System.out.println(Collections.min(intsL2)); //1
      System.out.println(Collections.max(intsL2)); //6
      System.out.println(intsL2.stream().reduce(0, (a, b) -> a + b)); //21
      System.out.println(intsL2.stream().mapToInt(Integer::intValue).sum()); //21

        // 数组排序
        int[] ints3 = new int[]{1,2,3,6,5,4};
        Arrays.sort(ints3);
        System.out.println(Arrays.toString(ints3));
        //Arrays.sort(ints3, (a,b)->a-b); 
        /*
        no suitable method found for sort(int[],(a,b)->a - b)
        */
        //System.out.println(Arrays.toString(ints3));
        
        // List排序
        List<Integer> ints3L = Arrays.stream(new int[]{3,2,5,8,1}).boxed().collect(Collectors.toList());
        Collections.sort(ints3L);
        System.out.println(ints3L.stream().map(String::valueOf).collect(Collectors.joining("")));
        Collections.sort(ints3L, Collections.reverseOrder());
        System.out.println(ints3L.stream().map(String::valueOf).collect(Collectors.joining("")));

        // slice array
        int[] ints4 = new int[]{3,2,5,8,1};
        int[] sliced = Arrays.copyOfRange(ints4, 1, 3);
        System.out.println(Arrays.toString(sliced)); //[2, 5]，不包括end index
        
        int[] sliced2 = IntStream.range(1, 3).map(i->ints4[i]).toArray(); 
        System.out.println(Arrays.toString(sliced2)); //[2, 5]，不包括end index

        //List相关操作
        //java.util.ArrayList provides O(1) time performance for replacement, get by index, insert at last index(aka, add()), however, deleting last element from ArrayList is O(n) though.

    }
}
```
### 常用集合
> **map，set，queue，stack，deque，TreeMap** 
```java
import java.util.*;
import java.util.stream.*;

public class MyClass {
    public static void main(String args[]) {
        
        //map来做count
        Map<String, Integer> cache = new HashMap<>();
        String key = "abc";
        cache.put(key, cache.getOrDefault(key, 0)+1);
        cache.put(key, cache.getOrDefault(key, 0)+1);
        key = "efs";
        cache.put(key, cache.getOrDefault(key, 0)+1);
        
        System.out.println(cache); //{abc=2, efs=1}

        //遍历map
        for(Map.Entry entry: cache.entrySet()){
            System.out.println(entry);
        }
        for(String k: cache.keySet()){
            System.out.println(k);
        }
        for(Integer val: cache.values()){
            System.out.println(val);
        }
        cache.forEach((k,v)->System.out.println(k+"="+v));

        //java9 init map
        Map<String, String> map = new HashMap<>(Map.of("key1","value1", "key2", "value2"));
        System.out.println(map); //{key1=value1, key2=value2}
        System.out.println(map.keySet()); //[key1, key2]

        // 如果遍历过程中需要delete map里的东西，就一定用iterator了
        while(map.keySet().iterator().hasNext()){
            String key = map.keySet().iterator().next();
            map.remove(key);
        }

        //init treemap
        TreeMap<Integer, String> tm = new TreeMap<>(Map.of(11,"value22", 10, "value20"));
        System.out.println(tm); //{10=value20, 11=value22}
        System.out.println(tm.keySet()); //[10, 11]
        
        //higherKey(), lowerKey(), higherEntry(), lowerEntry()
        System.out.println(tm.higherKey(10)); //11
        System.out.println(tm.higherKey(11)); //null
        System.out.println(tm.lowerKey(11)); //10
        System.out.println(tm.lowerKey(10)); //null
        System.out.println(tm.higherEntry(10)); //11=value22
        System.out.println(tm.higherEntry(11)); //null
        System.out.println(tm.lowerEntry(11)); //10=value20
        System.out.println(tm.lowerEntry(10)); //null
        
        //firstKey(), lastKey(),firstEntry(), lastEntry()
        System.out.println(tm.firstKey()); //10
        System.out.println(tm.lastKey()); //11
        System.out.println(tm.firstEntry()); //10=value20
        System.out.println(tm.lastEntry()); //11=value22
        
        //pollFirstEntry(), pollLastEntry()
        System.out.println(tm.pollFirstEntry()); //10=value20
        System.out.println(tm.pollLastEntry()); //11=value22
        System.out.println(tm.pollLastEntry()); //null
        
        
        
    }
}
```
### 字符串相关
> ***
```java
String str = new String("marc666");
String str = new String(new char[]{'m','a','r','c','6','6','6'});

StringBuilder sb = new StringBuilder();
for(char c='a'; c<='z'; c++)
    sb.append(c);

System.out.println(sb.toString()); //abcdefghijklmnopqrstuvwxyz
System.out.println(sb.length()); //26

//回溯框架里的path，如果是单纯地字符的路径，用string builder会好过List<String>
sb = new StringBuilder("oath");
sb.append('s');
System.out.println(sb.toString()); // oaths
sb.deleteCharAt(sb.length()-1); 
System.out.println(sb.toString()); //oath

//ascii与字符转换
int ascii = (int) 'a'; //返回97
char c = (char) 97; //返回'a'
System.out.println(ascii + "|" + c);//97|a

//检测字符是否为数
System.out.println(Character.isDigit('2')); //true
System.out.println(Character.isDigit('b')); //false

//检测字符串是否为数
System.out.println("321".chars().allMatch(Character::isDigit)); //true
System.out.println("abc".chars().allMatch(Character::isDigit)); //false
System.out.println("234".matches("[0-9]+"));//true
System.out.println("abc".matches("[0-9]+"));//false

//检测字符大小写
System.out.println("abc".chars().allMatch(Character::isLowerCase)); //true
System.out.println("143".chars().allMatch(Character::isLowerCase)); //false
System.out.println("234".contains("[a-zA-Z]+"));//false

System.out.println("abc".chars().mapToObj(Integer::toString).collect(Collectors.joining(""))); //979899
System.out.println("abc".chars().mapToObj(Character::toString).collect(Collectors.joining(""))); //abc

//替换
String p = "monkeys love bananas";
System.out.println(p.replace('monkey', 'dog')); //这里会返回'dogs love bananas'，原来p不变

//查找
System.out.println(p.indexOf("love"));//8
System.out.println(p.startsWith("monkey"));//true
System.out.println(p.endsWith("bananas"));//true


//拆分 左闭右开区间[i,j), substring 和数组的copyOfRange都是左闭右开区间
System.out.println("234".substring(0)); //234
System.out.println("234".substring(1)); //34
System.out.println("234".substring(1,2)); //3
System.out.println("234".substring(1,3)); //34
System.out.println("234".substring(1,5)); // Exception in thread "main" java.lang.StringIndexOutOfBoundsException: begin 1, end 5, length 3

String[] sArr = "10.110.0.245".split(".");
System.out.println(sArr.length); //0
sArr = "10.110.0.245".split("\\.");
System.out.println(String.join(" ",sArr)); //10 110 0 245




```

### Random随机数
>
```java
//用java.util.Random类
Random rand = new Random();
// Obtain a number between [0 - 49].
int n = rand.nextInt(50);

//用Math.random()
double random = Math.random() * 49 + 1;
int random = (int)(Math.random() * 50 + 1);

int max = 50, min = 10;
int random = (int )(Math.random() * (max-min+1) + min);
```