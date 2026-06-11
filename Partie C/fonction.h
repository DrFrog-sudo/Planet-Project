#ifndef FONCTION_H
#define FONCTION_H

#define PasTemps 3600 // En seconde
#define G 6.67430e-11 // Constante gravitation

typedef struct vect{
    double x;
    double y;
    double z;
}vect;

typedef struct point{
    vect pos;
    vect vit;
    int temps;
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

// Calcul vitesse position
vect calcul_vitesse_future(point p1, vect acceleration);
vect calcul_position_future(point p1, vect vitesse);
point point_suivant(point point_actuel, planete p_etudie, planete soleil);
trajectoire traj_planete(planete p, planete soleil, int t_max);

// Calcul energie
double p_energie(planete p, planete soleil, point pt);
double c_energie(planete p, point pt);
double t_energie(planete p, planete soleil, point pt);

// Affichage
void afficher_vect(vect v);

// Export en json
void export_json(trajectoire traj, char *nom_fichier);

// Misc
double valeur_absolue(double x);
double distance(vect v1, vect v2);

#endif // FONCTION_H
