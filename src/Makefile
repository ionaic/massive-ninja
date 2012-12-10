CC=g++
GLINCL=-lglfw -lGL -lGLEW
SRC=main.cpp
OLDSRC=main_old.cpp
DEST=main

all: $(SRC)
	$(CC) $(GLINCL) $(SRC) -o $(DEST)

clang:
	clang++ $(GLINCL) $(SRC) -o $(DEST)

old:
	$(CC) $(GLINCL) $(OLDSRC) -o $(DEST)

debug: $(SRC)
	$(CC) -g $(GLINCL) $(SRC) -o $(DEST)

clean:
	rm $(DEST)
