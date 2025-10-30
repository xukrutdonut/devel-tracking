#!/bin/bash

echo "🚀 Iniciando Sistema de Seguimiento del Neurodesarrollo Infantil..."
echo ""
echo "📊 Base de datos: SQLite"
echo "🔧 Backend: Node.js + Express (Puerto 3001)"
echo "🎨 Frontend: React + Vite (Puerto 3000)"
echo ""

# Verificar si existe node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo ""
echo "✅ Iniciando servidor backend..."
echo "   API disponible en: http://localhost:3001"
echo ""
echo "Para iniciar el frontend, ejecuta en otra terminal:"
echo "   npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run server
