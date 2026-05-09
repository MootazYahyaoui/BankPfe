#!/usr/bin/env sh
# Contourne l'Ingress : envoie le trafic directement vers le service frontend (SPA Angular).
# Utile si le tunnel SSH vers l'Ingress affiche encore la page "Welcome to nginx".
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
