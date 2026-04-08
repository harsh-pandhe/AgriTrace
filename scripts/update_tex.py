import re

with open('main.tex', 'r') as f:
    content = f.read()

# 1. Remove Cover Page
content = re.sub(r'% ---------- COVER PAGE ----------.*?\\end\{titlepage\}', '', content, flags=re.DOTALL)

# 2. Page numbering roman before abstract
content = content.replace(r'\pagenumbering{arabic}', r'\pagenumbering{roman}', 1)

# 3. Add arabic numbering before main report starts
report_start = r'% ============================================================' + '\n' + r'%                    MAIN REPORT'
replacement = r'\clearpage\n\pagenumbering{arabic}\n\setcounter{page}{1}\n' + report_start
content = content.replace(report_start, replacement, 1)

# 4. Format Chapter banner to have newline
content = re.sub(r'\\chapterbanner\{Chapter (\d+): (.*?)\}', r'\\chapterbanner{Chapter \1:\\\\\\\\\2}', content)

with open('main.tex', 'w') as f:
    f.write(content)
