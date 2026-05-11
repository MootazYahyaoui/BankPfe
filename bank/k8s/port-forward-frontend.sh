#!/usr/bin/env sh
# Contourne l'Ingress : envoie le trafic directement vers le service frontend (SPA Angular).
# Alternative sans ce script : le Service frontend est en NodePort 30080 sur l'IP Minikube
# (voir k8s/all.yaml). Tunnel: ssh -N -L 8080:<minikube-ip>:30080 root@<serveur>
#
# Sur Red Hat (session SSH 1), après export KUBECONFIG :
#   ./port-forward-frontend.sh
#
# Sur Windows (PowerShell / CMD), session 2 :
#   ssh -N -L 8080:127.0.0.1:18080 root@<IP_REDHAT>
#
# Navigateur Windows : http://127.0.0.1:8080
#
set -e
exec kubectl -n bank port-forward svc/frontend 18080:80
