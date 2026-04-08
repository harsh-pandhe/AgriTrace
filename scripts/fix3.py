import re

with open('main.tex', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace \textit{https://...} with \textit{\url{https://...}}
text = re.sub(r'\\textit\{(https?://[^\}]+)\}', r'\\textit{\\url{\1}}', text)

# Add \urlstyle{same} just after \usepackage{xurl} or \usepackage{hyperref} 
# if not already there so URLs blend nicely like before!
if r'\urlstyle{same}' not in text:
    if r'\usepackage{xurl}' in text:
        text = text.replace(r'\usepackage{xurl}', '\\usepackage{xurl}\n\\urlstyle{same}')
    else:
        text = text.replace(r'\usepackage{hyperref}', '\\usepackage{hyperref}\n\\usepackage{xurl}\n\\urlstyle{same}')

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated URLs in main.tex')
