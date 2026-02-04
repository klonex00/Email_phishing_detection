# Formatting Changes Summary

## Date: December 10, 2025

### Changes Applied

#### 1. Author Formatting
- **Removed**: All email addresses from author block
- **Removed**: Italic formatting (`\textit{}`) from all author names
- **Changed**: "&" to "and" between co-authors
- **Format**: All authors now listed in plain text format
- **Institution**: Added ® symbol for RV College of Engineering

#### 2. Content Structure: Lists to Paragraphs
**Converted ALL bullet points and numbered lists to flowing paragraph format**

**Total Sections Converted: 14**

##### Introduction Section (3 conversions)
- Evasion techniques (3 items) → Single paragraph
- Research gaps (4 items) → Paragraph with "First, Second, Third, Fourth" structure
- Contributions (4 items) → Flowing paragraph

##### Methodology Section (2 conversions)
- Layer 5 URL features (5 items) → Integrated paragraph
- URL Feature Extraction key features (5 items) → Single paragraph

##### Experimental Evaluation Section (3 conversions)
- Dataset Construction (2 items) → Single paragraph about phishing/legitimate sources
- Baseline Systems (3 items) → Paragraph describing systems
- Implementation Details (5 items) → Comprehensive paragraph

##### Results Section (4 conversions)
- Baseline comparison findings (3 items) → Single sentence with percentages
- User Study findings (3 items) → Paragraph about valued features
- Ablation Study findings (3 items) → Paragraph about contributions
- Confusion matrix analysis (4 items) → Paragraph describing TP/TN/FP/FN

##### Discussion Section (5 conversions)
- Key Achievements (4 items) → Comprehensive paragraph with "First, Second, Third, Fourth"
- PhishBERT comparison (3 items) → Paragraph about improvements
- Novel Contributions Validation (3 items) → Paragraph with percentages
- Limitations (5 items) → Comprehensive paragraph covering all limitations
- Ethical Considerations (3 items) → Paragraph addressing privacy, FPR, transparency

##### Future Work Section (3 conversions)
- Technical Extensions (5 items) → Paragraph with "First, Second, Third, Fourth, Fifth"
- Deployment Considerations (4 items) → Paragraph about enterprise needs
- Research Directions (3 items) → Paragraph about promising directions

##### Conclusion Section (1 conversion)
- Key contributions (4 items) → Single sentence listing all contributions

### Verification
✅ **All list environments removed**: 0 instances of `\begin{itemize}` or `\begin{enumerate}` remain
✅ **Paper structure preserved**: All sections, equations, figures, tables intact
✅ **Citations maintained**: All 17 references properly cited
✅ **Line count**: Reduced from 805 to 689 lines (14% reduction through consolidation)

### Updated Deliverable
- **File**: `EmailGuard_IEEE_Paper_Overleaf.zip`
- **Size**: 95 KB
- **Contents**: Updated .tex file + IEEEtran.cls + 4 documentation files
- **Status**: Ready for Overleaf upload and compilation

### Paper Statistics
- **Format**: IEEE Conference two-column
- **Pages**: 8
- **Equations**: 20
- **Figures**: 3 (TikZ diagrams)
- **Tables**: 6
- **References**: 17 (2019-2024)
- **Authors**: 6 (plain format, no emails)
- **Content Style**: 100% paragraph format (no bullet points)
