# Python关于集的数据结构

## Strings: A Sequence
```python
#format string
f'{17.489:.2f}' # 17.49
f'{10:d}' # '10' format as decimal
f'{65:c} {97:c}' # 'A a'
f'{"hello":s} {7}' # 'hello 7' # everything is default to be eval as string
f'{Decimal("1000000"):.3f}' # '10000000.000'
f'{Decimal("1000000"):.3e}' # '1.000e+6'
f'{Decimal("1000000"):.3E}' # '1.000E+6'

# field width and alignment
f'[{27:10d}]' # '[        27]'
f'[{3.5:10f}]' # '[  3.500000]'
f'[{"hello":10}]' # '[hello     ]' # default to left alignment
f'[{27:<10d}]' # '[27        ]'
f'[{3.5:<10f}]' # '[3.500000  ]'
f'[{"hello":>10}]' # '[     hello]' # right alignment
f'[{27:^10d}]' # '[    27    ]' # center alignment

# numeric formatting
f'{10:+d}' # '+10' format with sign
f'[{10:+010d}]' # '[+000000010]' format with sign
print(f'{27:d}\n{27: d}\n{-27: d}')
#27
# 27
#-27
f'{12345678:,d}' # '12,345,678'
f'{123456.78:,.2f}' # '123,456.78'

# Regex
import re
pattern = '02215'
'Match' if re.fullmatch(pattern, '02215') else 'No match' # Match

# [] {} () \ * ? + ^ $ .
# \d digit, \D not a digit, \s whitespace char, \S not a whitespace
# \w word, \W not a word

'Valid' if re.fullmatch(r'\d{5}', '02215') else 'Invalid' # Valid
# r stands for raw string, \d means single digit, {5} is a quantifier,
# means 5 consecutive of \d
'Valid' if re.fullmatch(r'\d{5}', '0221') else 'Invalid' # Invalid

'Match' if re.fullmatch('[A-Z][a-z]*', 'Wally') else 'No match' #Match
# starts with a cap char, and follow by 0 or more lower case char
'Match' if re.fullmatch('[A-Z][a-z]+', 'E') else 'No match' #No match
# starts with a cap char, and follow by ONE or more lower case char

'Valid' if re.fullmatch('[^a-z]', 'Wally') else 'Invalid' #Valid
# ^ means NOT lower case char

'Match' if re.fullmatch('[$*+]', 'Wally') else 'No match'
# special chars turn into literal chars by putting in []

'Match' if re.fullmatch('labell?ed', 'labeled') else 'No match' # Match
'Match' if re.fullmatch('labell?ed', 'labellled') else 'No match' # No match
# ? matches 0 or 1 chars

'Match' if re.fullmatch(r'\d{3,}', '1234567890') else 'No match' # Match
'Match' if re.fullmatch(r'\d{3,}', '12') else 'No match' # No match
# {lower, upper} matches at least lower number to upper (inclusive)

# replacing with regex
re.sub(r'\t', ', ', '1\t2\t3\t4) #1, 2, 3, 4
re.sub(r'\t', ', ', '1\t2\t3\t4, count=2) #1, 2, 3\t4

# split with regex
re.split(r',\s*', '1,  2,  3,4,    5,6, 7,8')
# ['1', '2', '3', '4', '5', '6', '7', '8']
re.split(r',\s*', '1,  2,  3,4,    5,6, 7,8', maxsplit=3)
# ['1', '2', '3', '4,    5,6, 7,8']

# search with regex
result = re.search('Python', 'Python is fun') 
result.group() if result else 'not found' # 'Python'

result = re.search('Sam', 'SAM WHITE', flags=re.IGNORECASE)
result.group() if result else 'not found' # 'SAM'

result = re.search('^Python', 'Python is fun') 
result.group() if result else 'not found' # 'Python'
# ^ karrot char: means from the begining
result = re.search('Python$', 'Python is fun') 
result.group() if result else 'not found' # 'not found'
# $: means at the end

contact = 'Wally White, Home: 555-555-1234, Work: 555-555-4321'
re.findall(r'\d{3}-\d{3}-\d{4}', contact)
# ['555-555-1234', '555-555-4321'] 

for phone in re.finditer(r'\d{3}-\d{3}-\d{4}', contact):
    print(phone.group)
# '555-555-1234'
# '555-555-4321'

# capture substrings
text = 'Charlie Cyan, email: demo1@marc.com'
pattern = r'([A-Z][a-z]+ [A-Z][a-z]+), email: (\w+@\w+\.\w{3})'
# () wrapps a sub-expression, 
# it means the result will be evaluated and capture the result
# and the result can be accessed later (from index 1!!!)
result = re.search(pattern, text)
# this only gets result if the ENTIRE pattern got a match
# one sub-expression match but others not, will NOT return a result

result.groups() # ('Charlie Cyan', 'demo1@marc.com')
result.group() # 'Charlie Cyan, email: demo1@marc.com'
# group() returns the result matches the ENTIRE pattern

#sub-expression INDEX start from ONE
result.group(1) # 'Charlie Cyan'
result.group(2) # 'demo1@marc.com'


```

