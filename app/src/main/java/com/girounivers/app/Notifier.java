package com.girounivers.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/** Programa y muestra las notificaciones de la agenda (alarmas del sistema: funcionan con la app cerrada). */
public class Notifier {
    static final String CHANNEL = "agenda";
    static final String PREFS = "gu_notif";

    static void ensureChannel(Context c) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(CHANNEL) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "Agenda astronómica", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setDescription("Avisos de lluvias de estrellas, oposiciones, eclipses y otros eventos");
                nm.createNotificationChannel(ch);
            }
        }
    }

    static PendingIntent alarmIntent(Context c, int id, String title, String text) {
        Intent i = new Intent(c, NotifyReceiver.class);
        i.setData(Uri.parse("girounivers://n/" + id));
        i.putExtra("id", id);
        i.putExtra("title", title);
        i.putExtra("text", text);
        return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void cancelAll(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        try {
            JSONArray a = new JSONArray(sp.getString("list", "[]"));
            for (int k = 0; k < a.length(); k++) {
                JSONObject o = a.getJSONObject(k);
                am.cancel(alarmIntent(c, o.getInt("id"), "", ""));
            }
        } catch (Exception e) { }
        sp.edit().putString("list", "[]").apply();
    }

    /** json: [{id, when (ms), title, text}, ...]. Sustituye a todo lo programado antes. */
    static void schedule(Context c, String json) {
        cancelAll(c);
        try {
            SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            JSONArray a = new JSONArray(json);
            JSONArray kept = new JSONArray();
            long now = System.currentTimeMillis();
            for (int k = 0; k < a.length(); k++) {
                JSONObject o = a.getJSONObject(k);
                long when = o.getLong("when");
                if (when <= now) continue;
                int id = o.getInt("id");
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, alarmIntent(c, id, o.getString("title"), o.optString("text", "")));
                kept.put(o);
            }
            sp.edit().putString("list", kept.toString()).apply();
        } catch (Exception e) { }
    }

    /** Tras reiniciar el móvil o actualizar la app, las alarmas se pierden: se vuelven a programar. */
    static void reschedule(Context c) {
        String s = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("list", "[]");
        schedule(c, s);
    }

    static void show(Context c, int id, String title, String text) {
        ensureChannel(c);
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        open.putExtra("tab", "agenda");
        PendingIntent pi = PendingIntent.getActivity(c, id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_saturn)
         .setContentTitle(title)
         .setContentText(text)
         .setStyle(new Notification.BigTextStyle().bigText(text))
         .setContentIntent(pi)
         .setAutoCancel(true);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.notify(id, b.build());
    }
}
