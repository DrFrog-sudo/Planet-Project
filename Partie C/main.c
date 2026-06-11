#include "fonction.h"
#include <string.h>
#include <stdio.h>

int main(){
    //soleil
    planete soleil;
    soleil.masse=1.989e30;
    soleil.pos_vit.pos=vect_creer(0,0,0);
    soleil.pos_vit.vit=vect_creer(0,0,0);
    strcpy(soleil.nom,"Soleil");
    //terre
    planete terre;
    terre.masse=5.972e24;
    terre.pos_vit.pos=vect_creer(-2.52e10, 1.44e11, -2.36e6);
    terre.pos_vit.vit=vect_creer(-29810, -5320, 0);
    terre.pos_vit.temps=0;
    terre.pos_vit.ep=p_energie(terre,soleil,terre.pos_vit);
    terre.pos_vit.ec=c_energie(terre,terre.pos_vit);
    terre.pos_vit.et=t_energie(terre,soleil,terre.pos_vit);
    strcpy(terre.nom,"Terre");

    //Mars
    planete mars;
    mars.masse=6.39e23;
    mars.pos_vit.pos=vect_creer(2.07e11, -1.41e10, -5.25e9);
    mars.pos_vit.vit=vect_creer(2190, 26000, 562);
    mars.pos_vit.temps=0;
    mars.pos_vit.ep=p_energie(mars,soleil,mars.pos_vit);
    mars.pos_vit.ec=c_energie(mars,mars.pos_vit);
    mars.pos_vit.et=t_energie(mars,soleil,mars.pos_vit);
    strcpy(mars.nom,"Mars");

    //venus
    planete venus;
    venus.masse=4.867e24;
    venus.pos_vit.pos=vect_creer(-1.07e11, -1.04e10, 6.19e9);
    venus.pos_vit.vit=vect_creer(3080, -34600, -1820);
    venus.pos_vit.temps=0;
    venus.pos_vit.ep=p_energie(venus,soleil,venus.pos_vit);
    venus.pos_vit.ec=c_energie(venus,venus.pos_vit);
    venus.pos_vit.et=t_energie(venus,soleil,venus.pos_vit);
    strcpy(venus.nom,"Venus");
    
    planete systeme_solaire[4];
    systeme_solaire[0]=soleil;
    systeme_solaire[1]=terre;
    systeme_solaire[2]=mars;
    systeme_solaire[3]=venus;

    int nb_planetes = 4;

    int traj_to_do;
    int planete_to_do;
    printf("Que voulez-vous faire?\n");
    printf("1. Calculer la trajectoire d'Euler\n");
    printf("2. Calculer la trajectoire de Runge-Kutta\n");
    printf("3. Calculer la trajectoire d'Euler Asymétrique\n");
    printf("4. Calculer les 3 trajectoires\n");
    scanf("%d",&traj_to_do);
    printf("Voulez-vous calculer pour\n");
    printf("1. La Terre\n");
    printf("2. 3 Planètes\n");
    scanf("%d",&planete_to_do);
    if(traj_to_do==1){
        if(planete_to_do==1){
        trajectoire traj_terre_euler = euler_traj_planete(terre, soleil, 365*24*3600*nb_annee);
        export_json_euler(traj_terre_euler, "terre.json");
        printf("Traj euler calcule\n");}
        else{
            traj_systeme_solaire traj_systeme_solaire_euler = euler_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            export_json_euler_systeme_solaire(traj_systeme_solaire_euler, "systeme_solaire.json");
            printf("Traj euler calcule\n");
        }
    }
    if(traj_to_do==2){
        if(planete_to_do==1){
            trajectoire traj_terre_rk4 = rk4_traj_planete(terre, soleil, 365*24*3600*nb_annee);
            export_json_rk4(traj_terre_rk4, "terre.json");
            printf("Traj rk4 calcule\n");
        }
        else{
            traj_systeme_solaire traj_systeme_solaire_rk4 = rk4_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            export_json_rk4_systeme_solaire(traj_systeme_solaire_rk4, "systeme_solaire.json");
            printf("Traj rk4 calcule\n");
        }
    }
    if(traj_to_do==3){
        if(planete_to_do==1){
            trajectoire traj_terre_euler_asym = euler_asym_traj_planete(terre, soleil, 365*24*3600*nb_annee);
            export_json_euler_asym(traj_terre_euler_asym, "terre.json");
            printf("Traj euler asym calcule\n");
        }
        else{
            traj_systeme_solaire traj_systeme_solaire_euler_asym = euler_asym_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            export_json_euler_asym_systeme_solaire(traj_systeme_solaire_euler_asym, "systeme_solaire.json");
            printf("Traj euler asym calcule\n");
        }
    }
    if(traj_to_do==4){
        if(planete_to_do==1){
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
        else{
            traj_systeme_solaire traj_systeme_solaire_euler = euler_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            printf("Traj euler calcule\n");
            traj_systeme_solaire traj_systeme_solaire_rk4 = rk4_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            printf("Traj rk4 calcule\n");
            traj_systeme_solaire traj_systeme_solaire_euler_asym = euler_asym_traj_systeme_solaire(systeme_solaire, nb_planetes, 365*24*3600*nb_annee);
            printf("Traj euler asym calcule\n");
            
            
            export_json_euler_systeme_solaire(traj_systeme_solaire_euler, "euler_sys.json");
            export_json_rk4_systeme_solaire(traj_systeme_solaire_rk4, "rk4_sys.json");
            export_json_euler_asym_systeme_solaire(traj_systeme_solaire_euler_asym, "asym_sys.json");
            printf("Fichiers séparés créés pour simplifier le formatage JSON.\n");
            
            FILE *fichier = fopen("systeme_solaire.json", "w");
            if (fichier != NULL) {
                fprintf(fichier, "{\n");
                ecrire_systeme_json(fichier, traj_systeme_solaire_euler, "Euler", 0);
                ecrire_systeme_json(fichier, traj_systeme_solaire_rk4, "RK4", 0);
                ecrire_systeme_json(fichier, traj_systeme_solaire_euler_asym, "Euler Asym", 1);
                fprintf(fichier, "}\n");
                fclose(fichier);
                printf("Fichier complet systeme_solaire.json genere.\n");
            }
        }

    }
    return 0;
}