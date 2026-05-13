#!/usr/bin/env bash
# Une commande : applique bank + monitoring (optionnel) et affiche les URLs stables (NodePort).
# Usage :
#   cd bank && bash scripts/stack-access.sh
#   APPLY=0 bash scripts/stack-access.sh          # n'applique pas les manifests, URLs seulement
#   MINIKUBE_PROFILE=jenkins-ci bash scripts/stack-access.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APPLY="${APPLY:-1}"
PROFILE="${MINIKUBE_PROFILE:-jenkins-ci}"

if [[ -f /var/lib/jenkins/.kube/config ]]; then
  export KUBECONFIG="${KUBECONFIG:-/var/lib/jenkins/.kube/config}"
fi

# Profil Minikube Jenkins : données sous /var/lib/jenkins/.minikube (root seul ne les voit pas sinon).
if [[ -d /var/lib/jenkins/.minikube ]]; then
  export MINIKUBE_HOME="${MINIKUBE_HOME:-/var/lib/jenkins/.minikube}"
fi

is_ipv4() {
  [[ -n "${1:-}" ]] && [[ "$1" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]
}

if [[ "$APPLY" == "1" ]]; then
  echo "==> Application des manifests (bank + monitoring/*.yaml uniquement)..."
  kubectl apply -f "$ROOT/k8s/"
  shopt -s nullglob
  for f in "$ROOT/k8s/monitoring"/*.yaml "$ROOT/k8s/monitoring"/*.yml; do
    kubectl apply -f "$f"
  done
  shopt -u nullglob
  echo "==> OK. Attends quelques secondes que les pods soient Ready si besoin."
  echo ""
fi

# IP du noeud : kubectl d'abord ; minikube seulement si une ligne = IPv4 (pas les messages d'erreur sur stdout).
IP=""
cand="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null | tr -d '\r\n' || true)"
if is_ipv4 "$cand"; then IP="$cand"; fi
if [[ -z "$IP" ]]; then
  cand="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null | tr -d '\r\n' || true)"
  if is_ipv4 "$cand"; then IP="$cand"; fi
fi
if [[ -z "$IP" ]]; then
  cand="$(kubectl get nodes -o wide --no-headers 2>/dev/null | head -1 | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1 || true)"
  if is_ipv4 "$cand"; then IP="$cand"; fi
fi
if [[ -z "$IP" ]] && command -v minikube >/dev/null 2>&1; then
  cand="$(minikube -p "$PROFILE" ip 2>/dev/null | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' | head -1 || true)"
  if is_ipv4 "$cand"; then IP="$cand"; fi
fi
if [[ -z "$IP" ]]; then
  IP="<MINIKUBE_IP>"
fi

echo "=========================================="
echo " Acces stable (NodePort sur Minikube)"
echo " IP Minikube / noeud :  $IP"
echo "=========================================="
echo ""
echo " Sur la VM (navigateur sur le bureau Rocky) :"
echo "   Application (front)  http://${IP}:30080"
echo "   Grafana              http://${IP}:30300   (admin / admin)"
echo "   Prometheus (UI)      http://${IP}:30909"
echo ""
echo " Astuce : pour l'etat applicatif + metriques, Grafana suffit souvent"
echo "          (datasource Prometheus deja configuree)."
echo ""
echo "------------------------------------------"
echo " Depuis ton PC Windows (un seul SSH) :"
echo "   Remplace SERVEUR par l'IP de ta VM (ex. 192.168.65.128)"
echo "------------------------------------------"
echo ""
echo "   ssh -N -L 8080:${IP}:30080 -L 3000:${IP}:30300 -L 9090:${IP}:30909 root@SERVEUR"
echo ""
echo " Puis sur le PC :"
echo "   App        http://127.0.0.1:8080"
echo "   Grafana    http://127.0.0.1:3000"
echo "   Prometheus http://127.0.0.1:9090"
echo ""
echo "------------------------------------------"
echo " Si les pages ne chargent pas : pare-feu Rocky"
echo "   sudo firewall-cmd --permanent --add-port=30080/tcp --add-port=30300/tcp --add-port=30909/tcp"
echo "   sudo firewall-cmd --reload"
echo "=========================================="
