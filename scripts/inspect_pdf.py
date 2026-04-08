import PyPDF2
import sys

try:
    with open('AgriTrace_Final.pdf', 'rb') as f1:
        pdf1 = PyPDF2.PdfReader(f1)
        print("AgriTrace_Final.pdf pages:", len(pdf1.pages))
except Exception as e:
    print("Error reading AgriTrace_Final.pdf:", e)

try:
    with open('main.pdf', 'rb') as f2:
        pdf2 = PyPDF2.PdfReader(f2)
        print("main.pdf pages:", len(pdf2.pages))
except Exception as e:
    print("Error reading main.pdf:", e)
