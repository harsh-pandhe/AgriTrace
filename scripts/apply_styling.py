import re

with open('main.tex', 'r') as f:
    text = f.read()

# 1. Header alignments
text = text.replace(r'\fancyhead[C]{\textbf{AgriTrace', r'\fancyhead[L]{\textbf{AgriTrace')

# Footer alignments
text = text.replace(r'\fancyfoot[C]{\textbf{SPM', r'\fancyfoot[R]{\textbf{SPM')
text = text.replace(r'\fancyfoot[R]{\thepage}', r'\fancyfoot[C]{\thepage}')

# 2. Update chapter background image
text = text.replace(r'{images/chapter-front.jpeg}', r'{../6c901521-fcfe-4700-8635-eb6cf4a7b2f8-removebg-preview.png}')

# 3. Remove background from indices
def plain_title(match):
    title = match.group(1)
    if title in ["Table of Contents", "Figure Index", "Table Index"]:
        return r"\clearpage\vspace*{2cm}\begin{center}\textbf{\fontsize{18}{20}\selectfont " + title + r"}\end{center}\vspace{1cm}"
    return match.group(0)

text = re.sub(r'\\chapterbanner\{([^}]+)\}', plain_title, text)

with open('main.tex', 'w') as f:
    f.write(text)
