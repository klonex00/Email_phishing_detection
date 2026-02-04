# IEEE Research Paper Compilation Guide

## Paper Title
**Email Guard: An Advanced Multi-Layer Phishing Detection System with Explainable AI**

## Authors
1. Amrutiya Urvish (1RV22IS006) - Information Science & Engineering
2. Dhruv Loriya (1RV22CS046) - Computer Science & Engineering  
3. Govinda NB (1RV22CS059) - Computer Science & Engineering
4. Khush Loriya (1RV22CS083) - Computer Science & Engineering
5. Shriniwas Maheshwari (1RV22CS194) - Computer Science & Engineering
6. Minal Moharir - Computer Science & Engineering (Cyber Security)

**Institution**: RV College of Engineering, Bengaluru, India

---

## Installation Requirements

### macOS
```bash
# Install MacTeX (full LaTeX distribution)
brew install --cask mactex

# Or install BasicTeX (smaller, minimal distribution)
brew install --cask basictex

# After installation, update PATH
export PATH="/Library/TeX/texbin:$PATH"
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install texlive-full
```

### Windows
Download and install MiKTeX from: https://miktex.org/download

---

## Compilation Steps

### Method 1: Command Line (Recommended)
```bash
# Navigate to the paper directory
cd /Users/dhruvloriya/Desktop/email-guard/Conference-LaTeX-template_10-17-19/

# First compilation (generates aux files)
pdflatex EmailGuard_Research_Paper.tex

# Second compilation (resolves references)
bibtex EmailGuard_Research_Paper

# Third compilation (updates cross-references)
pdflatex EmailGuard_Research_Paper.tex

# Fourth compilation (finalizes document)
pdflatex EmailGuard_Research_Paper.tex
```

### Method 2: Using Overleaf (Online, No Installation)
1. Go to https://www.overleaf.com/
2. Create a free account
3. Click "New Project" → "Upload Project"
4. Upload `EmailGuard_Research_Paper.tex` and `IEEEtran.cls`
5. Click "Recompile" to generate PDF

### Method 3: Using TeXShop (macOS)
1. Install MacTeX (includes TeXShop)
2. Open `EmailGuard_Research_Paper.tex` in TeXShop
3. Select "pdflatex" from the dropdown
4. Click "Typeset" button

### Method 4: Using Visual Studio Code
1. Install VS Code LaTeX Workshop extension
2. Open `EmailGuard_Research_Paper.tex`
3. Press `Ctrl+Alt+B` (Windows/Linux) or `Cmd+Option+B` (macOS)

---

## Quick Compilation Script

Create a file `compile.sh`:

```bash
#!/bin/bash
echo "Compiling IEEE Research Paper..."
pdflatex -interaction=nonstopmode EmailGuard_Research_Paper.tex
bibtex EmailGuard_Research_Paper
pdflatex -interaction=nonstopmode EmailGuard_Research_Paper.tex
pdflatex -interaction=nonstopmode EmailGuard_Research_Paper.tex
echo "Compilation complete! PDF: EmailGuard_Research_Paper.pdf"
```

Make it executable:
```bash
chmod +x compile.sh
./compile.sh
```

---

## Paper Structure

### Sections (IEEE Conference Format)
1. **Abstract** (250 words) - Problem, method, results
2. **Introduction** (2 pages)
   - Background and motivation
   - Research gap
   - Contributions
   - Paper organization
3. **Related Work** (1.5 pages)
   - Traditional phishing detection
   - Machine learning approaches
   - Deep learning methods
   - Unicode and homograph detection
   - URL obfuscation detection
   - Explainable AI in cybersecurity
4. **System Architecture and Methodology** (3 pages)
   - Overall system design (with flowchart)
   - Layer 1: Unicode Homograph Detection (with equations)
   - Layer 2: URL Obfuscation Detection (15+ techniques)
   - Layer 3: Explainable Attachment Triage
   - Layer 4: Text Analysis with DistilBERT
   - Layer 5: URL Feature Extraction
   - Layer 6: Fusion Model
   - Explainability framework
5. **Experimental Evaluation** (1 page)
   - Dataset construction (500 emails)
   - Evaluation metrics (accuracy, precision, recall, F1)
   - Baseline systems (Rspamd, SpamAssassin, PhishBERT)
   - Implementation details
6. **Results and Analysis** (2 pages)
   - Overall performance comparison (Table I)
   - Novel layer performance (Table II)
   - Ablation study (Table III)
   - Latency analysis (Table IV)
   - False positive rate (Table V)
   - User study on explainability (Table VI)
   - Confusion matrix (Figure 2)
   - ROC curve (Figure 3)
7. **Discussion** (1 page)
   - Key achievements
   - Novel contributions validation
   - Comparison with state-of-the-art
   - Limitations
   - Ethical considerations
8. **Future Work** (0.5 pages)
   - Technical extensions
   - Deployment considerations
   - Research directions
9. **Conclusion** (0.5 pages)
   - Summary of contributions
   - Key results
   - Impact statement
10. **References** (17 citations)
    - Recent papers from 2023-2024
    - IEEE, Springer, ACM sources
    - Industry reports (APWG, FBI)

---

## Key Features of the Paper

