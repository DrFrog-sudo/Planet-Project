programme.exe: main.o fonction.o euler.o rungekuta.o euler_asym.o
	gcc main.o fonction.o euler.o rungekuta.o euler_asym.o -o programme.exe -lm

main.o: main.c fonction.h
	gcc -Wall -c main.c

fonction.o: fonction.c fonction.h
	gcc -Wall -c fonction.c

euler.o: euler.c fonction.h
	gcc -Wall -c euler.c

rungekuta.o: rungekuta.c fonction.h
	gcc -Wall -c rungekuta.c

euler_asym.o: euler_asym.c fonction.h
	gcc -Wall -c euler_asym.c

clean:
	rm programme.exe *.o
