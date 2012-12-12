FNAME=report

all: $(FNAME).bbl $(FNAME).tex
	pdflatex $(FNAME).tex

$(FNAME).aux:
	pdflatex $(FNAME).tex

$(FNAME).bbl: $(FNAME).aux
	bibtex $(FNAME).aux
	bibtex $(FNAME).aux
	pdflatex $(FNAME).tex
	bibtex $(FNAME).aux
