#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "fonction.h"

point point_suivant_euler_asym(point point_actuel, planete p_etudie, planete soleil){
    p_etudie.pos_vit = point_actuel;
    
    vect new_pos=calcul_position_future(point_actuel,point_actuel.vit);
    p_etudie.pos_vit.pos=new_pos;
    vect a=acceleration(p_etudie,soleil);
    vect new_vit=calcul_vitesse_future(point_actuel,a);

    point new_point;
    new_point.pos=new_pos;
    new_point.vit=new_vit;
    new_point.temps=point_actuel.temps+PasTemps;
    new_point.ep=p_energie(p_etudie,soleil,new_point);
    new_point.ec=c_energie(p_etudie,new_point);
    new_point.et=t_energie(p_etudie,soleil,new_point);
    return new_point;
}

trajectoire euler_asym_traj_planete(planete p, planete soleil, int t_max){
    trajectoire traj;
    traj.planete=p;
    traj.nb_points=t_max/PasTemps;
    traj.tab_points=malloc(traj.nb_points*sizeof(point));
    if (traj.nb_points > 0) {
        traj.tab_points[0]=p.pos_vit;
        for(int i=1;i<traj.nb_points;i++){
            traj.tab_points[i]=point_suivant_euler_asym(traj.tab_points[i-1],p,soleil);
        }
    }
    return traj;
}

void export_json_euler_asym(trajectoire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier,"{\"%s - Euler Asym\" : [\n",traj.planete.nom);
    ecrire_points_json(fichier, traj);
    fprintf(fichier,"]}");
    fclose(fichier);
}

// ------ N-Corps ------

point point_suivant_euler_asym_n_corps(point point_actuel, int index_p, planete systeme_solaire[4], int nb_planetes){
    // Calcul nouvelle po
    
    // Calcul nouvelle po
    vect new_pos=calcul_position_future(point_actuel,point_actuel.vit);
    
    planete sys_temp[4];
    for(int i=0; i<nb_planetes; i++) sys_temp[i] = systeme_solaire[i];
    sys_temp[index_p].pos_vit.pos = new_pos;
    
    vect a=acceleration_n_corps(index_p,sys_temp,nb_planetes);
    
    // 2. Calcul de la nouvelle vitesse avec la nouvelle position
    vect new_vit=calcul_vitesse_future(point_actuel,a);
    
    point new_point;
    new_point.pos=new_pos;
    new_point.vit=new_vit;
    new_point.temps=point_actuel.temps+PasTemps;
    new_point.ep=p_energie_n_corps(index_p,sys_temp,nb_planetes);
    new_point.ec=c_energie_n_corps(index_p,sys_temp,nb_planetes);
    new_point.et=t_energie_n_corps(index_p,sys_temp,nb_planetes);
    return new_point;
}

traj_systeme_solaire euler_asym_traj_systeme_solaire(planete systeme_solaire[4], int nb_planetes, int t_max){
    traj_systeme_solaire traj;
    traj.nb_points=t_max/PasTemps;
    
    for(int i=0;i<nb_planetes;i++){
        traj.systeme_solaire[i]=systeme_solaire[i];
    }
    
    traj.tab_points=malloc(nb_planetes*sizeof(point*));
    for(int i=0;i<nb_planetes;i++){
        traj.tab_points[i]=malloc(traj.nb_points*sizeof(point));
    }
    
    if (traj.nb_points > 0) {
        for(int i=0;i<nb_planetes;i++){
            traj.tab_points[i][0]=systeme_solaire[i].pos_vit;
        }
        
        for(int i=1;i<traj.nb_points;i++){
            for(int j=0;j<nb_planetes;j++){
                traj.tab_points[j][i]=point_suivant_euler_asym_n_corps(traj.systeme_solaire[j].pos_vit,j,traj.systeme_solaire,nb_planetes);
            }
            for(int j=0;j<nb_planetes;j++){
                traj.systeme_solaire[j].pos_vit=traj.tab_points[j][i];
            }
        }
    }
    return traj;
}

void export_json_euler_asym_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier, "{\n");
    ecrire_systeme_json(fichier, traj, "Euler Asym", 1);
    fprintf(fichier, "}\n");
    fclose(fichier);
}

