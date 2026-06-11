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
vect acceleration_n_corps(int index_p, planete systeme_solaire[4], int nb_planetes){
    vect a=vect_creer(0,0,0);
    planete p = systeme_solaire[index_p];
    for(int i=0;i<nb_planetes;i++){
        if(i!=index_p){
            a=add_vect(a,acceleration(p,systeme_solaire[i]));
        }
    }
    return a;
}

//Calcul vitesse position

vect calcul_vitesse_future(point p1, vect acceleration){
    vect new_vitesse= add_vect(p1.vit, mul_scalaire(acceleration, PasTemps));
    return new_vitesse;
}

vect calcul_vitesse_future_n_corps(point p1, int index_p, planete systeme_solaire[4], int nb_planetes){
    vect a=acceleration_n_corps(index_p,systeme_solaire,nb_planetes);
    return calcul_vitesse_future(p1,a);
}

vect calcul_position_future(point p1, vect vitesse){
    vect new_position= add_vect(p1.pos, mul_scalaire(vitesse, PasTemps));
    return new_position;
}

vect calcul_position_future_n_corps(point p1, int index_p, planete systeme_solaire[4], int nb_planetes){
    vect v=calcul_vitesse_future_n_corps(p1,index_p,systeme_solaire,nb_planetes);
    return calcul_position_future(p1,v);
}

//Calcul energie
double p_energie(planete p, planete soleil,point point){
    double numerateur=-G*p.masse*soleil.masse;
    double denominateur=distance(point.pos, soleil.pos_vit.pos);
    return numerateur/denominateur;
}
double p_energie_n_corps(int index_p, planete systeme_solaire[4], int nb_planetes){
    double result=0;
    planete p = systeme_solaire[index_p];
    for(int i=0;i<nb_planetes;i++){
        if(i!=index_p){
            result+=p_energie(p,systeme_solaire[i],p.pos_vit);
        }
    }
    return result;
}

double c_energie(planete p,point point){
    double result=0.5*p.masse*(point.vit.x*point.vit.x+point.vit.y*point.vit.y+point.vit.z*point.vit.z);
    return result;
}
double c_energie_n_corps(int index_p, planete systeme_solaire[4], int nb_planetes){
    double result=0;
    planete p = systeme_solaire[index_p];
    for(int i=0;i<nb_planetes;i++){
        if(i!=index_p){
            result+=c_energie(p,systeme_solaire[i].pos_vit);
        }
    }
    return result;
}

double t_energie(planete p, planete soleil,point point){
    double result=p_energie(p,soleil,point)+c_energie(p,point);
    return result;
}
double t_energie_n_corps(int index_p, planete systeme_solaire[4], int nb_planetes){
    double result=0;
    planete p = systeme_solaire[index_p];
    for(int i=0;i<nb_planetes;i++){
        if(i!=index_p){
            result+=t_energie(p,systeme_solaire[i],p.pos_vit);
        }
    }
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

void ecrire_systeme_json(FILE *fichier, traj_systeme_solaire traj, char *methode, int is_last_method){
    int last_valid_p = -1;
    for(int p=0; p<4; p++){
        if(traj.systeme_solaire[p].masse > 0) last_valid_p = p;
    }

    for(int p=0; p<4; p++){
        if(traj.systeme_solaire[p].masse > 0) {
            fprintf(fichier,"\"%s - %s\" : [\n", traj.systeme_solaire[p].nom, methode);
            for(int i=0; i<traj.nb_points; i++){
                fprintf(fichier,"[");
                fprintf(fichier,"[%f,%f,%f],",traj.tab_points[p][i].pos.x,traj.tab_points[p][i].pos.y,traj.tab_points[p][i].pos.z);
                fprintf(fichier,"[%f,%f,%f],",traj.tab_points[p][i].vit.x,traj.tab_points[p][i].vit.y,traj.tab_points[p][i].vit.z);
                fprintf(fichier,"%d",traj.tab_points[p][i].temps);
                fprintf(fichier,",%f",traj.tab_points[p][i].ec);
                fprintf(fichier,",%f",traj.tab_points[p][i].ep);
                fprintf(fichier,",%f",traj.tab_points[p][i].et);
                fprintf(fichier,"]\n");
                if(i < traj.nb_points - 1) {
                    fprintf(fichier,",");
                }
            }
            fprintf(fichier,"]\n");
            if(p != last_valid_p || !is_last_method) {
                fprintf(fichier,",\n");
            }
        }
    }
}

void export_json_euler_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier){
    FILE *fichier = fopen(nom_fichier, "w");
    if (fichier == NULL){
        printf("Erreur lors de l'ouverture du fichier\n");
        return;
    }
    fprintf(fichier, "{\n");
    ecrire_systeme_json(fichier, traj, "Euler", 1);
    fprintf(fichier, "}\n");
    fclose(fichier);
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






