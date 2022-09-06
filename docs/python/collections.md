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

# delete elements from lists
nums = 

```
