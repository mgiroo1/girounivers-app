package com.girounivers.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.Window;
import android.content.ClipData;
import android.database.Cursor;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView web;
    private ValueCallback<Uri[]> chooser;
    private GeolocationPermissions.Callback geoCb;
    private String geoOrigin;
    private static final int REQ_FILE = 1, REQ_LOC = 2, REQ_PICK = 3;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        web = new WebView(this);
        web.setBackgroundColor(0xFF000000);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setGeolocationEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " GirouniversApp");
        web.addJavascriptInterface(new FileBridge(), "GuFile");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("file".equals(u.getScheme()) || "appassets".equals(u.getScheme())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) { cb.invoke(origin, true, false); return; }
                geoCb = cb; geoOrigin = origin;
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOC);
            }
            @Override public void onPermissionRequest(PermissionRequest r) { r.grant(r.getResources()); }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (chooser != null) chooser.onReceiveValue(null);
                chooser = cb;
                try { startActivityForResult(p.createIntent(), REQ_FILE); }
                catch (Exception e) { chooser = null; return false; }
                return true;
            }
        });
        web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_LOC && geoCb != null) {
            boolean ok = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED;
            geoCb.invoke(geoOrigin, ok, false); geoCb = null;
        }
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_PICK) {
            List<Uri> uris = new ArrayList<>();
            if (res == RESULT_OK && data != null) {
                ClipData cd = data.getClipData();
                if (cd != null) { for (int i = 0; i < cd.getItemCount(); i++) uris.add(cd.getItemAt(i).getUri()); }
                else if (data.getData() != null) uris.add(data.getData());
            }
            if (uris.isEmpty()) web.evaluateJavascript("window.GUpick&&GUpick.error('')", null);
            else sendPicked(uris);
            return;
        }
        if (req == REQ_FILE && chooser != null) {
            chooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            chooser = null;
        }
    }

    /** Selector de imágenes nativo: evita el selector de archivos del WebView, que en algunos móviles no devuelve la foto. */
    private void sendPicked(final List<Uri> uris) {
        new Thread(() -> {
            for (Uri u : uris) {
                try {
                    String name = "foto.jpg"; long mod = 0;
                    String mime = getContentResolver().getType(u); if (mime == null) mime = "image/jpeg";
                    try (Cursor c = getContentResolver().query(u, null, null, null, null)) {
                        if (c != null && c.moveToFirst()) {
                            int i = c.getColumnIndex("_display_name"); if (i >= 0 && c.getString(i) != null) name = c.getString(i);
                            int j = c.getColumnIndex("last_modified"); if (j >= 0 && !c.isNull(j)) mod = c.getLong(j);
                            else { int k = c.getColumnIndex("date_modified"); if (k >= 0 && !c.isNull(k)) mod = c.getLong(k) * 1000L; }
                        }
                    } catch (Exception e) { }
                    java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                    try (InputStream in = getContentResolver().openInputStream(u)) {
                        byte[] buf = new byte[65536]; int n;
                        while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                    }
                    byte[] all = bos.toByteArray();
                    final int CH = 240000; final int total = Math.max(1, (all.length + CH - 1) / CH);
                    final String fn = name.replace("\\", "_").replace("'", "_"), fm = mime; final long fmod = mod;
                    for (int i = 0; i < total; i++) {
                        int from = i * CH, to = Math.min(all.length, from + CH);
                        final String b64 = Base64.encodeToString(all, from, to - from, Base64.NO_WRAP);
                        final int idx = i;
                        runOnUiThread(() -> web.evaluateJavascript("window.GUpick&&GUpick.chunk('" + fn + "','" + fm + "'," + fmod + "," + total + "," + idx + ",'" + b64 + "')", null));
                        Thread.sleep(8);
                    }
                } catch (final Exception e) {
                    final String msg = String.valueOf(e.getMessage()).replace("'", " ");
                    runOnUiThread(() -> web.evaluateJavascript("window.GUpick&&GUpick.error('" + msg + "')", null));
                }
            }
        }).start();
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("window.GU && GU.back()", v -> { if (!"true".equals(v)) runOnUiThread(() -> MainActivity.super.onBackPressed()); });
    }

    /** Puente para guardar archivos (copias de seguridad, .ics) en Descargas. */
    class FileBridge {
        @JavascriptInterface public void pickImages() {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.setType("image/*"); i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    startActivityForResult(i, REQ_PICK);
                } catch (Exception e) { web.evaluateJavascript("window.GUpick&&GUpick.error('No se pudo abrir la galería')", null); }
            });
        }
        private OutputStream out; private Uri uri; private File legacy;
        @JavascriptInterface public void open(String name, String mime) throws Exception {
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name); v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                out = getContentResolver().openOutputStream(uri);
            } else {
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS); dir.mkdirs();
                legacy = new File(dir, name); out = new FileOutputStream(legacy);
            }
        }
        @JavascriptInterface public void write(String b64) throws Exception { out.write(Base64.decode(b64, Base64.DEFAULT)); }
        @JavascriptInterface public String close() throws Exception { out.close(); return uri != null ? uri.toString() : legacy.getPath(); }
    }
}
