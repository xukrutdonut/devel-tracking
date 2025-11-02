# Material Multimedia CDC - Hitos del Desarrollo

## 📚 Fuente

**CDC - Aprenda los Signos. Reaccione Pronto**  
Centers for Disease Control and Prevention

- **Sitio web**: https://www.cdc.gov/ncbddd/Spanish/actearly/
- **Licencia**: Dominio público (Gobierno de EE.UU.)
- **Fecha de descarga**: 2 de noviembre de 2024

## 📁 Estructura de Carpetas

```
/public/media/CDC/
├── README.md (este archivo)
├── 2_meses/
│   ├── metadata.json
│   ├── fotos/
│   │   ├── 1_2-meses_Se-calma-cuando-le-hablan-o-la-alzan-1.jpg
│   │   ├── 1_2-meses_Se-calma-cuando-le-hablan-o-la-alzan-2.jpg
│   │   ├── 2_2-meses_Mantiene.jpg
│   │   ├── 3_2-meses_Fija-la-vista-en-un-juguete-por-varios-segundos.jpg
│   │   ├── 4_2-meses_La-mira-a-la-cara.jpg
│   │   └── 5_2-meses_Parece-estar-feliz-cuando-usted-se-le-acerca.jpg
│   └── videos/
│       ├── 2m_hace_sonidos.mp4
│       └── 2m_reacciona_sonidos.mp4
├── 4_meses/ (próximo)
├── 6_meses/ (próximo)
├── 9_meses/ (próximo)
├── 12_meses/ (próximo)
├── 15_meses/ (próximo)
├── 18_meses/ (próximo)
├── 2_años/ (próximo)
├── 3_años/ (próximo)
├── 4_años/ (próximo)
└── 5_años/ (próximo)
```

## 📊 Contenido por Edad - 2 Meses

### Fotos (6)
1. **Se calma cuando le hablan o la alzan** (2 ejemplos)
   - Social/Emocional
   - Muestra cómo el bebé responde al contacto y voz

2. **Mantiene la cabeza en alto cuando está boca abajo**
   - Movimiento/Desarrollo Físico
   - Control de cabeza y cuello

3. **Fija la vista en un juguete por varios segundos**
   - Cognitivo
   - Atención visual y seguimiento

4. **La mira a la cara**
   - Social/Emocional
   - Contacto visual con cuidadores

5. **Parece estar feliz cuando usted se le acerca**
   - Social/Emocional
   - Reconocimiento y respuesta social

### Videos (2)
1. **Hace sonidos además de llorar**
   - Comunicación/Lenguaje
   - Vocalizaciones tempranas (~15 seg)

2. **Reacciona a sonidos fuertes**
   - Cognitivo
   - Respuesta auditiva (~10 seg)

## 💡 Uso en la Aplicación

### Cargar Imágenes
```javascript
// Ejemplo de cómo usar las imágenes
const imagenHito = '/media/CDC/2_meses/fotos/4_2-meses_La-mira-a-la-cara.jpg';

<img 
  src={imagenHito} 
  alt="Bebé de 2 meses mirando a la cara de su cuidador"
/>
```

### Cargar Videos
```javascript
// Ejemplo de cómo usar los videos
const videoHito = '/media/CDC/2_meses/videos/2m_hace_sonidos.mp4';

<video controls width="100%">
  <source src={videoHito} type="video/mp4" />
  Tu navegador no soporta video HTML5.
</video>
```

### Cargar Metadata
```javascript
// Cargar información estructurada
fetch('/media/CDC/2_meses/metadata.json')
  .then(res => res.json())
  .then(data => {
    console.log(`Total fotos: ${data.estadisticas.total_fotos}`);
    console.log(`Total videos: ${data.estadisticas.total_videos}`);
  });
```

## 📋 Categorías de Hitos

### Social/Emocional
- Interacción con personas
- Respuestas emocionales
- Reconocimiento de cuidadores

### Comunicación/Lenguaje
- Vocalizaciones
- Comprensión
- Expresión verbal

### Cognitivo (Aprendizaje, Razonamiento, Resolución de Problemas)
- Atención visual/auditiva
- Exploración
- Causa y efecto

### Movimiento/Desarrollo Físico (Motor Grueso y Fino)
- Control motor
- Coordinación
- Fuerza muscular

## ⚖️ Licencia y Atribución

Todo el contenido multimedia proviene del CDC y es de **dominio público**.

**Atribución recomendada**:
```
Fuente: CDC - Aprenda los Signos. Reaccione Pronto
Centers for Disease Control and Prevention
https://www.cdc.gov/ncbddd/Spanish/actearly/
```

## 🔄 Próximos Pasos

Para completar la colección, se necesita descargar material de las siguientes edades:
- [ ] 4 meses
- [ ] 6 meses
- [ ] 9 meses
- [ ] 12 meses (1 año)
- [ ] 15 meses
- [ ] 18 meses
- [ ] 2 años
- [ ] 3 años
- [ ] 4 años
- [ ] 5 años

## 📞 Contacto CDC

Si necesitas más información o permisos adicionales:
- **Web**: https://www.cdc.gov/
- **Email**: cdcinfo@cdc.gov
- **Teléfono**: 1-800-CDC-INFO (1-800-232-4636)

## 📝 Notas

- Los archivos se mantienen con nombres originales para trazabilidad
- Cada carpeta de edad incluye su propio `metadata.json`
- Videos en formato MP4 de baja resolución (optimizado para web)
- Imágenes en formato JPEG optimizadas

---

**Última actualización**: 2 de noviembre de 2024
