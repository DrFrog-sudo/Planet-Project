#ifndef FONCTION_H
#define FONCTION_H

#include <stdio.h>

#define PasTemps (3600.0*4.0) // En seconde
#define G 6.67430e-11 // Constante gravitation
#define nb_annee 360 // nombre d'année à simuler
#define COEF_REDUCTION_JSON 10
typedef struct vect{
    double x;
    double y;
    double z;
}vect;

typedef struct point{
    vect pos;
    vect vit;
    double temps;
    double ec;
    double ep;
    double et;
}point;

typedef struct planete{
    point pos_vit;
    double masse;
    char nom[100];
}planete;

typedef struct trajectoire{
    int nb_points;
    planete planete;
    point *tab_points;
}trajectoire;

typedef struct traj_systeme_solaire{
    int nb_points;
    int nb_planetes;
    planete *systeme_solaire;
    point **tab_points;
}traj_systeme_solaire;

// Operation sur les vecteurs
vect vect_creer(double x, double y, double z);
vect opposer_vect(vect v);
vect add_vect(vect v1, vect v2);
vect sub_vect(vect v1, vect v2);
vect mul_scalaire(vect v, double c);
vect div_scalaire(vect v, double c);
vect div_vect(vect v1, vect v2);
vect mul_vect(vect v1, vect v2);

// Calcul Force
vect gravitation(planete p1, planete p2);
vect acceleration(planete p1, planete p2);
vect acceleration_n_corps(int index_p, planete *systeme_solaire, int nb_planetes);

// Calcul vitesse position
vect calcul_vitesse_future(point p1, vect acceleration);
vect calcul_vitesse_future_n_corps(point p1, int index_p, planete *systeme_solaire, int nb_planetes);
vect calcul_position_future(point p1, vect vitesse);
vect calcul_position_future_n_corps(point p1, int index_p, planete *systeme_solaire, int nb_planetes);

//Euler
point point_suivant_euler(point point_actuel, planete p_etudie, planete soleil);
point point_suivant_n_corps(point point_actuel, int index_p, planete *systeme_solaire, int nb_planetes);
trajectoire euler_traj_planete(planete p, planete soleil, double t_max);
traj_systeme_solaire euler_traj_systeme_solaire(planete *systeme_solaire, int nb_planetes, double t_max);

// Euler Asymétrique
point point_suivant_euler_asym(point point_actuel, planete p_etudie, planete soleil);
point point_suivant_euler_asym_n_corps(point point_actuel, int index_p, planete *systeme_solaire, int nb_planetes);
trajectoire euler_asym_traj_planete(planete p, planete soleil, double t_max);
traj_systeme_solaire euler_asym_traj_systeme_solaire(planete *systeme_solaire, int nb_planetes, double t_max);

// Runge-Kutta
point rk4_suivant(point point_actuel, planete p_etudie, planete soleil);
point rk4_suivant_n_corps(point point_actuel, int index_p, planete *systeme_solaire, int nb_planetes);
trajectoire rk4_traj_planete(planete p, planete soleil, double t_max);
traj_systeme_solaire rk4_traj_systeme_solaire(planete *systeme_solaire, int nb_planetes, double t_max);

// Calcul energie
double p_energie(planete p, planete soleil, point pt);
double c_energie(planete p, point pt);
double t_energie(planete p, planete soleil, point pt);
double p_energie_n_corps(int index_p, planete *systeme_solaire, int nb_planetes);
double c_energie_n_corps(int index_p, planete *systeme_solaire, int nb_planetes);
double t_energie_n_corps(int index_p, planete *systeme_solaire, int nb_planetes);

// Affichage
void afficher_vect(vect v);
void afficher_barre_chargement(int actuel, int total, const char* prefixe);

// Export en json
void export_json_euler(trajectoire traj, char *nom_fichier);
void export_json_euler_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier);
void export_json_rk4(trajectoire traj, char *nom_fichier);
void export_json_rk4_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier);
void export_json_euler_asym(trajectoire traj, char *nom_fichier);
void export_json_euler_asym_systeme_solaire(traj_systeme_solaire traj, char *nom_fichier);
void ecrire_points_json(FILE *fichier, trajectoire traj);
void ecrire_systeme_json(FILE *fichier, traj_systeme_solaire traj, char *methode, int is_last_method);


// Misc
double valeur_absolue(double x);
double distance(vect v1, vect v2);

#endif // FONCTION_H
