import re

with open('main.tex', 'r', encoding='utf-8') as f:
    text = f.read()

bib_start = text.find(r'\begin{thebibliography}{99}')
if bib_start != -1:
    bib_end = text.find(r'\end{thebibliography}', bib_start)
    if bib_end != -1:
        bib_content = text[bib_start:bib_end + len(r'\end{thebibliography}')]
        
        # Change thewrapper back to enumerate
        new_bib = bib_content.replace(r'\begin{thebibliography}{99}', r'\begin{enumerate}[label={[\arabic*]}, leftmargin=*]')
        new_bib = new_bib.replace(r'\end{thebibliography}', r'\end{enumerate}')
        
        # Change \bibitem{...} back to \item. If it had \label, keep label.
        # Actually \bibitem{bib:gadde2009} was originally \item \label{bib:gadde2009}
        # Let's see how our previous script converted it.
        # It converted \item \label{X} to \bibitem{X}
        # So \bibitem{X} -> \item \label{X} ONLY if X is not 'bib1', 'bib2', etc.
        def repl_bibitem(m):
            key = m.group(1)
            if key.startswith('bib') and key[3:].isdigit():
                return r'\item'
            else:
                return r'\item \label{' + key + '}'
                
        new_bib = re.sub(r'\\bibitem\{([^}]+)\}', repl_bibitem, new_bib)
        
        text = text[:bib_start] + new_bib + text[bib_end + len(r'\end{thebibliography}'):]
        
        with open('main.tex', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Successfully restored and fixed enumerate bibliography.')
    else:
        print('Could not find end of thebibliography')
else:
    print('Could not find thebibliography section')
