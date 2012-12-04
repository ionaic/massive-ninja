CC=g++
GLINCL=-lglfw -lGL -lGLEW
SRC=main.cpp

all: SRC
	$(CC) $(GLINCL) $(SRC)

debug: SRC
	$(CC) -g $(GLINCL) $(SRC)
