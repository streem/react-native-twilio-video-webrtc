/**
 * Component for Twilio Video local views.
 * <p>
 * Authors:
 * Jonathan Chang <slycoder@gmail.com>
 */

package com.twiliorn.library;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;

public class TwilioVideoPreview extends RNVideoViewGroup {

    private static final String TAG = "TwilioVideoPreview";

    public TwilioVideoPreview(ThemedReactContext themedReactContext) {
        super(themedReactContext);
        this.isRemote = false;
        CustomTwilioVideoView.registerThumbnailVideoView(this.getTextureViewRenderer());
    }
}
