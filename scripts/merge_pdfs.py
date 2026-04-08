import PyPDF2
import os

base_dir = r"d:\GitHub\Work\AgriTrace\Project_Report"
# Order specified by the user
files_to_merge = [
    "Agri.pdf",
    "IRJMETS80400041533.pdf",
    "IRJMETS80400041533-1.pdf",
    "IRJMETS80400041533-2.pdf",
    "IRJMETS80400041533-3.pdf",
    "IRJMETS80400041533-4.pdf",
    "IRJMETS80400041533-5.pdf"
]

merger = PyPDF2.PdfMerger()

print("Merging PDFs...")
for file in files_to_merge:
    path = os.path.join(base_dir, file)
    if os.path.exists(path):
        print(f"Adding {file}")
        merger.append(path)
    else:
        print(f"Warning: Could not find {file}")

output_path = os.path.join(base_dir, "final.pdf")
print(f"\nWriting output to {output_path}...")
merger.write(output_path)
merger.close()
print("Done!")
