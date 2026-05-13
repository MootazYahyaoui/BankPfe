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

if [[ "$APPLY" == "1" ]]; then
  echo "==> Application des manifests (bank + monitoring)..."
  kubectl apply -f "$ROOT/k8s/"
  kubectl apply -f "$ROOT/k8s/monitoring/"
  echo "==> OK. Attends quelques secondes que les pods soient Ready si besoin."
  echo ""
fi

IP=""
if command -v minikube >/dev/null 2>&1; then
  IP="$(minikube -p "$PROFILE" ip 2>/dev/null || true)"
fi
if [[ -z "$IP" ]]; then
  IP="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || true)"
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