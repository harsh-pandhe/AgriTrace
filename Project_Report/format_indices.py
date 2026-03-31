import re
import os
import subprocess

def process_index_file(filename, title, cols=["Sr. No.", "Topic", "Page No."]):
    out_rows = []
    
    if not os.path.exists(filename):
        print(f"Warning: {filename} not found.")
        return ""
        
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    idx = 1
    for line in lines:
        if "\\contentsline" not in line: continue
        
        # Determine the type of entry
        entry_type = ""
        if "{chapter}" in line: entry_type = "chapter"
        elif "{section}" in line: entry_type = "section"
        elif "{subsection}" in line: entry_type = "subsection"
        elif "{figure}" in line: entry_type = "figure"
        elif "{table}" in line: entry_type = "table"
        
        # Skip special indices themselves if they appear in TOC
        if title == "Table of Contents":
            if any(x in line for x in ["{Table of Contents}", "{Figure Index}", "{Table Index}"]):
                continue
        
        # Try multiple patterns for different types of entries
        # 1. Standard with numberline (Figures, Tables, numbered sections/chapters)
        m_num = re.search(r'\\numberline\s*\{([^}]+)\}(?:\{\\ignorespaces\s*)?([^\}]+)\}(?:\s*\})?\{([0-9ivxlcdm]+)\}', line)
        # 2. No numberline (Abstract, starred sections)
        m_no_num = re.search(r'\\contentsline\s*\{[^\}]+\}\{([^}]+)\}\{([0-9ivxlcdm]+)\}', line)
        
        cap = ""
        page = ""
        
        if m_num:
            num = m_num.group(1).strip()
            text = m_num.group(2).strip()
            page = m_num.group(3).strip()
            cap = f"{num} {text}"
        elif m_no_num:
            cap = m_no_num.group(1).strip().replace(r'\ignorespaces ', '')
            page = m_no_num.group(2).strip()
        else:
            continue
            
        # Clean up LaTeX commands in caption
        cap = cap.replace(r'\ignorespaces', '').replace(r'\textbf', '').replace('{', '').replace('}', '').strip()
        
        # Apply hierarchical formatting for TOC
        if title == "Table of Contents":
            if entry_type != "chapter":
                continue
            cap = f"\\textbf{{{cap}}}"
        
        out_rows.append(f"{idx} & {cap} & {page} \\\\ \\hline")
        idx += 1
        
    return "\n".join(out_rows)

def main():
    print("Generating indices...")
    
    # Ensure aux files are somewhat fresh (one pass)
    # subprocess.run(["pdflatex", "-interaction=batchmode", "main.tex"], check=False)
    
    toc_rows = process_index_file("main.toc", "Table of Contents")
    lof_rows = process_index_file("main.lof", "Figure Index")
    lot_rows = process_index_file("main.lot", "Table Index")
    
    if not os.path.exists("main.tex"):
        print("Error: main.tex not found.")
        return

    with open("main.tex", "r") as f:
        content = f.read()
    
    # Replace placeholders
    content = content.replace("% TOC_ROWS_PLACEHOLDER", toc_rows)
    content = content.replace("% LOF_ROWS_PLACEHOLDER", lof_rows)
    content = content.replace("% LOT_ROWS_PLACEHOLDER", lot_rows)
    
    with open("main.tex", "w") as f:
        f.write(content)
        
    print("main.tex updated with fresh indices.")

if __name__ == "__main__":
    main()
