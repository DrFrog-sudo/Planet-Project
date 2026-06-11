#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "fonction.h"

point rk4_suivant(point point_actuel, planete p_etudie, planete soleil) {
    p_etudie.pos_vit = point_actuel;
    point new_point;
    vect k1r, k1v;
    vect k2r, k2v;
    vect k3r, k3v;
    vect k4r, k4v;
    k1r = mul_scalaire(point_actuel.vit, PasTemps);
    k1v = mul_scalaire(acceleration(p_etudie, soleil), PasTemps);
    k2r = mul_scalaire(add_vect(point_actuel.vit, div_scalaire(k1v, 2)), PasTemps);
    // Clone
    planete p_virtuelle = p_etudie; 
    //PositionK2
    p_virtuelle.pos_vit.pos = add_vect(point_actuel.pos, div_scalaire(k1r, 2));
    //Calcule acceleration
    k2v = mul_scalaire(acceleration(p_virtuelle, soleil), PasTemps);
    
    k3r = mul_scalaire(add_vect(point_actuel.vit, div_scalaire(k2v, 2)), PasTemps);
    p_virtuelle.pos_vit.pos = add_vect(point_actuel.pos, div_scalaire(k2r, 2));
    k3v = mul_scalaire(acceleration(p_virtuelle, soleil), PasTemps);
    
    k4r = mul_scalaire(add_vect(point_actuel.vit, k3v), PasTemps);
    p_virtuelle.pos_vit.pos = add_vect(point_actuel.pos, k3r);
    k4v = mul_scalaire(acceleration(p_virtuelle, soleil), PasTemps);
    
    vect pos_add=add_vect(k1r, add_vect(mul_scalaire(k2r, 2), add_vect(mul_scalaire(k3r, 2), k4r)));
    new_point.pos = add_vect(point_actuel.pos, div_scalaire(pos_add, 6));
    vect vit_add=add_vect(k1v, add_vect(mul_scalaire(k2v, 2), add_vect(mul_scalaire(k3v, 2), k4v)));
    new_point.vit = add_vect(point_actuel.vit, div_scalaire(vit_add, 6));
    new_point.temps = point_actuel.temps + PasTemps;
    new_point.ep=p_energie(p_etudie,soleil,new_point);
    new_point.ec=c_energie(p_etudie,new_point);
    new_point.et=t_energie(p_etudie,soleil,new_point);
    return new_point;
}

trajectoire rk4_traj_planete(planete p, planete soleil, int t_max) {
    trajectoire traj;
    traj.planete = p;
    traj.nb_points = t_max / PasTemps;
    traj.tab_points = malloc(traj.nb_points * sizeof(point));
    
    if (traj.nb_points > 0) {
        traj.tab_points[0] = p.pos_vit;
        for (int i = 1; i < traj.nb_points; i++) {
            traj.tab_points[i] = rk4_suivant(traj.tab_points[i-1], p, soleil);
        }
    }
    return traj;
}

void export_json_rk4(trajectoire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier,"{\" %s - RK4\" : [",traj.planete.nom);
    for(int i=0;i<traj.nb_points;i++){
        fprintf(fichier,"[");
        //Print position
        fprintf(fichier,"[%f,%f,%f],",traj.tab_points[i].pos.x,traj.tab_points[i].pos.y,traj.tab_points[i].pos.z);
        //Print vitesse
        fprintf(fichier,"[%f,%f,%f],",traj.tab_points[i].vit.x,traj.tab_points[i].vit.y,traj.tab_points[i].vit.z);
        //Print temps
        fprintf(fichier,"%d",traj.tab_points[i].temps);
        //Print energie cinetique
        fprintf(fichier,",%f",traj.tab_points[i].ec);
        //Print energie potentielle
        fprintf(fichier,",%f",traj.tab_points[i].ep);
        //Print energie totale
        fprintf(fichier,",%f",traj.tab_points[i].et);
        fprintf(fichier,"]\n");
        if(i < traj.nb_points - 1) {
            fprintf(fichier,",");
        }
    }
    
    fprintf(fichier,"]}");
    fclose(fichier);
}


