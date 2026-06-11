#include "fonction.h"
#include <string.h>
#include <stdio.h>

int main(){
    planete soleil;
    soleil.masse=1.989e30;
    soleil.pos_vit.pos=vect_creer(0,0,0);
    soleil.pos_vit.vit=vect_creer(0,0,0);
    strcpy(soleil.nom,"Soleil");
    planete terre;
    terre.masse=5.972e24;
    terre.pos_vit.pos=vect_creer(0,149.6e9,0);
    terre.pos_vit.vit=vect_creer(29780,0,0);
    terre.pos_vit.temps=0;
    terre.pos_vit.ep=p_energie(terre,soleil,terre.pos_vit);
    terre.pos_vit.ec=c_energie(terre,terre.pos_vit);
    terre.pos_vit.et=t_energie(terre,soleil,terre.pos_vit);
    strcpy(terre.nom,"Terre");
    trajectoire traj_terre=traj_planete(terre,soleil,365*24*3600);
    printf("Traj calcule");
    export_json(traj_terre,"terre.json");
    return 0;
}