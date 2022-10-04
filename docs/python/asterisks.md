# Python 的星号的多用法

### 用来 desctructing 或者 uppacking

> 有点类似于 Javascript 里的`...`，也即是传说中的 destructing operator

```python
fruits = ['lemon', 'pear', 'watermelon', 'tomato']
first, second, *remaining = fruits
print(remaining) # ['pear', 'watermelon', 'tomato']

first, *middle, last = fruits
print(middle) # ['pear', 'watermelon']

# 比较复杂的话，还可以潜逃应用：
((first_letter, *remaining), *other_fruits) = fruits
print(remaining) # ['e', 'm', 'o', 'n']
print(other_fruits) # ['pear', 'watermelon', 'tomato']
```

### 用在 list 或者 dictionary 的 literal 里

> 还是有点类似于 Javascript 里的`...`

```python
numbers = [2, 1, 3, 4, 7]
more_numbers = [*numbers, 11, 18]

def palindromify(sequence):
    return list(sequence) + list(reversed(sequence))
# 用*你就可以这么写了：
def palindromify(sequence):
    return [*sequence, *reversed(sequence)]

#这样你就不用多次转换成list了

def rotate_first_item(sequence):
    return [*sequence[1:], sequence[0]]

fruits = ['lemon', 'pear', 'watermelon', 'tomato']
(*fruits[1:], fruits[0]) #('pear', 'watermelon', 'tomato', 'lemon')
uppercase_fruits = (f.upper() for f in fruits) #这是个generator

# 现在你把一个list和一个generator一起放进一个set里：
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

### 通过星号把参数 reference 传入所呼叫的函数里

> 这个不用多说了，最经典的莫过于`def __init__(self, *args, **kwargs)`
