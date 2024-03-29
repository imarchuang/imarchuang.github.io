# Python 的星号的多用法

### 用来 desctructing 或者 uppacking
> 有点类似于 Javascript 里的`...`，也即是传说中的 destructing operator

```python
fruits = ['lemon', 'pear', 'watermelon', 'tomato']
first, second, *remaining = fruits
print(remaining) # ['pear', 'watermelon', 'tomato']

first, *middle, last = fruits
print(middle) # ['pear', 'watermelon']

# 比较复杂的话，还可以嵌套应用：
((first_letter, *remaining), *other_fruits) = fruits
print(remaining) # ['e', 'm', 'o', 'n']
print(other_fruits) # ['pear', 'watermelon', 'tomato']
```

### 用在 list 或者 dictionary 的 literal 里
> 还是有点类似于 Javascript 里的`...`，list/tuple 用一个*，dict用两个**

```python
numbers = [2, 1, 3, 4, 7]
more_numbers = [*numbers, 11, 18]

def palindromify(sequence):
    return list(sequence) + list(reversed(sequence))
# 用*你就可以这么写了：
def palindromify(sequence):
    return [*sequence, *reversed(sequence)]

# 这样你就不用多次转换成list了
def rotate_first_item(sequence):
    return [*sequence[1:], sequence[0]]

fruits = ['lemon', 'pear', 'watermelon', 'tomato']
(*fruits[1:], fruits[0]) #('pear', 'watermelon', 'tomato', 'lemon')
uppercase_fruits = (f.upper() for f in fruits) # 这是个generator

# 现在你把一个iterator和一个generator一起放进一个set里：
{*fruits, *uppercase_fruits} # {'lemon', 'watermelon', 'TOMATO', 'LEMON', 'PEAR', 'WATERMELON', 'tomato', 'pear'}

# 下面是dict的例子
date_info = {'year': "2020", 'month': "01", 'day': "01"}
track_info = {'artist': "Beethoven", 'title': 'Symphony No 5'}

#把两个dict的key-value全部union起来
all_info = {**date_info, **track_info}
# {'year': '2020', 'month': '01', 'day': '01', 'artist': 'Beethoven', 'title': 'Symphony No 5'}

# copy到新的dict里，同时添加
date_info = {'year': '2020', 'month': '01', 'day': '7'}
event_info = {**date_info, 'group': "Python Meetup"}
event_info # {'year': '2020', 'month': '01', 'day': '7', 'group': 'Python Meetup'}

# copy到新的dict里，同时更新
event_info = {'year': '2020', 'month': '01', 'day': '7', 'group': 'Python Meetup'}
new_info = {**event_info, 'day': "14"}
new_info
# {'year': '2020', 'month': '01', 'day': '14', 'group': 'Python Meetup'}date_info = {'year': '2020', 'month': '01', 'day': '7'}

```

### 函数签名里参数输入
> 这里就是**using the variadic arguments**了，也就是说当你需要传入函数的参数个数是不确定的时候，那你就可以借助*传入所叫函数中了，最最经典的莫过于`print(...)`，`format(...)`之类的函数了

```python
fruits = ['lemon', 'pear', 'watermelon', 'tomato']
print(*fruits)
# 因为print函数接受任意个数的输入参数，*fruits就等于 print(fruits[0], fruits[1], fruits[2], fruits[3])

# 而且这个*参数可以多次使用，比如说：
numbers = [2, 1, 3, 4, 7]
print(*numbers, *fruits)
# 2 1 3 4 7 lemon pear watermelon tomato

# 另外一个例子
def transpose_list(list_of_lists):
    return [
        list(row)
        for row in zip(*list_of_lists)
    ]

transpose_list([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
# [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# ** 也是一样，比如说format函数
date_info = {'year': "2020", 'month': "01", 'day': "01"}
track_info = {'artist': "Beethoven", 'title': 'Symphony No 5'}
filename = "{year}-{month}-{day}.txt".format(**date_info, **track_info)
print(filename) # '2020-01-01-Beethoven-Symphony No 5.txt'

```

### 函数签名里参数，但是作为特殊讯号来修饰函数
> 1. 你想修饰你的函数说：必须只能接受keyword args
```python
def greet(*, greeting, name):
    print(greeting, name)
```
> 这里的greet函数因为第一个arg是*，说明你只能用keyword only的方式来invoke它了

> 2. 你想修饰你的函数说：某个参数之后的其他参数只能接受keyword args
```python
def greet(greeting, *, first_name, last_name):
    print(greeting, first_name, last_name)
```
> 这里的greet函数因为第二个arg是*，说明first_name, last_name参数你只能用keyword的方式来invoke它了

> 3. 到这里了，就得说说*的mirror operator，那就是`/`
```python
def foo(a, b, / , x, y):
   print("positional ", a, b)
   print("positional or keyword", x, y)

# valid invocation
foo(40, 20, 99, 39)
foo(40, 3.14, "hello", y="world")
foo(1.45, 3.14, x="hello", y="world")

# valid invocation
foo(a=1.45, b=3.14, x=1, y=4)
```
> 这里的foo函数因为第三个arg是`/`，说明`/`之前的`a`和`b`参数你只能用positional arg的方式来传入，如果你用keyword arg方式传入的话会报错`TypeError: foo() got some positional-only arguments passed as keyword arguments: 'a, b'`。

> Parameters in function definition prior Foraward slash (/) are positional only and parameters followed by slash(/) can be of any kind as per syntax. Where arguments are mapped to positional only parameters solely based on their position upon calling a function. Passing positional-only parameters by keywords(name) is invalid.

### 通过星号把参数 reference 传入所呼叫的函数里
> 这个不用多说了，最经典的莫过于`def __init__(self, *args, **kwargs)`，这里的*args，**kwargs的写法叫做 packing。
>
> 下面就简单展示一下所谓的**packing**和**variadic arguments**和配合使用
```python
class LazyAwareDataDict(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
```
> 这里`*args`, `**kwargs`当做`__init__`函数的args时，用的就是所谓的**packing**技巧，然后当你直接借用它俩去invoke`super().__init__`函数时，那里就是所谓的**variadic arguments**的使用了。