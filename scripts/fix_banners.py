import re

with open("main.tex", "r") as f:
    content = f.read()

# Update the chapterbanner definition
old_def = r"""\newcommand{\chapterbanner}[1]{%
  \clearpage
  \thispagestyle{empty}
  \vspace*{\fill}
  \begin{center}
    \begin{tikzpicture}
      \node[inner sep=0] (img) {\includegraphics[width=0.92\textwidth]{../6c901521-fcfe-4700-8635-eb6cf4a7b2f8-removebg-preview.png}};
      \node[
        text=white,
        rounded corners=2pt,
        inner xsep=10pt,
        inner ysep=4pt,
        align=center,
        font=\bfseries\fontsize{18}{20}\selectfont
      ] at (img.center) {#1};
    \end{tikzpicture}
  \end{center}
  \vspace*{\fill}
  \clearpage
}"""

new_def = r"""\newcommand{\chapterbanner}[2]{%
  \clearpage
  \thispagestyle{empty}
  \vspace*{\fill}
  \begin{center}
    \begin{tikzpicture}
      \node[inner sep=0] (img) {\includegraphics[width=0.92\textwidth]{../6c901521-fcfe-4700-8635-eb6cf4a7b2f8-removebg-preview.png}};
      \node[
        text=white,
        rounded corners=2pt,
        inner xsep=10pt,
        inner ysep=4pt,
        align=center,
        font=\bfseries\fontsize{18}{20}\selectfont
      ] at (img.center) {Chapter #1:\\ #2};
    \end{tikzpicture}
  \end{center}
  \vspace*{\fill}
  \clearpage
  \begin{center}
    {\bfseries\fontsize{18}{22}\selectfont #2}
  \end{center}
  \vspace{1.5em}
}"""

content = content.replace(old_def, new_def)

# Replace all \chapterbanner{Chapter X:\\ Y} calls
content = re.sub(r'\\chapterbanner\{Chapter (\d+):\\\\ (.*?)\}', r'\\chapterbanner{\1}{\2}', content)

with open("main.tex", "w") as f:
    f.write(content)

print("Done")
