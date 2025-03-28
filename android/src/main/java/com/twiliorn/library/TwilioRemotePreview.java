/**
 * Component for Twilio Video participant views.
 * <p>
 * Authors:
 * Jonathan Chang <slycoder@gmail.com>
 */

package com.twiliorn.library;

import android.util.Log;

import com.facebook.react.uimanager.ThemedReactContext;


public class TwilioRemotePreview extends RNVideoViewGroup {

    private static final String TAG = "TwilioRemotePreview";


    public TwilioRemotePreview(ThemedReactContext context, String trackSid) {
        super(context);
        this.isRemote = true;
        Log.i("CustomTwilioVideoView", "Remote Prview Construct");
        Log.i("CustomTwilioVideoView", trackSid);

        CustomTwilioVideoView.registerPrimaryVideoView(this.getTextureViewRenderer(), trackSid);
    }
}
