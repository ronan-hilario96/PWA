#!/bin/bash

# Criar ícone base verde com texto branco
convert -size 512x512 xc:#4CAF50 \
    -fill white -gravity center -font Arial -pointsize 120 -annotate 0 "P" \
    /home/ubuntu/precificacao_pwa/icons/base_icon.png

# Criar ícones em diferentes tamanhos
convert /home/ubuntu/precificacao_pwa/icons/base_icon.png -resize 192x192 /home/ubuntu/precificacao_pwa/icons/icon-192x192.png
convert /home/ubuntu/precificacao_pwa/icons/base_icon.png -resize 512x512 /home/ubuntu/precificacao_pwa/icons/icon-512x512.png

# Criar ícone maskable (com área segura)
convert -size 512x512 xc:none \
    -fill "#4CAF50" -draw "roundrectangle 51,51,461,461,50,50" \
    -fill white -gravity center -font Arial -pointsize 120 -annotate 0 "P" \
    /home/ubuntu/precificacao_pwa/icons/maskable_icon.png

echo "Ícones criados com sucesso!"
