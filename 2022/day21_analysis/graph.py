import sys
import os.path as path
import re
import graphviz

if len(sys.argv) != 2:
    print("Usage: python graph.py <input_file>")
    sys.exit(1)
    
with open(sys.argv[1], 'r') as f:
    graphname = path.splitext(path.basename(sys.argv[1]))[0]
    print(graphname)
    g = graphviz.Graph(graphname, format='svg')
    g.attr(rankdir='LR')

    lines = [line.split(' ') for line in f.readlines() if re.match(r'\w+:\s+\w+\s+[+\-*\/]\s+\w+', line)]
    for line in lines:
        alpha = line[0].strip(':')
        beta = line[1]
        gamma = line[3]
        # g.node(line[0].strip(':'))
        # g.node(line[1])
        # g.node(line[3])
        g.edge(alpha, beta)
        g.edge(alpha, gamma)

g.render(path.join(graphname, ".svg"))
