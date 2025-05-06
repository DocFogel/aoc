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

    for line in f.readlines():
        if re.match(r'\w+:\s+\w+\s+[+\-*\/]\s+\w+', line):
            line = line.split(' ')
            alpha = line[0].strip(':')
            beta = line[1]
            gamma = line[3]
            if alpha == 'root':
                g.node(alpha, "%s %s" % (alpha, line[2]), color='orange', style='filled')
            else:
                g.node(alpha, "%s %s" % (alpha, line[2]))
            g.node(beta)
            g.node(gamma)
            g.edge(alpha, beta)
            g.edge(alpha, gamma)
        else:
            node = line.strip().split(':')
            if node[0] == 'humn':
                g.node(node[0], "%s = %s" % (node[0], node[1]), color='cyan', style='filled')
            else:
                g.node(node[0], "%s = %s" % (node[0], node[1]))

g.render(path.join(graphname, ".svg"))
