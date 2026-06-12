#include "fonction.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

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
    terre.pos_vit.pos=vect_creer(-1.47e11, 0, 0); // Périhélie
    terre.pos_vit.vit=vect_creer(0, -30290, 0); // Vitesse max
    terre.pos_vit.temps=0;
    terre.pos_vit.ep=p_energie(terre,soleil,terre.pos_vit);
    terre.pos_vit.ec=c_energie(terre,terre.pos_vit);
    terre.pos_vit.et=t_energie(terre,soleil,terre.pos_vit);
    strcpy(terre.nom,"Terre");

    //Mars
    planete mars;
    mars.masse=6.39e23;
    mars.pos_vit.pos=vect_creer(2.065e11, 0, 6.67e9); // Périhélie + inclinaison
    mars.pos_vit.vit=vect_creer(0, 26480, 855); // Vitesse max
    mars.pos_vit.temps=0;
    mars.pos_vit.ep=p_energie(mars,soleil,mars.pos_vit);
    mars.pos_vit.ec=c_energie(mars,mars.pos_vit);
    mars.pos_vit.et=t_energie(mars,soleil,mars.pos_vit);
    strcpy(mars.nom,"Mars");

    //venus
    planete venus;
    venus.masse=4.867e24;
    venus.pos_vit.pos=vect_creer(-1.07e11, 0, 6.34e9);
    venus.pos_vit.vit=vect_creer(0, -35200, -2090);
    venus.pos_vit.temps=0;
    venus.pos_vit.ep=p_energie(venus,soleil,venus.pos_vit);
    venus.pos_vit.ec=c_energie(venus,venus.pos_vit);
    venus.pos_vit.et=t_energie(venus,soleil,venus.pos_vit);
    strcpy(venus.nom,"Venus");
    
    // Mercure
    planete mercure;
    mercure.masse=3.3011e23;
    mercure.pos_vit.pos=vect_creer(4.56e10, 0, 5.60e9);
    mercure.pos_vit.vit=vect_creer(0, 58540, 7180);
    mercure.pos_vit.temps=0;
    mercure.pos_vit.ep=p_energie(mercure,soleil,mercure.pos_vit);
    mercure.pos_vit.ec=c_energie(mercure,mercure.pos_vit);
    mercure.pos_vit.et=t_energie(mercure,soleil,mercure.pos_vit);
    strcpy(mercure.nom,"Mercure");

    // Jupiter
    planete jupiter;
    jupiter.masse=1.898e27;
    jupiter.pos_vit.pos=vect_creer(7.40e11, 0, 1.68e10);
    jupiter.pos_vit.vit=vect_creer(0, 13716, 311);
    jupiter.pos_vit.temps=0;
    jupiter.pos_vit.ep=p_energie(jupiter,soleil,jupiter.pos_vit);
    jupiter.pos_vit.ec=c_energie(jupiter,jupiter.pos_vit);
    jupiter.pos_vit.et=t_energie(jupiter,soleil,jupiter.pos_vit);
    strcpy(jupiter.nom,"Jupiter");

    // Saturne
    planete saturne;
    saturne.masse=5.683e26;
    saturne.pos_vit.pos=vect_creer(1.35e12, 0, 5.84e10);
    saturne.pos_vit.vit=vect_creer(0, 10170, 440);
    saturne.pos_vit.temps=0;
    saturne.pos_vit.ep=p_energie(saturne,soleil,saturne.pos_vit);
    saturne.pos_vit.ec=c_energie(saturne,saturne.pos_vit);
    saturne.pos_vit.et=t_energie(saturne,soleil,saturne.pos_vit);
    strcpy(saturne.nom,"Saturne");

    // Uranus
    planete uranus;
    uranus.masse=8.681e25;
    uranus.pos_vit.pos=vect_creer(2.74e12, 0, 3.68e10);
    uranus.pos_vit.vit=vect_creer(0, 7109, 95);
    uranus.pos_vit.temps=0;
    uranus.pos_vit.ep=p_energie(uranus,soleil,uranus.pos_vit);
    uranus.pos_vit.ec=c_energie(uranus,uranus.pos_vit);
    uranus.pos_vit.et=t_energie(uranus,soleil,uranus.pos_vit);
    strcpy(uranus.nom,"Uranus");

    // Neptune
    planete neptune;
    neptune.masse=1.024e26;
    neptune.pos_vit.pos=vect_creer(4.44e12, 0, 1.37e11);
    neptune.pos_vit.vit=vect_creer(0, 5497, 170);
    neptune.pos_vit.temps=0;
    neptune.pos_vit.ep=p_energie(neptune,soleil,neptune.pos_vit);
    neptune.pos_vit.ec=c_energie(neptune,neptune.pos_vit);
    neptune.pos_vit.et=t_energie(neptune,soleil,neptune.pos_vit);
    strcpy(neptune.nom,"Neptune");

    // Lune
    planete lune;
    lune.masse=7.347e22;
    lune.pos_vit.pos=vect_creer(-1.47e11 + 3.84e8, 0, 0); // Liée à la nouvelle position de la Terre
    lune.pos_vit.vit=vect_creer(0, -30290 + 1022, 0);
    lune.pos_vit.temps=0;
    lune.pos_vit.ep=p_energie(lune,soleil,lune.pos_vit);
    lune.pos_vit.ec=c_energie(lune,lune.pos_vit);
    lune.pos_vit.et=t_energie(lune,soleil,lune.pos_vit);
    strcpy(lune.nom,"Lune");

    // Comete de Halley
    planete halley;
    halley.masse=2.2e14;
    halley.pos_vit.pos=vect_creer(8.77e10, 0, 0); // Périhélie
    halley.pos_vit.vit=vect_creer(0, -54500, 0); // Vitesse max, orbite rétrograde
    halley.pos_vit.temps=0;
    halley.pos_vit.ep=p_energie(halley,soleil,halley.pos_vit);
    halley.pos_vit.ec=c_energie(halley,halley.pos_vit);
    halley.pos_vit.et=t_energie(halley,soleil,halley.pos_vit);
    strcpy(halley.nom,"Halley");

    int nb_planetes = 11;
    planete *systeme_solaire = malloc(nb_planetes * sizeof(planete));
    systeme_solaire[0]=soleil;
    systeme_solaire[1]=mercure;
    systeme_solaire[2]=venus;
    systeme_solaire[3]=terre;
    systeme_solaire[4]=mars;
    systeme_solaire[5]=jupiter;
    systeme_solaire[6]=saturne;
    systeme_solaire[7]=uranus;
    systeme_solaire[8]=neptune;
    systeme_solaire[9]=lune;
    systeme_solaire[10]=halley;

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
    printf("2. Toutes les planètes\n");
    scanf("%d",&planete_to_do);
    if(traj_to_do==1){
        if(planete_to_do==1){
        trajectoire traj_terre_euler = euler_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
        export_json_euler(traj_terre_euler, "terre.json");
        printf("Traj euler calcule\n");}
        else{
            traj_systeme_solaire traj_systeme_solaire_euler = euler_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
            export_json_euler_systeme_solaire(traj_systeme_solaire_euler, "systeme_solaire.json");
            printf("Traj euler calcule\n");
        }
    }
    if(traj_to_do==2){
        if(planete_to_do==1){
            trajectoire traj_terre_rk4 = rk4_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
            export_json_rk4(traj_terre_rk4, "terre.json");
            printf("Traj rk4 calcule\n");
        }
        else{
            traj_systeme_solaire traj_systeme_solaire_rk4 = rk4_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
            export_json_rk4_systeme_solaire(traj_systeme_solaire_rk4, "systeme_solaire.json");
            printf("Traj rk4 calcule\n");
        }
    }
    if(traj_to_do==3){
        if(planete_to_do==1){
            trajectoire traj_terre_euler_asym = euler_asym_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
            export_json_euler_asym(traj_terre_euler_asym, "terre.json");
            printf("Traj euler asym calcule\n");
        }
        else{
            traj_systeme_solaire traj_systeme_solaire_euler_asym = euler_asym_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
            export_json_euler_asym_systeme_solaire(traj_systeme_solaire_euler_asym, "systeme_solaire.json");
            printf("Traj euler asym calcule\n");
        }
    }
    if(traj_to_do==4){
        if(planete_to_do==1){
        trajectoire traj_terre_euler = euler_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
        printf("Traj euler calcule\n");
        trajectoire traj_terre_rk4 = rk4_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
        printf("Traj rk4 calcule\n");
        trajectoire traj_terre_euler_asym = euler_asym_traj_planete(terre, soleil, 365.0*24.0*3600.0*nb_annee);
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
            traj_systeme_solaire traj_systeme_solaire_euler = euler_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
            printf("Traj euler calcule\n");
            traj_systeme_solaire traj_systeme_solaire_rk4 = rk4_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
            printf("Traj rk4 calcule\n");
            traj_systeme_solaire traj_systeme_solaire_euler_asym = euler_asym_traj_systeme_solaire(systeme_solaire, nb_planetes, 365.0*24.0*3600.0*nb_annee);
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
    free(systeme_solaire);
    return 0;
}