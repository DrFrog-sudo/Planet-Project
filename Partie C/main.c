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
    int traj_to_do;
    printf("Que voulez-vous faire?\n");
    printf("1. Calculer la trajectoire d'Euler\n");
    printf("2. Calculer la trajectoire de Runge-Kutta\n");
    printf("3. Calculer la trajectoire d'Euler Asymétrique\n");
    printf("4. Calculer les 3 trajectoires\n");
    scanf("%d",&traj_to_do);
    if(traj_to_do==1){
        trajectoire traj_terre_euler = euler_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        export_json_euler(traj_terre_euler, "terre.json");
        printf("Traj euler calcule\n");
    }
    if(traj_to_do==2){
    trajectoire traj_terre_rk4 = rk4_traj_planete(terre, soleil, 365*24*3600*nb_annee);
    export_json_rk4(traj_terre_rk4, "terre.json");
    printf("Traj rk4 calcule\n");
    }
    if(traj_to_do==3){
        trajectoire traj_terre_euler_asym = euler_asym_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        export_json_euler_asym(traj_terre_euler_asym, "terre.json");
        printf("Traj euler asym calcule\n");
    }
    if(traj_to_do==4){
        trajectoire traj_terre_euler = euler_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        printf("Traj euler calcule\n");
        trajectoire traj_terre_rk4 = rk4_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        printf("Traj rk4 calcule\n");
        trajectoire traj_terre_euler_asym = euler_asym_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        printf("Traj euler asym calcule\n");
        FILE *fichier = fopen("terre.json", "w");
        if (fichier != NULL) {
            fprintf(fichier, "{");
            
            
            fprintf(fichier, "\"%s - Euler\" : [", terre.nom);
            ecrire_points_json(fichier, traj_terre_euler);
            fprintf(fichier, "],\n");
            
            fprintf(fichier, "\"%s - RK4\" : [", terre.nom);
            ecrire_points_json(fichier, traj_terre_rk4);
            fprintf(fichier, "],\n");
            
            fprintf(fichier, "\"%s - Euler Asym\" : [", terre.nom);
            ecrire_points_json(fichier, traj_terre_euler_asym);
            fprintf(fichier, "]");
            fprintf(fichier, "}");
            fclose(fichier);
            printf("Euler puis RK4 puis Euler Asym ecrit dans terre.json\n");
        }

    }
    return 0;
}