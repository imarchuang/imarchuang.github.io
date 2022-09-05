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

```

