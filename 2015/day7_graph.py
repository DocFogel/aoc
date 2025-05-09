import sys
import os.path as path
import re
import graphviz

def valueIds():
    idx = 1
    while True:
        try:
            yield "value-%03d" % idx
        except StopIteration:
            break
        idx += 1


if len(sys.argv) != 2:
    print("Usage: python graph.py <input_file>")
    sys.exit(1)
    
with open(sys.argv[1], 'r') as f:
    valueId = valueIds()

    graphname = path.splitext(path.basename(sys.argv[1]))[0]
    print(graphname)
    g = graphviz.Digraph(graphname, format='svg')
    g.attr(rankdir='LR')

    for line in f.readlines():
        if re.match(r'\w+ -> \w+', line):
            parts = line.split(' -> ')
            alpha = parts[1]
            g.node(alpha)
            if parts[0].isdecimal():
                beta = next(valueId)
                g.node(beta, parts[0], shape='box')
            else:
                beta = parts[0]
                g.node(beta)
            g.edge(beta, alpha)
        elif re.match(r'NOT \w+ -> \w+', line):
            parts = line.split()
            alpha = parts[3]
            beta = parts[1]
            g.node(beta)
            g.node(alpha)
            g.edge(beta, alpha)  
        else:
            line = line.split(' ')
            # indexes 0, 2, 4 are the operands
            alpha = line[4]
            beta = line[0]
            gamma = line[2]
            g.node(alpha)
            if beta.isdecimal():
                beta = next(valueId)
                g.node(beta, line[0], shape='box')
            else:
                g.node(beta)
            g.edge(beta, alpha)
            if gamma.isdecimal():
                gamma = next(valueId)
                g.node(gamma, line[2], shape='box')
            else:
                g.node(gamma)
            g.edge(gamma, alpha)

g.render(path.join(graphname, ))