## Sequence: Tuple & List
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

## List
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

## Dictionary and Set
```python
# Dict, key must be immutable
country_codes = {'Finland':'fi'. 'South Africa':'za', 'Nepal':'np'}

country_codes['Finland'] # 'fi'
len(country_codes) # 3
if country_codes # test if the dict is empty
country_codes.clear() # remove all elements in dict
len(country_codes) # 0

# iterating dict
days_per_month = {'Jan':'31', 'Feb':'28', 'Mar':'31'}
# each key,val pair is a tuple, and unpacking here
for month, days in days_per_month:
    print(f'{month} has {days} days')
months = {'Jan':'1', 'Feb':'2', 'Mar':'3'}
for month_name in months.keys():
    print(month_name, end=' ')
for month_number in months.values():
    print(month_number, end=' ')

month_view = months.keys() # this will contain changes subsequently made

roman_numerals = {'I':'1', 'II':'2', 'II':'3', 'V':'5', 'X':'100'}
roman_numerals['X']=10 # dict is mutable, can change corresponding value
roman_numerals['L']=50 # if key does not exist, it will be added at the end
del roman_numerals['III'] # remove a key,val pair
roman_numerals.pop('X') # remove by key, and return the value of that key
roman_numerals.pop('III') # KeyError exception

country_codes={}
country_codes.update({'South Africa':'za'})
# any collections with 2 element can use the syntax below
country_codes.update(Australia='au'}) # {'South Africa':'za', 'Australia':'au'}}

roman_numerals.get('III') # no exception raised, return None
roman_numerals.get('III', 'DefaultVal') # get with default value

#membership testing, keys are case sensitive
if 'V' in roman_numerals: # return True
if 'III' in roman_numerals: # return False



# dict and set are MUTABLE

# dict comprehension
months = {'Jan':'1', 'Feb':'2', 'Mar':'3'}
# upon situation of key clashes, the last one wins
months2 = {number: name for name, number in months.items()} 

grades = {'Sue': [98, 87, 94], 'Bob': [84, 95, 91]}
grades2 = {k: sum(v)/len(v) for k, v in grades.items()} # {'Sue':93.0, 'Bob':90.0}





```

```python
colors = {'red' ,'orange', 'yellow', 'green', 'red', 'blue', 'green'} # {'red' ,'orange', 'yellow', 'green', 'blue'}
# !!! the order is not the order inserted!!!

if 'red' in colors: # True
if 'purple' in colors: # False

for color in colors:
    print(color.upper(), end=' ')

numbers = list(range(10)) + list(range(5))
set(numbers) # remove duplicates

#empty set
s = set()

# set are mutable, but the element in set are IMMUTABLE/Hashable

# frozen set -> IMMUTABLE set

# check if subset
{1,3} < {3,5,1} # True
{1,3}.issubset({3,5,1}) # {1,3} is actually a set object
# check if superset
{3,5,1} > {1,3} # True
{3,5,1}.issuperset({1,3}) # {3,5,1} literal is actually a set object

# set union
{1,3,5} | {2,4,6,3} # {1,2,3,4,5,6}
{1,3,5}.union({2,4,6,3})
{1,3,5}.union([2,4,6,3]) # parameter could be sequence: list or tuple
# set intersect
{1,3,4} & {2,3,4} # {2,3}
{1,3,4}.intersection({2,3,4}) # {2,3}
# set diff
{1,3,4} - {2,3,4} # {1}
{1,3,4}.difference({2,3,4})
# symmetric difference
{1,3,5}^{2,3,4} # {1,2,4,5}
{1,3,5}.symmetric_difference({2,3,4}) # {1,2,4,5}
# is disjoint
{1,2,5}.isdisjoint({2,4,6}) # True

# augumented assignment
# |=, &=, -=, ^=
numbers = {1,3,5}
numbers |= {2,3,4} # {1,2,3,4,5}
numbers.update(range(10)) # {0,1,2,3,4,5,6,7,8,9}
nubmers.add(17) # {0,1,2,3,4,5,6,7,8,9,17}

numbers.remove(3) # {0,1,2,4,5,6,7,8,9,17}
numbers.remove(18) # KeyError

numbers.disgard(18) # will not raise an exception
numbers.pop() # remove a random element
numbers.clear() # remove all elements

# SET comprehension
numbers = {0,1,2,3,4,5,6,7,8,9,9}
evens = {item for item in numbers if item%2==0} # {0,2,4,6,8}



```
