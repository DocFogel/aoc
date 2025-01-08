# Theory
Pressing button A a times and button B b times yields these equations to reach the price:

    a*Ax + b*Bx = Px
    a*Ay + b*By = Py

Solving for a and b yields:

a = (Px - b*Bx)/Ax
b = (Px*Ay - Py*Ax)/(Bx*Ay - By*Ax)

d = Ax*By - Ay*Bx != 0
a = (By*Px - Bx*Py) / d
b = (Ax*Py - Ay*Px) / d

If both a and b resolve to integers, then the price can be successfully retrieved, otherwise the machine wins.

For very large numbers, it may be wise to factorize the numerator and denominator of these quotients to see if they are divisible.
