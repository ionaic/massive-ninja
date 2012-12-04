CC=g++
GLINCL=-lglfw -lGL -lGLEW
SRC=main.cpp
DEST=main

all: $(SRC)
	$(CC) $(GLINCL) $(SRC) -o $(DEST)

clang:
	clang++ $(GLINCL) $(SRC) -o $(DEST)

debug: $(SRC)
	$(CC) -g $(GLINCL) $(SRC) -o $(DEST)

clean:
	rm $(DEST)
