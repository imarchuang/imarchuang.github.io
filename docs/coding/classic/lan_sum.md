# 刷题时的常用的语言技巧

**敲黑板**：刷题时常用的一些语言技巧汇总。

#### **技巧分类**
1. [基本转换](#基本转换)
1. [队列相关](#队列相关)
1. [map/set相关](#map-set相关)
1. [json相关](#json相关)
1. [字符串相关](#字符串相关)


### 基本转换
> 1. Java
>   1. `Integer.valueOf(某个字符串s)`或者`Integer.parsetInt(某个字符串s)`
>   1. `100.toString()`转换成string的表达
>
> 1. Javascript
>   1. `parsetInt('100')`
>   1. `i = i+''`简单粗暴; 或者`100.toString(16)`比较像java；个人觉得最佳做法是`String(100)`，比较JSONic
>
> 1. Python
>   1. `int("100")`简单粗暴;
>   1. `str(100)`简单粗暴; 或者`"{}".format(100)`；个人觉得最佳做法是`n=100; f'{n}'`，比较Pythonic
>

### 队列相关
#### 二维数组 MxN (高 x 宽)
```java
// Declaration along with initialization (default to 0)
// 2D integer array with n rows and m columns
int m=4, n=3;
int[][] integer2DArray = new int[n][m];

# init with values
int[][] matrix = {
            { 1, 2, 3 },                       // row 1
            { 4, 5, 6 },                       // row 2
            { 7, 8, 9 },                       // row 3
        };

```

```js
// declare一个MxN(高 x 宽)的二维数组并初始化为0
let [m, n] = [3, 4];
let matrix = [...Array(m)].map(x=>Array(n).fill(0)); 

```

```python
# 3x3的矩阵
t = [ [0]*3 for i in range(3)]

# Creates a list containing 5 lists, each of 8 items, all set to 0
m, n = 8, 5
matrix = [[0 for x in range(m)] for y in range(n)] 
```

#### 双端队列
```java

```

```js

```

```python

```

### 队列相关
> **JS里所以数组都是双端队列** 既可以当queue，又可以当stack
```js

// declare一个“双端队列”
let queue = []; 
//入列和出列
queue.push(val);
queue.shift();

//入栈和出栈
queue.push(val);
queue.pop();

//peek()元素
queue[queue.length-1]；

// 看队列是否为空
while(queue.length>0){...}；

//遍历
for(const ele of queue){...}

//从队列最头上加元素(不常用)
queue.unshift();

//转化
queue.map(x=>x.length); //直接返回新的array

//过滤
queue.filter(x=>x>3); //直接返回新的array

//删除某一位置的元素via splice()
let scores = [1, 2, 3, 4, 5];
/*从第0位起删除三位
会在原数组上原地操作，返回值是被删掉的元素，没删掉的保留在原数组
*/
let deletedScores = scores.splice(0, 3); 
console.log(scores); //  [4, 5]
console.log(deletedScores); // [1, 2, 3]

//插入某一位置的元素via splice()
let colors = ['red', 'green', 'blue'];
/*在原数组插入，注意这里的函数会返回一个空数组*/
colors.splice(2, 0, 'purple', 'yellow'); //在数组从第2(0-based)位起插入['purple', 'yellow']
console.log(colors); // ["red", "green", "purple", 'yellow', "blue"]

//替换某一位置的元素via splice()
let languages = ['C', 'C++', 'Java', 'JavaScript'];
languages.splice(1, 1, 'Python'); //在第一位上插入Python，并删除第一位起的一位；这里会返回一个数组['C++']
console.log(languages); //['C', 'Python', 'Java', 'JavaScript']
languages.splice(2,1,'C#','Swift','Go');
console.log(languages); // ["C", "Python", "C#", "Swift", "Go", "JavaScript"]

//分割数组
var colors = ['red','green','blue','yellow','purple'];
var rgb = colors.slice(0,3);
console.log(rgb); // ['red','green','blue']
console.log(colors); //原数组不变：['red','green','blue','yellow','purple'];

```
### map set相关
> **JS里map几乎都可以被json object代替** 
```js

let map = new Map(), set = new Set();

//从array里直接建立set
let arr = [1,1,2,3,4,5];
let s = new Set(arr);

//插入、更新
map.set('a', 1);
set.add('a');

//查找
map.get('a');
map.has('a'); //true false
set.has('a'); //true false

//删除
map.delete('a');
set.delete('a');

//遍历
for(const [k,v] of map.entries()){...}
for(const k of map.keys()){...}
for(const v of map.values()){...}

for(const s of set){...}

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