# Girounivers

A personal astronomy app with a dark, minimalist universe look. It brings together a live sky map, an interactive solar system, an editable catalogue with your own photos, photo challenges, a cosmic events agenda, an observing weather forecast and a light pollution map.

It runs as an Android app (APK) and as a web app you can add to your iPhone home screen. Almost everything works offline, and all your data stays on your device.

## Screenshots

| Sky map | Solar system | Catalogue card | Map |
|---|---|---|---|
| ![Sky](docs/screenshots/sky.jpeg) | ![Solar system](docs/screenshots/solar-system.jpeg) | ![Card](docs/screenshots/card.jpeg) | ![Map](docs/screenshots/map.jpeg) |

## Features

- [**Sky map**](docs/features/sky-map.md): real-time map of the sky for your location.
- [**Solar system**](docs/features/solar-system.md): interactive model with planets, moons, belts, Ceres, Pluto and the Voyager probes.
- [**Catalogue**](docs/features/catalogue.md): hundreds of editable cards with your own photos, in a magazine-style layout.
- [**Photos**](docs/features/photos.md): in-app crop, swipe gallery and photo locations.
- [**Photo challenges**](docs/features/challenges.md): astrophotography challenges to try.
- [**Agenda**](docs/features/agenda.md): oppositions, conjunctions, eclipses and more, with Android notifications.
- [**Weather**](docs/features/weather.md): a stargazing forecast for each night.
- [**Map**](docs/features/map.md): light pollution map of Catalonia (Bortle scale) with your photo locations and observing spots.
- [**Backup and languages**](docs/features/backup.md): full export/import, in Spanish and English.

## Getting the app

**Android.** Download the latest `Girounivers-vX.Y.apk` from the [Releases](../../releases) page and install it. New versions install over the old one and keep your data.

**iPhone.** Open the web version in Safari, tap Share, then "Add to Home Screen":
`https://mgiroo1.github.io/girounivers-app/`

On the web version there are no agenda notifications, and data lives in the browser, so use the backup option regularly.

## Privacy

Photos, notes and settings are stored only on your device. The app uses the internet only for map tiles and the weather forecast.

## Project structure

```
app/src/main/assets/www/    web interface (index.html, js/, css/, icons/)
app/src/main/java/          Android code (WebView, photo picker, notifications)
.github/workflows/          automatic builds: APK release and iPhone web version
```

## Tech

- Android WebView wrapper (Java) around a plain HTML, CSS and JavaScript app, with no framework.
- Local storage in IndexedDB, and a service worker for offline use.
- Android local notifications with `AlarmManager`.
- The Bortle model is an estimate computed from a table of towns and cities; it is meant as a guide, not a measurement.

## Building

Every push to `main` runs GitHub Actions:
- **Build APK** compiles the app, signs it and publishes a release. The signing key is stored in the repository secrets `KEYSTORE_BASE64` and `KEYSTORE_PASSWORD`, so it is never in the code.
- **Publish web** copies the web interface to the `gh-pages` branch, which GitHub Pages serves.

To publish a new version, raise `versionCode` and `versionName` in `app/build.gradle`, then commit and push. The release title and description come from the commit message.

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [ICGC](https://www.icgc.cat/), Esri World Imagery. Weather by [Open-Meteo](https://open-meteo.com/).
