# Girounivers

Personal astronomy app for Android (WebView + HTML/JS), featuring a dark theme and offline functionality.



## Sections

* **Sky**: Sky map.
* **Solar sistem**: Interactive real-time simulation (planets, moons, belts, Ceres, Pluto, and Voyager probes).
* **Catalog**: Objects with custom photos, grouped by type, A–Z, or constellation (includes Messier objects and black holes).
* **Schedule**: Cosmic events (oppositions, conjunctions, eclipses…) with notifications.
* **Weather**: Stargazing forecast (the only section that uses the internet).
* **Challenges** (camera) and **Light Pollution Map of Catalonia** with the Bortle scale, observation spots, and photo locations.



## Structure

```
app/src/main/assets/www/   web interface (index.html, js/, css/)
app/src/main/java/         Android code (MainActivity, notifications)
keystore/                  fixed signing key (required to update without uninstalling)
.github/workflows/         automated APK build
```



(Notes for me, admin):

## Build and Publish

Every `git push` to `main` builds the APK and creates a Release named `Girounivers-v<version>.apk`.
The Release title and description are generated from the commit message (first line = title, rest = description).



## New Version

1. Increment `versionCode` (+1) and update `versionName` in `app/build.gradle`.
2. Run `git commit -m "Short title" -m "Description of changes"` and `git push`.

> Do not delete or change `keystore/girounivers.jks`: if the key changes, Android will force you to uninstall the app.

