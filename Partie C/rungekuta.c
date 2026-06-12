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

trajectoire rk4_traj_planete(planete p, planete soleil, double t_max) {
    trajectoire traj;
    traj.planete = p;
    traj.nb_points = (int)(t_max / PasTemps);
    traj.tab_points = malloc(traj.nb_points * sizeof(point));
    
    if (traj.nb_points > 0) {
        traj.tab_points[0] = p.pos_vit;
        for (int i = 1; i < traj.nb_points; i++) {
            traj.tab_points[i] = rk4_suivant(traj.tab_points[i-1], p, soleil);
            afficher_barre_chargement(i+1, traj.nb_points, "Calcul RK4 1P");
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
    ecrire_points_json(fichier, traj);
    fprintf(fichier,"]}");
    fclose(fichier);
}

// ------ N-Corps ------

traj_systeme_solaire rk4_traj_systeme_solaire(planete *systeme_solaire, int nb_planetes, double t_max) {
    traj_systeme_solaire traj;
    traj.nb_points = (int)(t_max / PasTemps);
    traj.nb_planetes = nb_planetes;
    traj.systeme_solaire = malloc(nb_planetes * sizeof(planete));
    
    for(int i=0;i<nb_planetes;i++){
        traj.systeme_solaire[i]=systeme_solaire[i];
    }
    
    traj.tab_points = malloc(nb_planetes * sizeof(point*));
    for(int i=0;i<nb_planetes;i++){
        traj.tab_points[i] = malloc(traj.nb_points * sizeof(point));
    }
    
    if (traj.nb_points > 0) {
        for(int i=0;i<nb_planetes;i++){
            traj.tab_points[i][0] = systeme_solaire[i].pos_vit;
        }
        
        // Tableaux pour stocker les k
        vect *k1r = malloc(nb_planetes * sizeof(vect));
        vect *k1v = malloc(nb_planetes * sizeof(vect));
        vect *k2r = malloc(nb_planetes * sizeof(vect));
        vect *k2v = malloc(nb_planetes * sizeof(vect));
        vect *k3r = malloc(nb_planetes * sizeof(vect));
        vect *k3v = malloc(nb_planetes * sizeof(vect));
        vect *k4r = malloc(nb_planetes * sizeof(vect));
        vect *k4v = malloc(nb_planetes * sizeof(vect));
        planete *sys_temp = malloc(nb_planetes * sizeof(planete));
        
        for (int i = 1; i < traj.nb_points; i++) {
            
            // --- K1 ---
            for(int j=0; j<nb_planetes; j++){
                k1r[j] = mul_scalaire(traj.systeme_solaire[j].pos_vit.vit, PasTemps);
                k1v[j] = mul_scalaire(acceleration_n_corps(j, traj.systeme_solaire, nb_planetes), PasTemps);
            }
            
            // --- K2 ---
            for(int j=0; j<nb_planetes; j++){
                sys_temp[j] = traj.systeme_solaire[j];
                sys_temp[j].pos_vit.pos = add_vect(traj.systeme_solaire[j].pos_vit.pos, div_scalaire(k1r[j], 2));
                sys_temp[j].pos_vit.vit = add_vect(traj.systeme_solaire[j].pos_vit.vit, div_scalaire(k1v[j], 2));
            }
            for(int j=0; j<nb_planetes; j++){
                k2r[j] = mul_scalaire(sys_temp[j].pos_vit.vit, PasTemps);
                k2v[j] = mul_scalaire(acceleration_n_corps(j, sys_temp, nb_planetes), PasTemps);
            }
            
            // --- K3 --- 
            for(int j=0; j<nb_planetes; j++){
                sys_temp[j] = traj.systeme_solaire[j];
                sys_temp[j].pos_vit.pos = add_vect(traj.systeme_solaire[j].pos_vit.pos, div_scalaire(k2r[j], 2));
                sys_temp[j].pos_vit.vit = add_vect(traj.systeme_solaire[j].pos_vit.vit, div_scalaire(k2v[j], 2));
            }
            for(int j=0; j<nb_planetes; j++){
                k3r[j] = mul_scalaire(sys_temp[j].pos_vit.vit, PasTemps);
                k3v[j] = mul_scalaire(acceleration_n_corps(j, sys_temp, nb_planetes), PasTemps);
            }
            
            // --- K4 ---
            for(int j=0; j<nb_planetes; j++){
                sys_temp[j] = traj.systeme_solaire[j];
                sys_temp[j].pos_vit.pos = add_vect(traj.systeme_solaire[j].pos_vit.pos, k3r[j]);
                sys_temp[j].pos_vit.vit = add_vect(traj.systeme_solaire[j].pos_vit.vit, k3v[j]);
            }
            for(int j=0; j<nb_planetes; j++){
                k4r[j] = mul_scalaire(sys_temp[j].pos_vit.vit, PasTemps);
                k4v[j] = mul_scalaire(acceleration_n_corps(j, sys_temp, nb_planetes), PasTemps);
            }
            
            // --- Final Update ---
            for(int j=0; j<nb_planetes; j++){
                vect pos_add = add_vect(k1r[j], add_vect(mul_scalaire(k2r[j], 2), add_vect(mul_scalaire(k3r[j], 2), k4r[j])));
                vect vit_add = add_vect(k1v[j], add_vect(mul_scalaire(k2v[j], 2), add_vect(mul_scalaire(k3v[j], 2), k4v[j])));
                
                point new_point;
                new_point.pos = add_vect(traj.systeme_solaire[j].pos_vit.pos, div_scalaire(pos_add, 6));
                new_point.vit = add_vect(traj.systeme_solaire[j].pos_vit.vit, div_scalaire(vit_add, 6));
                new_point.temps = traj.systeme_solaire[j].pos_vit.temps + PasTemps;
                
                // Mettre à jour dans le tableau
                traj.tab_points[j][i] = new_point;
            }
            
            // Mettre à jour systeme_solaire et calculer les energies avec les nouvelles positions
            for(int j=0; j<nb_planetes; j++){
                traj.systeme_solaire[j].pos_vit = traj.tab_points[j][i];
            }
            for(int j=0; j<nb_planetes; j++){
                traj.tab_points[j][i].ep = p_energie_n_corps(j, traj.systeme_solaire, nb_planetes);
                traj.tab_points[j][i].ec = c_energie_n_corps(j, traj.systeme_solaire, nb_planetes);
                traj.tab_points[j][i].et = t_energie_n_corps(j, traj.systeme_solaire, nb_planetes);
                // Mise à jour de l'énergie dans sys
                traj.systeme_solaire[j].pos_vit.ep = traj.tab_points[j][i].ep;
                traj.systeme_solaire[j].pos_vit.ec = traj.tab_points[j][i].ec;
                traj.systeme_solaire[j].pos_vit.et = traj.tab_points[j][i].et;
            }
            afficher_barre_chargement(i+1, traj.nb_points, "Calcul RK4");
        }
        free(k1r); free(k1v);
        free(k2r); free(k2v);
        free(k3r); free(k3v);
        free(k4r); free(k4v);
        free(sys_temp);
    }
    return traj;
}

void export_json_rk4_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier, "{\n");
    ecrire_systeme_json(fichier, traj, "RK4", 1);
    fprintf(fichier, "}\n");
    fclose(fichier);
}

