# Python关于集的数据结构

```python
# TUPLE
dice = ('A', 'B') # pack into a tuple
# tuple destructing, in python, it's called unpack the tuple
die1, die2 = dice
print(die1, die2)

# apply `in` keyword on tuple (as tuple is a iterable)
x=7
if x in (7, 10):
    print(f'{x} is in (7, 10)')

# apply iterator related functions on tuple
tup = (7, 9 ,10)
sum(tup)

# tuple可以wrap任何类型的数据
student = ('Marc', [99, 97, 100])
name, grades = student
print(f'{name}: {grades}')

student_tuple = 'John', 'Green', 3.3 # init a tuple without parentheses

first, second = 'hi' # first: 'h', second: 'i'

time_tuple = (9, 16, 1)
# use index to access tuple element
time_tuple[0]*3600 + time_tuple[1]*60 + time_tuple[2]

tuple1 = (10, 20, 30)
tuple2 = tuple1 # reference assignment, tuple2 is pointing to the same object
# TUPLE is not mutable in python
tuple1 += (40, 50) # this will create a new tuple, and then assign it to tuple1
# at this point, tuple2 will still point to original (10, 20, 30)

# appending tuple to list
numbers = [1,2,3,4,5]
numbers += (6, 7) # [1,2,3,4,5,6,7]
a_var = [1,2,3,4,5] + (6,7) # type error

# tuple itself is immutable, but its element could be MUTABLE
student = ('Marc', [99, 97, 100])
student[2][1] = 98

# unpacking tuples
num1 = 99
num2 = 22
num1, num2 = (num2, num1) # swap the values via tuple packing and unpacking

# enumerate function
colors = ['red', 'orange', 'yellow']
list(enumerate(colors)) # enumerate function will turn element in colors into tuples
# [(0, 'red'), (1, 'orange'), (2, 'yellow')]

tuple(enumerate(colors)) # enumerate function will turn element in colors into tuples
# ((0, 'red'), (1, 'orange'), (2, 'yellow'))

for index, value in enumerate(colors):
    print(f'{index}: {value}')


```

