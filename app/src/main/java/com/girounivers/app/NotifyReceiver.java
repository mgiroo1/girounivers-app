package com.girounivers.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotifyReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        String title = i.getStringExtra("title");
        String text = i.getStringExtra("text");
        Notifier.show(c, i.getIntExtra("id", 0), title == null ? "Girounivers" : title, text == null ? "" : text);
    }
}
