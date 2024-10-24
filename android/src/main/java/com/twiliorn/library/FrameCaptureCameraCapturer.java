package com.twiliorn.library;/*
 * Copyright © 2024. Streem, Inc. All rights reserved.
 */

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.twilio.video.CameraCapturer;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

import tvi.webrtc.CapturerObserver;
import tvi.webrtc.SurfaceTextureHelper;
import tvi.webrtc.VideoFrame;

public class FrameCaptureCameraCapturer extends CameraCapturer {
    private final AtomicBoolean captureThisFrame = new AtomicBoolean(false);
    // TODO: FIX THIS. ITS A POTENTIAL MEMORY LEAK.
    private ReactContext reactContext;
    // choosing to use single thread since limited i/o resources may be a bottleneck anyways
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private String filename = "";

    public FrameCaptureCameraCapturer(@NonNull Context context, @NonNull String cameraId) {
        super(context, cameraId);
    }

    public FrameCaptureCameraCapturer(@NonNull Context context, @NonNull String cameraId, @Nullable Listener listener) {
        super(context, cameraId, listener);
    }

    @Override
    public void initialize(@NonNull SurfaceTextureHelper surfaceTextureHelper, @NonNull Context context, @NonNull CapturerObserver capturerObserver) {
        Log.d(TwilioPackage.TAG, "FrameCaptureCameraCapturer: Initializing");

        CapturerObserver frameInterceptCapturerObserver = new CapturerObserver() {
            @Override
            public void onCapturerStarted(boolean success) {
                capturerObserver.onCapturerStarted(success);
            }

            @Override
            public void onCapturerStopped() {
                capturerObserver.onCapturerStopped();
            }

            @Override
            public void onFrameCaptured(VideoFrame frame) {
                if (frame != null && reactContext != null && captureThisFrame.compareAndSet(true, false)) {
                    frame.retain(); // retain frame so we can save it on background thread, bg thread will handle releasing
                    Log.d(TwilioPackage.TAG, "FrameCaptureCameraCapturer: Capturing frame on background thread.");
                    String filename = FrameCaptureCameraCapturer.this.filename;
                    // save frame on background thread
                    executorService.execute(() -> {
                        Utils.saveVideoFrame(frame, reactContext, filename);
                    });
                }

                capturerObserver.onFrameCaptured(frame);
            }
        };
        super.initialize(surfaceTextureHelper, context, frameInterceptCapturerObserver);
    }

    public void setContext(ReactContext reactContext) {
        this.reactContext = reactContext;
    }

    public void captureFrame(String filename) {
        Log.d(TwilioPackage.TAG, "FrameCaptureCameraCapturer: Setting captureThisFrame flag to true for file " + filename);
        this.filename = filename;
        this.captureThisFrame.set(true);
    }
}
