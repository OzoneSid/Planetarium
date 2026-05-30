# PLANETARIUM

> Explorateur interactif du système solaire — observer et naviguer dans l'espace.

---

## Aperçu

**Planetarium** est une interface interactive pour explorer notre système solaire.  
Le projet crée un environnement visuel qui se veut réaliste où l'utilisateur peut interagir avec les corps célestes et observer les données astronomiques.

L'accent est mis sur :

- un **rendu réaliste et pédagogique**
- une **interface intuitive**
- des **composants variés et évolutifs**

---

## Fonctionnalités

- **Visualisation**
  - Vue interactive du système solaire avec suivi des corps
  - Propriétés astronomiques réalistes des corps
  - Nuages et anneaux
  - Eclairage nocturne terrestre
  - Ombres en temps réel

  - Ombres sur anneaux (EN COURS)
  - Système d'eclipse (EN COURS)

- **Interface**
  - Liste des corps
  - Gestion du temps

  - Fiche informative dédiée pour chaque corps lors du suivi, si activée (EN COURS)

- **Composants réutilisables**
  - Générateurs de corps : Corp général devient soleil, planète ou lune. (CelestialBody.js)
  - Gestionnaire de propriétés astronomiques : Echelle, distance, vitesse... (Constants.js)
  - Gestionnaire des ombres sur nuages, d'eclairage nocturne et d'eclipse. (shaders/fragment + vertex)

---

## Stack technique

- **JavaScript**
- **Three.js**

---

## Architecture

Le projet suit une séparation claire :

---

## Objectif du projet

Ce projet a été conçu comme :

- un **exercice de programmation orientée objet**
- une **mise en pratique Three.js**
- une **base évolutive vers un programme dense**

---

## Déploiement

Le projet est destiné à être déployé en statique via GitPages.

---

## Évolutions possibles

- Calendrier : Adaptation du programme pour un positionnement des corps réaliste dans le temps et l'espace.
- Ajout d'un second système solaire : Proxima du Centaure ?

---
