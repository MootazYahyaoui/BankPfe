# Ansible — VM CI (Docker, kubectl, Minikube)

Automatisation **pas à pas** pour préparer une machine Ubuntu (VM Jenkins / Minikube) : paquets de base, Docker Engine, `kubectl`, `minikube`, puis optionnellement `minikube start`.

## Prérequis

- **Contrôleur** : Ansible 2.14+ (Linux, WSL Ubuntu, ou macOS). Sous Windows pur, utilise **WSL2** ou lance Ansible depuis la VM.
- **Cible** : **Ubuntu** x64 ou arm64 (le rôle Docker utilise le dépôt officiel Docker pour Ubuntu).

## Inventaire

1. Copie le modèle et adapte l’hôte :

   ```bash
   cp inventory/hosts.example.ini inventory/hosts.ini
   ```

2. Édite `inventory/hosts.ini` : groupe `[bank_ci]` avec `ansible_host`, `ansible_user`, clé SSH.

   Pour **bootstrap sur la même machine** que celle où tu lances Ansible (ex. la VM elle-même) :

   ```ini
   [bank_ci]
   localhost ansible_connection=local
   ```

## Ordre d’exécution (valorisation / démo)

Toutes les commandes se lancent depuis le répertoire `ansible/` :

```bash
cd ansible
```

| Étape | Playbook | Rôle |
|--------|-----------|------|
| 0 | `playbooks/00-ping.yml` | Connexion SSH / facts |
| 1 | `playbooks/01-base-packages.yml` | `common` — apt, curl, git, python3… |
| 2 | `playbooks/02-docker.yml` | `docker` — Docker CE + service |
| 3 | `playbooks/03-kubectl-minikube.yml` | `kubectl_minikube` — binaires `/usr/local/bin` |
| 4 (optionnel) | `playbooks/04-minikube-start.yml` | `minikube start` (voir ci-dessous) |
| Test | `playbooks/90-verify-tools.yml` | Vérifie `docker`, `kubectl`, `minikube` |

**Exemples :**

```bash
ansible-playbook playbooks/00-ping.yml
ansible-playbook playbooks/01-base-packages.yml
ansible-playbook playbooks/02-docker.yml
ansible-playbook playbooks/03-kubectl-minikube.yml
ansible-playbook playbooks/90-verify-tools.yml
```

**Chaîne complète (sans Minikube start) :**

```bash
ansible-playbook playbooks/site.yml
ansible-playbook playbooks/90-verify-tools.yml
```

**Démarrer Minikube** (après les étapes 0–3 ; l’utilisateur SSH doit pouvoir exécuter `docker` sans mot de passe, ou lancer le playbook en root) :

```bash
ansible-playbook playbooks/04-minikube-start.yml -e minikube_start=true
```

Variables utiles (défauts dans `inventory/group_vars/bank_ci.yml`) : `minikube_profile`, `minikube_memory_mb`, `minikube_driver`, `kubectl_version`, `minikube_version`.

**Tout d’un coup** (site + playbook Minikube ; le start reste conditionné par `minikube_start`) :

```bash
ansible-playbook playbooks/site-with-minikube.yml -e minikube_start=true
```

## `sudo` / become

Les playbooks **01–03** utilisent `become: true` (sudo). Configure l’accès sudo sans mot de passe pour ton utilisateur sur la cible, ou passe `-K` pour demander le mot de passe sudo.

Après le rôle **docker**, l’utilisateur est ajouté au groupe `docker` : **ouvre une nouvelle session SSH** (ou `newgrp docker`) avant `04-minikube-start.yml` ou `90-verify-tools.yml` sans `sudo`, pour que `docker info` fonctionne.

## Captures / rapport PFE

- Sortie de `00-ping.yml` (distribution + arch).
- Sortie de `90-verify-tools.yml` (assert succès).
- Optionnel : `minikube status` après `04-minikube-start.yml`.

## Limites connues

- Rôle **docker** : **Ubuntu uniquement** (assert dans le rôle). Étendre le dépôt APT si tu cibles Debian.
- `04-minikube-start.yml` est en `become: false` : le profil Minikube est celui de l’**utilisateur SSH**. Pour un profil sous `/var/lib/jenkins`, connecte-toi en `jenkins` ou exporte `MINIKUBE_HOME` côté session (voir ton `Jenkinsfile`).
