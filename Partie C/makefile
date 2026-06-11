programme.exe: main.o fonction.o
	gcc main.o fonction.o -o programme.exe -lm

main.o: main.c fonction.h
	gcc -Wall -c main.c

fonction.o: fonction.c fonction.h
	gcc -Wall -c fonction.c

clean:
	rm programme.exe *.o
