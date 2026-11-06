# Girounivers

App personal de astronomía (WebView + HTML/JS, funciona sin conexión).

## Obtener el APK (elige una opción)

**A) Android Studio (la más simple)**
1. Instala Android Studio y abre esta carpeta (File ▸ Open).
2. Espera a que sincronice Gradle.
3. Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s).
4. El archivo queda en `app/build/outputs/apk/debug/app-debug.apk`. Cópialo al móvil e instálalo (permite “instalar apps de origen desconocido”).

**B) GitHub Actions (sin instalar nada)**
1. Crea un repositorio privado en GitHub y sube todo el contenido de esta carpeta.
2. Pestaña Actions ▸ “Build APK” ▸ Run workflow.
3. Al terminar, descarga el artefacto `Girounivers-apk` (contiene el .apk).

## Rellenar el catálogo
Catálogo ▸ toca una ficha ▸ “Editar”. Campos: descripción, información, historia y mitología, tamaño, periodo orbital, distancia al Sol o años luz, datos extra y notas. Las fotos se suben en la propia ficha.

## Copia de seguridad
Ajustes ▸ Exportar copia (guarda un .json en Descargas con fichas, retos, eventos y fotos).
