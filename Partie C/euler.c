#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "fonction.h"

point point_suivant(point point_actuel, planete p_etudie, planete soleil){
    p_etudie.pos_vit = point_actuel;
    vect a=acceleration(p_etudie,soleil);
    vect new_vit=calcul_vitesse_future(point_actuel,a);
    vect new_pos=calcul_position_future(point_actuel,new_vit);
    point new_point;
    new_point.pos=new_pos;
    new_point.vit=new_vit;
    new_point.temps=point_actuel.temps+PasTemps;
    new_point.ep=p_energie(p_etudie,soleil,new_point);
    new_point.ec=c_energie(p_etudie,new_point);
    new_point.et=t_energie(p_etudie,soleil,new_point);
    return new_point;
}

point point_suivant_n_corps(point point_actuel, int index_p, planete *systeme_solaire, int nb_planetes){
    vect a=acceleration_n_corps(index_p,systeme_solaire,nb_planetes);
    vect new_vit=calcul_vitesse_future(point_actuel,a);
    vect new_pos=calcul_position_future(point_actuel,new_vit);
    point new_point;
    new_point.pos=new_pos;
    new_point.vit=new_vit;
    new_point.temps=point_actuel.temps+PasTemps;
    new_point.ep=p_energie_n_corps(index_p,systeme_solaire,nb_planetes);
    new_point.ec=c_energie_n_corps(index_p,systeme_solaire,nb_planetes);
    new_point.et=t_energie_n_corps(index_p,systeme_solaire,nb_planetes);
    return new_point;
}

trajectoire euler_traj_planete(planete p, planete soleil, double t_max){
    trajectoire traj;
    traj.planete=p;
    traj.nb_points=(int)(t_max/PasTemps);
    traj.tab_points=malloc(traj.nb_points*sizeof(point));
    if (traj.nb_points > 0) {
        traj.tab_points[0]=p.pos_vit;
        for(int i=1;i<traj.nb_points;i++){
            traj.tab_points[i]=point_suivant(traj.tab_points[i-1],p,soleil);
            afficher_barre_chargement(i+1, traj.nb_points, "Euler 1P");
        }
    }
    return traj;
}
traj_systeme_solaire euler_traj_systeme_solaire(planete *systeme_solaire, int nb_planetes, double t_max){
    traj_systeme_solaire traj;
    traj.nb_points=(int)(t_max/PasTemps);
    traj.nb_planetes = nb_planetes;
    traj.systeme_solaire = malloc(nb_planetes * sizeof(planete));
    //Copie des planètes du systeme_solaire 
    for(int i=0;i<nb_planetes;i++){
        traj.systeme_solaire[i]=systeme_solaire[i];
    }
    //Tab vertical(ligne planete)
    traj.tab_points=malloc(nb_planetes*sizeof(point*));
    //Tab horizontal(ligne temps)
    for(int i=0;i<nb_planetes;i++){
        traj.tab_points[i]=malloc(traj.nb_points*sizeof(point));
    }
    if (traj.nb_points > 0) {
        //Etat initial 
        for(int i=0;i<nb_planetes;i++){
            traj.tab_points[i][0]=systeme_solaire[i].pos_vit;
        }
        //Parcours temps
        for(int i=1;i<traj.nb_points;i++){
            //Parcours planete a etudier
            for(int j=0;j<nb_planetes;j++){
                traj.tab_points[j][i]=point_suivant_n_corps(traj.systeme_solaire[j].pos_vit,j,traj.systeme_solaire,nb_planetes);
            }
            //Mise a jour du systeme_solaire
            for(int j=0;j<nb_planetes;j++){
                traj.systeme_solaire[j].pos_vit=traj.tab_points[j][i];
            }
            afficher_barre_chargement(i+1, traj.nb_points, "Calcul Euler");
        }
    }
    return traj;
}
