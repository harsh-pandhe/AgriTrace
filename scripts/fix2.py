import re

with open('main.tex', 'r', encoding='utf-8') as f:
    text = f.read()

bib_start = text.find(r'\begin{enumerate}[label={[\arabic*]}, leftmargin=*]')
if bib_start == -1:
    bib_start = text.find(r'\begin{enumerate}')

bib_end = text.find(r'\end{enumerate}', bib_start)

if bib_start != -1 and bib_end != -1:
    bib_content = text[bib_start:bib_end+15]
    
    # Replace the wrapper
    new_bib = re.sub(r'\\begin\{enumerate\}.*?\n', r'\\begin{thebibliography}{99}\n', bib_content)
    new_bib = new_bib.replace(r'\end{enumerate}', r'\end{thebibliography}')
    
    # Replace \item \label{...} with \bibitem{...}
    def repl_label(m):
        return r'\bibitem{' + m.group(1) + '}'
    new_bib = re.sub(r'\\item\s*\\label\{([^}]+)\}', repl_label, new_bib)
    
    # Replace remaining \item with \bibitem{bibN}
    count = 1
    def repl_item(m):
        global count
        res = r'\bibitem{bib' + str(count) + '}'
        count += 1
        return res
    new_bib = re.sub(r'\\item(?!\s*\[)', repl_item, new_bib)
    
    text = text[:bib_start] + new_bib + text[bib_end+15:]
    
    with open('main.tex', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Generated updated main.tex')
else:
    print('Could not find enumerate environment for bibliography')
