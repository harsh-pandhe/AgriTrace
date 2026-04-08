import sys, re

def process_file(filename):
    out = []
    try:
        with open(filename, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        return ""
    
    idx = 1
    for line in lines:
        if "\\contentsline" not in line: continue
        # Example format: \contentsline {figure}{\numberline {7.1}{\ignorespaces Project Development Gantt Chart}}{33}{figure.caption.39}%
        m = re.search(r'\\numberline \{([^}]+)\}\{\\ignorespaces ([^\}]+)\}\}\{([0-9]+)\}', line)
        if not m:
            # Maybe there is no \numberline, just text
            m2 = re.search(r'\\contentsline \{[a-z]+\}\{(.*?)\}\{([0-9]+)\}', line)
            if m2:
                cap = m2.group(1).replace(r'\ignorespaces ', '')
                page = m2.group(2)
                out.append(f"{idx} & {cap} & {page} \\\\ \\hline")
                idx += 1
            continue
            
        num = m.group(1)
        cap = m.group(2)
        page = m.group(3)
        
        cap_clean = f"{num} {cap}"
        out.append(f"{idx} & {cap_clean} & {page} \\\\ \\hline")
        idx += 1
    
    return "\n".join(out)

print("=== LOF ===")
print(process_file("Project_Report/main.lof"))
print("\n=== LOT ===")
print(process_file("Project_Report/main.lot"))
