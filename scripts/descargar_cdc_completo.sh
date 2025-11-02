#!/bin/bash
# Script para descargar todo el material multimedia del CDC

BASE_DIR="/home/arkantu/docker/devel-tracking/public/media/CDC"
CDC_BASE="https://www.cdc.gov"

descargar_edad() {
    local edad=$1
    local url=$2
    local nombre_carpeta=$3
    
    echo "================================================"
    echo "Procesando: ${edad}"
    echo "================================================"
    
    mkdir -p "${BASE_DIR}/${nombre_carpeta}/fotos"
    mkdir -p "${BASE_DIR}/${nombre_carpeta}/videos"
    
    local temp_html="/tmp/cdc_${nombre_carpeta}.html"
    curl -s "${url}" -o "${temp_html}"
    
    # Imágenes
    local imagenes=$(grep -oP '(?<=src="|href=")[^"]*\/photolibrary\/images\/[^"]*\.(jpg|jpeg|png)(?=")' "${temp_html}" | sort -u)
    local contador_imgs=0
    
    while IFS= read -r img_path; do
        if [ ! -z "$img_path" ]; then
            local img_name=$(basename "$img_path")
            echo "  → IMG: $img_name"
            curl -s "${CDC_BASE}${img_path}" -o "${BASE_DIR}/${nombre_carpeta}/fotos/${img_name}"
            ((contador_imgs++))
        fi
    done <<< "$imagenes"
    
    # Videos
    local videos=$(grep -oP 'https://www\.cdc\.gov/wcms/video/[^"<>\s]+\.mp4' "${temp_html}" | sort -u)
    local contador_vids=0
    
    while IFS= read -r video_url; do
        if [ ! -z "$video_url" ]; then
            local video_name="${nombre_carpeta}_video_${contador_vids}.mp4"
            echo "  → VIDEO: $video_name"
            curl -s -L "${video_url}" -o "${BASE_DIR}/${nombre_carpeta}/videos/${video_name}"
            ((contador_vids++))
        fi
    done <<< "$videos"
    
    echo "✅ ${edad}: ${contador_imgs} imágenes, ${contador_vids} videos"
    echo ""
}

echo "Iniciando descarga completa de material CDC"
echo ""

descargar_edad "4 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-4mo.html" "4_meses"
descargar_edad "6 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-6mo.html" "6_meses"
descargar_edad "9 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-9mo.html" "9_meses"
descargar_edad "12 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-1yr.html" "12_meses"
descargar_edad "15 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-15mo.html" "15_meses"
descargar_edad "18 meses" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-18mo.html" "18_meses"
descargar_edad "2 años" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-2yr.html" "2_años"
descargar_edad "3 años" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-3yr.html" "3_años"
descargar_edad "4 años" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-4yr.html" "4_años"
descargar_edad "5 años" "https://www.cdc.gov/ncbddd/Spanish/actearly/milestones/milestones-5yr.html" "5_años"

echo "================================================"
echo "✅ Descarga completa finalizada"
echo "================================================"
