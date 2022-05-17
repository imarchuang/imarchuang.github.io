# java刷题时的常用技巧

**敲黑板**：刷题时常用的一些奇淫异巧。

#### **技巧分类**
1. [队列和数组相关](#队列和数组相关)
1. [常用集合](#常用集合)
1. [字符串相关](#字符串相关)



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
      
      //int array 转string
      int[] ints = new int[]{1,2,3,4};
      
      System.out.println(Arrays.toString(ints)); //[1, 2, 3, 4]
      System.out.println(IntStream.of(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      
      //List of ints转string
      System.out.println(Arrays.stream(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      
      //String array 转string
      String[] strs = new String[]{"ab", "cd", "ef"};
      System.out.println(String.join("", strs)); //abcdef
      
      //String list 转string
      List<String> strsL = Arrays.asList(strs);
      System.out.println(String.join("", strsL)); //abcdef
      
      //List of ints转string
      System.out.println(Arrays.stream(ints).mapToObj(Integer::toString).collect(Collectors.joining(""))); //1234
      
      
      //int array 里找最大最小，已经算sum
      int[] ints2 = new int[]{1,2,3,4,5,6};
      System.out.println(IntStream.of(ints2).min().getAsInt()); //1
      System.out.println(Arrays.stream(ints2).min().getAsInt()); //1
      
      System.out.println(IntStream.of(ints2).max().getAsInt()); //6
      System.out.println(Arrays.stream(ints2).max().getAsInt()); //6
      
      
      System.out.println(IntStream.of(ints2).sum()); //21
      System.out.println(Arrays.stream(ints2).sum()); //21
      
      //int List 里找最大最小，已经算sum
      List<Integer> intsL2 = Arrays.stream(ints2).boxed().collect(Collectors.toList());
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
        System.out.println(Arrays.toString(sliced)); //[2, 5]
        
        int[] sliced2 = IntStream.range(1, 3).map(i->ints4[i]).toArray(); 
        System.out.println(Arrays.toString(sliced2)); //[2, 5]

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

        

        
    }
}
```
### json相关
> **JS里的Object完全可以当做一个map用**
```js
let map = {};

//检查key是否存在
if('key1' in map){...} //有个问题!!!就是即使对应的value为underfined，这个判定也会是true

if(map['key1']){...} //这个写法要注意！！！：如果map['key1']==0，这里会认定为false

if(map.hasOwnProperty('key1')){...} //这种写法会保证key的value不是undefined

if(map['key1']===undefined){...} //这样确保是存在{'key1':'val1'}键值对的

//遍历
for(const [k,v] of Object.entries(map)){...}
for(const k of Object.keys(map)){...}
for(const v of Object.values(map)){...}

for(const prop in map){...} //这样写的大问题！！！就是继承来的property也会被遍历


```

### 字符串相关
> **JS里string是primitive type，并非object** 
```js
//ascii与字符转换
let c = String.fromCharCode(97); //返回‘a'
let k='abc'.charCodeAt(0); //返回97

//替换
const p = 'monkeys love bananas';
let rp = p.replace('monkey', 'dog'); //这里会返回'dogs love bananas'，原来p不变

let regexP = p.replace(/love/i, 'like'); //这里会返回'monkeys like bananas'，原来p不变

//检测字符是否为数组
let c = '23';
if(!isNaN(c)){...}
if(/^\d+$/.test(c)){...}
if(/^-?\d*\.?\d*$/.test(c)){...} //这个也会检查负数

```