```python
# LIST
# Python does NOT have array (fixed length) data structure built in
c = [-45, 6 ,0, 73 1543]

c[0] # -45
c[-1] # 1543
c[-5] # -45

c[100] # IndexError

# List are mutable in python
c[4] = 17 # [-45, 6 ,0, 73, 17]
c += [10, 20] # [-45, 6 ,0, 73, 17, 10, 20]

l1 = [10, 20, 30]
l1 = [40, 50]
concatenated_list = l1 + l2 # [10, 20, 30, 40, 50]

l3 = [10, 20, 30]
l1 == l3 # True

l4 = [10, 20, 30, 40]
l1 <= l4 # True

# String and Tuple are NOT mutable in python

#unpacking list
num1, num2, num3 = [2,3,5] # 
num1, num2, num3 = range(10, 40, 10) # 

# `shallow` copy of lists subsets via slicing
nums = [2,3,5,7,11,13,17,19]
nums[2:6] # [5,7,11,13], contains copies of references to the original value
nums[:6] # [2,35,7,11,13], contains copies of references to the original value
nums[6:] # [17,19], contains copies of references to the original value
nums[:] # shallow copy of the original list
nums[::2] # [2,5,11,17], step size of 2, contains copies of references to the original value
nums[::-1] # [19,17,13,11,7,5,3,2], reverse of original list, contains copies of references to the original value
nums[-1:-9:-1] # [19,17,13,11,7,5,3,2],reverse of original list

nums = [2,3,5,7,11,13,17,19]
# modify elements from lists
nums[0:3] = ['first', 'second', 'thrid'] # ['first', 'second', 'thrid', 7,11,13,17,19]

# delete elements from lists
nums[0:3] = [] # [7,11,13,17,19]
nums[:] = [] # delete all elements from list
nums = [] # this will create a new list which is different from the original nums list

nums = [2,3,5,7,11,13,17,19]
numbers[::2] = [100, 100, 100, 100] # [100,3,100,7,100,13,100,19]

nums = [2,3,5,7,11,13,17,19]
del nums[-1] # [2,3,5,7,11,13,17], delete the last element of original array in nums
del nums[0:2] # [5,7,11,13,17], delete the first two elements of original array in nums
del nums[::2] # [7,13], delete the oddly numbered index elements of original array in nums
del nums[:] # [], delete all the elements in the original list
del nums # delete the whole variable

# PASS sequence to function (python always pass by reference)
def modify_elements(items):
    for i in range(len(items)):
        items[i] *= 2

nums = [10, 3, 7, 1, 9]
modify_elements(nums) # nums is now: [20, 6, 14, 2, 18]

modify_elements((10, 20, 30))) # TypeError: 'tuple' object does not support item assignment

# SORTING sequences (list or tuple)
nums = [10, 3, 7, 1, 9]
nums.sort() # nums is now: [1,3,7,9,10]
nums.sort(reverse=True) # nums is now: [10,9,7,3,1]

ascending_nums =  sorted(nums) # this create new sorted list, and original list is not changed 

letters = 'fafaefad' # String is NOT mutable in python
ascending_letters = sorted(letters) # ['a','a','a',...]

colors = ('red', 'orange', 'yellow', 'green', 'blue') # tuple is NOT mutable in python
ascending_colors = sorted(colors) # return as LIST: ['blue', 'green', 'orange', 'red', 'yellow']
descending_colors = sorted(colors, reverse=True) # return as LIST: [...]

# Searching in sequences: list, tuple, string
nums = [3,7,1,4,2,8,5,6]
nums.index(5) #6, return the first occurance of the target number 5
nums *= 2 # concatenate itself: [3,7,1,4,2,8,5,6,3,7,1,4,2,8,5,6]
nums.index(5,7) #14, return the first occurance of the target number 5 starting from index 7 (inclusive)
nums.index(7,0,4) #1, return the first occurance of the target number 7 starting from index 0 (inclusive) to ending index 4(exlusive)

1000 in nums # False
999 not in nums # True
nums.index(100) # ValueError

colors = ['orange', 'yellow', 'green']
colors.insert(0, 'red') # ['red', 'orange', 'yellow', 'green'], insert to any position
colors.append('blue') # ['red', 'orange', 'yellow', 'green', 'blue']

colors.extend(['indigo','violet']) # ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

# Adding
sample_list = []
s = 'abc'
sample_list.extend(s) # ['a', 'b', 'c']

t = (1,2,3)
sample_list.extend(t) # ['a', 'b', 'c', 1,2,3]

sample_list.extend((4,5,6)) #['a', 'b', 'c', 1,2,3,4,5,6]

# REMOVING
colors.remove('green') # ['red', 'orange', 'yellow', 'blue', 'indigo', 'violet'], it removes the first occurance of a element
colors.clear() # remove all the elements

# Counting
responses = [1,2,5,4,3,5,2,1,3,3,1,4,3,3,3,2,3,3,2,2]
for i in range(1,6):
    print(f'{i} appears {responses.count(i)} times in responses')

# Reversing
colors = ['red', 'orange', 'yellow', 'green', 'blue']
colors.reverse() # reverse in place

# Shallow coping
copied_list = colors.copy() # a shallow copy of the original list

# Stack, pop
stack = []
stack.append('red')
stack.append('green')

stack.pop() # remove and return 'green'

# List Comprehensions, replace your for loops, this is GREEDY operation
list2 = [item for item in range(1,6)] # [1,2,3,4,5]
list3 = [item ** 3 for item in range(1,6)] # [1,8,27,64,125]
list4 = [item for item in range(1,11) if item%2 == 0] # [2,4,6,8,10]
list5 = [(item, item ** 3) for item in range(1,6)] # [(1,1),(2,8),(3,27), (4,64), (5,125)]

colors = ['red', 'orange', 'yellow', 'blue']
colors2 = [item.upper() for item in colors] #['RED', 'ORANGE', 'YELLOW', 'BLUE']


# Generator Expressions, this is LAZY operation
nums = [10, 3, 7, 1, 9, -8, 4]
for value in (x**2 for x in nums if x%2!=0):
    print(value, end=' ')
# 9, 49, 1, 81

square_odds = (x**2 for x in nums if x%2!=0) # this is a generator operation
# <generator object <genexpr> at ....>

# Filter, Map and Reduce
nums = [10, 3, 7, 1, 9, -8, 4]
def is_odd(x):
    return x % 2 != 0

list(filter(is_odd, nums)) # filter is a LAZY operation, and list() actualize it: [3,7,1,9]
[item for item in nums if is_odd(item)] # [3,7,1,9]

list(filter(lambda x: x % 2 != 0, nums)) # filter is a LAZY operation, and list() actualize it: [3,7,1,9]

list(map(lambda x: x ** 2, nums)) # map is a LAZY operation, and list() actualize it: [100, 9, 49, 1, 81, 64, 16]
[item ** 2 for item in nums] # [100, 9, 49, 1, 81, 64, 16]

# mix map and filter
list(map(lambda x: x ** 2, filter(lambda x: x % 2 != 0, nums))) # [9,49,1,81]
[item ** 2 for item in nums if x % 2 != 0] # [9,49,1,81]

# colors = ['Red', 'orange', 'Yellow', 'green', 'Blue']
min(colors, key=lambda s: s.lower()) # 'Blue'
max(colors, key=lambda s: s.lower()) # 'Yellow'

nums = [10, 3, 7, 1, 9, -8, 4]
reversed_nums = [item ** 2 for item in reversed(nums)] # reversed is a LAZY operation, [16, 64, 81, 1, 49, 9, 100]

# ZIP
names = ['Marc', 'Bryce', 'Tonna', 'Beverly']
grades = [3.5, 4.0, 3.75, 3.90]

for name, gpa in zip(names, grades):
    # zip is a LAZY operator
    print(f'Name={name}: GPA={gpa}')

```
