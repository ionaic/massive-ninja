CC=g++
GLINCL=-lglfw -lGL -lGLEW
SRC=main.cpp

all:
	$(CC) $(GLINCL) $(SRC)

debug:
	$(CC) -g $(GLINCL) $(SRC)
