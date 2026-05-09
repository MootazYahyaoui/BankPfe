#!/usr/bin/env sh
# Accès local au frontend sans Ingress : http://127.0.0.1:8080
# Usage : ./port-forward-frontend.sh   (depuis un shell ayant kubectl + contexte bank)
set -e
exec kubectl -n bank port-forward svc/frontend 8080:80
