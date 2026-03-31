import sys, re

def process_file(filename, tbl_type):
    out = []
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    idx = 1
    for line in lines:
        if "\\contentsline" not in line: continue
        # Example format: \contentsline {figure}{\numberline {7.1}{\ignorespaces Project Development Gantt Chart}}{33}{figure.caption.39}%
        m = re.search(r'\\numberline \{([^}]+)\}\{\\ignorespaces ([^\}]+)\}\}\{([0-9]+)\}', line)
        if not m: continue
        num = m.group(1)
        cap = m.group(2)
        page = m.group(3)
        
        # Build row
        # Sr. No. | Figure | Page
        # Combine num and cap
        cap_clean = f"{num} {cap}"
        out.append(f"{idx} & {cap_clean} & {page} \\\\ \\hline")
        idx += 1
    
    return "\n".join(out)

print("=== LOF ===")
print(process_file("main.lof", "figure"))
print("\n=== LOT ===")
print(process_file("main.lot", "table"))
