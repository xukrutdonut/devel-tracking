#!/bin/sh
set -e

echo "🚀 Iniciando Sistema de Seguimiento del Neurodesarrollo..."

# Función para iniciar el backend
start_backend() {
    echo "📊 Iniciando Backend API..."
    exec node server/server.js
}

# Función para iniciar el frontend
start_frontend() {
    echo "🎨 Iniciando Frontend..."
    exec npm run dev -- --host 0.0.0.0
}

# Función para iniciar ambos
start_both() {
    echo "🔧 Iniciando Backend y Frontend..."
    node server/server.js &
    npm run dev -- --host 0.0.0.0
}

# Determinar qué iniciar según el comando
case "${1}" in
    server|backend)
        start_backend
        ;;
    dev|frontend)
        start_frontend
        ;;
    both)
        start_both
        ;;
    *)
        echo "Uso: ${0} {server|dev|both}"
        echo "  server  - Solo backend (puerto 3001)"
        echo "  dev     - Solo frontend (puerto 3000)"
        echo "  both    - Backend y Frontend"
        exit 1
        ;;
esac
