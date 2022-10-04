# Python的函数是一等公民

```python
# DEFAULT parameter values
def rectangle_area(length=1, width=3):
    """Return a rectangle's area"""
    return length*width

rectangle_area() # 3
rectangle_area(10) # 30
rectangle_area(10, 5) # 50

# KEYWORD argument
rectangle_area(length=3, width=5) # 15
rectangle_area(width=5, length=3) # 15
rectangle_area(width=5) # 5

# 如果你只想让某些argument有default value，那么你一定要把这些arguments放到没有default value的那些arguments之后
def rectangle_area(length, width=3):
    return length*width

# 只有这样，你才可以无脑的这么叫函数
rectangle_area(5) # 15

def average(*args):
    return sum(args) / len(args)

# 这个*args和**kwargs要放到函数签名的最后两个arguments

average(5, 10, 15) #10
average(5, 10, 15, 20) #12.5

grades = [80, 90, 100, 78, 45]
#求average, 这时候你要用到所谓的unpacking的技巧了
# 把iterable前面加个*，意思就是upacking这个list了
average(*grades)

# SCOPING
# by default, a function cannot mutate global variable values
# to do this, you have to apply the `global` keyword
x = 7
def modify_global():
    global x
    x = 'hello'
    print(f'x modified inside function: {x}')

modify_global()
print(f'x after modified by function: {x}') # hello

# In python, everything is an object (aka, no primitives)
# In python, arguments is always 'pass-by-reference'
# Instead, primitives is treated as immutable objects, strings are IMMUTABLE too!


# pure function: stateless function, depending only on the inputs (arguments), no side-effect!

```

