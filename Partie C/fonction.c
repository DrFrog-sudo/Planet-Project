#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "fonction.h"

//Operation sur les vecteurs

vect vect_creer(double x, double y, double z){
    vect v;
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
}

vect opposer_vect(vect v){
    vect v2;
    v2.x = -v.x;
    v2.y = -v.y;
    v2.z = -v.z;
    return v2;
}

vect add_vect(vect v1, vect v2){
    vect v3;
    v3.x = v1.x + v2.x;
    v3.y = v1.y + v2.y;
    v3.z = v1.z + v2.z;
    return v3;
}

vect sub_vect(vect v1, vect v2){
    return add_vect(v1, opposer_vect(v2));
}

vect mul_scalaire(vect v, double c){
    vect v2;
    v2.x = v.x * c;
    v2.y = v.y * c;
    v2.z = v.z * c;
    return v2;
}

vect div_scalaire(vect v, double c){
    return mul_scalaire(v, 1/c);
}

vect div_vect(vect v1, vect v2){
    vect v3;
    v3.x = v1.x / v2.x;
    v3.y = v1.y / v2.y;
    v3.z = v1.z / v2.z;
    return v3;
}

vect mul_vect(vect v1, vect v2){
    vect v3;
    v3.x = v1.x * v2.x;
    v3.y = v1.y * v2.y;
    v3.z = v1.z * v2.z;
    return v3;
}

//Calcul Force

vect gravitation(planete p1, planete p2){
    double numerateur = G * p1.masse * p2.masse;
    double r=distance(p2.pos_vit.pos, p1.pos_vit.pos);
    double denominateur = valeur_absolue(r*r*r);
    vect vect_r=sub_vect(p1.pos_vit.pos, p2.pos_vit.pos);
    double fraction=numerateur/denominateur;
    return mul_scalaire(opposer_vect(vect_r), fraction);
}

vect acceleration(planete p1, planete p2){
    return div_scalaire(gravitation(p1, p2), p1.masse);
}

//Calcul vitesse position

vect calcul_vitesse_future(point p1, vect acceleration){
    vect new_vitesse= add_vect(p1.vit, mul_scalaire(acceleration, PasTemps));
    return new_vitesse;
}

vect calcul_position_future(point p1, vect vitesse){
    vect new_position= add_vect(p1.pos, mul_scalaire(vitesse, PasTemps));
    return new_position;
}

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

trajectoire euler_traj_planete(planete p, planete soleil, int t_max){
    trajectoire traj;
    traj.planete=p;
    traj.nb_points=t_max/PasTemps;
    traj.tab_points=malloc(traj.nb_points*sizeof(point));
    if (traj.nb_points > 0) {
        traj.tab_points[0]=p.pos_vit;
        for(int i=1;i<traj.nb_points;i++){
            traj.tab_points[i]=point_suivant(traj.tab_points[i-1],p,soleil);
        }
    }
    return traj;
}

//Calcul energie
double p_energie(planete p, planete soleil,point point){
    double numerateur=-G*p.masse*soleil.masse;
    double denominateur=distance(point.pos, soleil.pos_vit.pos);
    return numerateur/denominateur;
}

double c_energie(planete p,point point){
    double result=0.5*p.masse*(point.vit.x*point.vit.x+point.vit.y*point.vit.y+point.vit.z*point.vit.z);
    return result;
}

double t_energie(planete p, planete soleil,point point){
    double result=p_energie(p,soleil,point)+c_energie(p,point);
    return result;
}



//Affichage
void afficher_vect(vect v){
    printf("(%f, %f, %f)\n", v.x, v.y, v.z);
}

//Export en json que pour euler
void export_json_euler(trajectoire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier,"{\"%s - Euler\" : [",traj.planete.nom);
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

// Fonction qui ecrit
void ecrire_points_json(FILE *fichier, trajectoire traj){
    for(int i=0; i<traj.nb_points; i++){
        fprintf(fichier,"[");
        fprintf(fichier,"[%f,%f,%f],",traj.tab_points[i].pos.x,traj.tab_points[i].pos.y,traj.tab_points[i].pos.z);
        fprintf(fichier,"[%f,%f,%f],",traj.tab_points[i].vit.x,traj.tab_points[i].vit.y,traj.tab_points[i].vit.z);
        fprintf(fichier,"%d",traj.tab_points[i].temps);
        fprintf(fichier,",%f",traj.tab_points[i].ec);
        fprintf(fichier,",%f",traj.tab_points[i].ep);
        fprintf(fichier,",%f",traj.tab_points[i].et);
        fprintf(fichier,"]\n");
        if(i < traj.nb_points - 1) {
            fprintf(fichier,",");
        }
    }
}


//Misc
double valeur_absolue(double x){
    if (x < 0){
        return -x;
    }
    return x;
}

double distance(vect v1, vect v2){
    double dx = v1.x - v2.x;
    double dy = v1.y - v2.y;
    double dz = v1.z - v2.z;
    return sqrt(dx*dx + dy*dy + dz*dz);
}