### Mathematical Formulations
- **Equation 1**: Homograph detection score (combines confusables, mixed-script, punycode)
- **Equation 2**: Confusables detection function
- **Equation 3**: Mixed-script analysis
- **Equation 4**: Punycode normalization
- **Equation 5**: URL obfuscation composite score
- **Equation 6**: IP address obfuscation detection
- **Equation 7**: Zero-width character detection
- **Equation 8**: Attachment risk scoring
- **Equation 9**: Extension risk classification
- **Equation 10**: DistilBERT semantic embedding
- **Equation 11**: Text phishing probability
- **Equation 12**: URL phishing probability
- **Equation 13**: Fusion model (logistic regression)
- **Equation 14**: Decision threshold
- **Equation 15**: Confidence score generation
- **Equation 16**: Explanation aggregation
- **Equations 17-20**: Standard evaluation metrics

### Figures and Diagrams
- **Figure 1**: Six-layer system architecture (TikZ flowchart)
- **Figure 2**: Confusion matrix (500 test emails)
- **Figure 3**: ROC curve (AUC = 0.987)

### Tables
- **Table I**: Overall performance comparison (4 systems)
- **Table II**: Novel layer detection rates
- **Table III**: Ablation study results
- **Table IV**: Component latency breakdown
- **Table V**: False positive rate comparison
- **Table VI**: User study results (n=50)

### Citations
17 references from recent years (2019-2024):
1. APWG 2024 report
2. FBI 2024 cybercrime report
3. Oest et al. 2024 (USENIX Security) - PhishTime
4. Hannigan et al. 2021 (IEEE S&P) - Unicode security
5. Marchal et al. 2020 (IEEE TNSM) - PhishStorm
6. Ferreira et al. 2024 (CHI) - Social engineering
7. Jain et al. 2023 (Computers & Security) - Deep learning
8. Kumar et al. 2024 (Expert Systems) - Ensemble ML
9. Han et al. 2023 (Computers & Security) - Homograph
10. Ribeiro et al. 2024 (CACM) - LIME interpretability
11. Basnet et al. 2024 (Springer) - Feature selection
12. SpamAssassin 2023 documentation
13. Rspamd 2024 documentation
14. Yang et al. 2023 (IEEE Access) - PhishBERT
15. Zhang et al. 2024 (IEEE TDSC) - PhishTransformer
16. Slack et al. 2024 (AAAI) - Adversarial explanations
17. Sanh et al. 2019 (arXiv) - DistilBERT

---

## Key Results Highlighted

### Performance Metrics
- **Accuracy**: 94.2% (vs 75.3% Rspamd, 72.1% SpamAssassin)
- **Precision**: 93.8%
- **Recall**: 94.6%
- **F1-Score**: 94.2%
- **False Positive Rate**: 5.4% (vs 12.3% Rspamd, 15.2% SpamAssassin)
- **Latency**: 0.23 seconds per email (5× faster than baselines)

### Novel Layer Performance
- **Homograph Detection**: 92% accuracy (+163% improvement)
- **Zero-Width Detection**: 88% accuracy (+110% improvement)
- **IP Obfuscation**: 91% accuracy (+90% improvement)
- **Attachment Triage**: 89% accuracy (+20% improvement)

### Ablation Study
- Full system: 94.2%
- Without homograph: 87.3% (-6.9%)
- Without obfuscation: 89.1% (-5.1%)
- Without attachment: 91.5% (-2.7%)
- Novel layers contribute: **12% accuracy improvement**

### User Study (n=50)
- 92% found explanations helpful
- 88% understood flagging reasons
- 15% reduction in false positive complaints
- 4.2/5 satisfaction rating

---

## Troubleshooting

### Common Errors

**Error**: `! LaTeX Error: File 'IEEEtran.cls' not found.`
**Solution**: Ensure `IEEEtran.cls` is in the same directory as the .tex file.

**Error**: `! LaTeX Error: Environment tikzpicture undefined.`
**Solution**: Install tikz package: `sudo apt-get install texlive-pictures` (Linux) or included in MacTeX/MiKTeX.

**Error**: References not showing
**Solution**: Run bibtex after first pdflatex compilation, then run pdflatex twice more.

**Error**: Figures not appearing
**Solution**: Compile at least twice to resolve cross-references.

---

## Submission Guidelines

### IEEE Conference Format Checklist
- ✅ Two-column format (IEEEtran class)
- ✅ 10pt font size
- ✅ Letter size (8.5" x 11") pages
- ✅ 6-8 pages recommended for conference
- ✅ Abstract: 150-250 words
- ✅ Keywords: 5-8 terms
- ✅ References: IEEE citation style
- ✅ Figures: Vector graphics (TikZ) preferred
- ✅ Tables: Booktabs style for professional appearance
- ✅ Math equations: Numbered consecutively
- ✅ Sections: Numbered using Arabic numerals

### File Checklist
- ✅ `EmailGuard_Research_Paper.tex` - Main paper file
- ✅ `IEEEtran.cls` - IEEE template class
- ✅ `EmailGuard_Research_Paper.pdf` - Generated PDF (after compilation)
- ✅ `EmailGuard_Research_Paper.bbl` - Bibliography (after bibtex)
- ✅ `EmailGuard_Research_Paper.aux` - Auxiliary file

---

## Contact Information

For questions about the paper:
- **Primary Contact**: Dhruv Loriya (dhruvloriya.cs22@rvce.edu.in)
- **Advisor**: Dr. Minal Moharir (RV College of Engineering)

---

## License
This research paper is submitted for academic review and publication. All rights reserved by the authors and RV College of Engineering.

---

**Last Updated**: December 10, 2025
**Paper Version**: 1.0 (Final Draft)
**Word Count**: ~6,500 words (including references)
**Page Count**: 8 pages (IEEE two-column format)
