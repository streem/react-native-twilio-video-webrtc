/**
 * Component to orchestrate the Twilio Video connection and the various video
 * views.
 *
 * Authors:
 *   Ralph Pina <slycoder@gmail.com>
 *   Jonathan Chang <slycoder@gmail.com>
 */

import {
  Platform,
  UIManager,
  View,
  findNodeHandle,
  requireNativeComponent,
} from "react-native";
import React, { Component } from "react";

import PropTypes from "prop-types";
import { toByteArray } from "base64-js";

const propTypes = {
  ...View.propTypes,
  /**
   * Callback that is called when camera source changes
   */
  onCameraSwitched: PropTypes.func,

  /**
   * Callback that is called when video is toggled.
   */
  onVideoChanged: PropTypes.func,

  /**
   * Callback that is called when a audio is toggled.
   */
  onAudioChanged: PropTypes.func,

  /**
   * Callback that is called when user is connected to a room.
   */
  onRoomDidConnect: PropTypes.func,

  /**
   * Callback that is called when connecting to room fails.
   */
  onRoomDidFailToConnect: PropTypes.func,

  /**
   * Callback that is called when user is disconnected from room.
   */
  onRoomDidDisconnect: PropTypes.func,

  /**
   * Called when a new data track has been added
   *
   * @param {{participant, track}}
   */
  onParticipantAddedDataTrack: PropTypes.func,

  /**
   * Called when a data track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedDataTrack: PropTypes.func,

  /**
   * Called when an dataTrack receives a message
   *
   * @param {{message}}
   */
  onDataTrackMessageReceived: PropTypes.func,

  /**
   * Called when an dataTrack receives a binary message
   *
   * @param {{message}}
   */
  onDataTrackBinaryMessageReceived: PropTypes.func,

  /**
   * Called when a new video track has been added
   *
   * @param {{participant, track, enabled}}
   */
  onParticipantAddedVideoTrack: PropTypes.func,

  /**
   * Called when a video track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedVideoTrack: PropTypes.func,

  /**
   * Called when a new audio track has been added
   *
   * @param {{participant, track}}
   */
  onParticipantAddedAudioTrack: PropTypes.func,

  /**
   * Called when a audio track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedAudioTrack: PropTypes.func,

  /**
   * Callback called a participant enters a room.
   */
  onRoomParticipantDidConnect: PropTypes.func,

  /**
   * Callback that is called when a participant exits a room.
   */
  onRoomParticipantDidDisconnect: PropTypes.func,
  /**
   * Called when a video track has been enabled.
   *
   * @param {{participant, track}}
   */
  onParticipantEnabledVideoTrack: PropTypes.func,
  /**
   * Called when a video track has been disabled.
   *
   * @param {{participant, track}}
   */
  onParticipantDisabledVideoTrack: PropTypes.func,
  /**
   * Called when an audio track has been enabled.
   *
   * @param {{participant, track}}
   */
  onParticipantEnabledAudioTrack: PropTypes.func,
  /**
   * Called when an audio track has been disabled.
   *
   * @param {{participant, track}}
   */
  onParticipantDisabledAudioTrack: PropTypes.func,
  /**
   * Callback that is called when stats are received (after calling getStats)
   */
  onStatsReceived: PropTypes.func,
  /**
   * Callback that is called when network quality levels are changed (only if enableNetworkQualityReporting in connect is set to true)
   */
  onNetworkQualityLevelsChanged: PropTypes.func,
  /**
   * Called when dominant speaker changes
   * @param {{ participant, room }} dominant participant and room
   */
  onDominantSpeakerDidChange: PropTypes.func,
  /**
   * Callback that is called after determining what codecs are supported
   */
  onLocalParticipantSupportedCodecs: PropTypes.func,
  /**
   * The name of the local video track.  Defaults to "camera"
   */
  localVideoTrackName: PropTypes.string,
  /**
   * Called when torch is done attempting to change status
   * @param {{ status, error }} 
   */
  onFlashlightStatusChanged: PropTypes.func,
};

const nativeEvents = {
  connectToRoom: 1,
  disconnect: 2,
  switchCamera: 3,
  toggleVideo: 4,
  toggleSound: 5,
  getStats: 6,
  disableOpenSLES: 7,
  toggleSoundSetup: 8,
  toggleRemoteSound: 9,
  releaseResource: 10,
  toggleBluetoothHeadset: 11,
  sendString: 12,
  publishVideo: 13,
  publishAudio: 14,
  prepareToRebuildLocalVideoTrack: 15,
  captureFrame: 16,
  setFlashlightStatus: 17,
};

class CustomTwilioVideoView extends Component {
  connect({
    roomName,
    accessToken,
    cameraType = "front",
    enableAudio = true,
    enableVideo = true,
    enableRemoteAudio = true,
    enableNetworkQualityReporting = false,
    dominantSpeakerEnabled = false,
    maintainVideoTrackInBackground = false,
    encodingParameters = {},
  }) {
    this.runCommand(nativeEvents.connectToRoom, [
      roomName,
      accessToken,
      enableAudio,
      enableVideo,
      enableRemoteAudio,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      maintainVideoTrackInBackground,
      cameraType,
      encodingParameters,
    ]);
  }

  sendString(message) {
    this.runCommand(nativeEvents.sendString, [message]);
  }

  publishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [true]);
  }

  publishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [true]);
  }

  unpublishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [false]);
  }

  unpublishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [false]);
  }

  disconnect() {
    this.runCommand(nativeEvents.disconnect, []);
  }

  componentWillUnmount() {
    this.runCommand(nativeEvents.releaseResource, []);
  }

  flipCamera() {
    this.runCommand(nativeEvents.switchCamera, []);
  }

  prepareToRebuildLocalVideoTrack(localVideoTrackName) {
    this.runCommand(nativeEvents.prepareToRebuildLocalVideoTrack, [localVideoTrackName]);
  }

  setLocalVideoEnabled(enabled, cameraType) {
    this.runCommand(nativeEvents.toggleVideo, [enabled, cameraType]);
    return Promise.resolve(enabled);
  }

  setLocalAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setRemoteAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleRemoteSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setBluetoothHeadsetConnected(enabled) {
    this.runCommand(nativeEvents.toggleBluetoothHeadset, [enabled]);
    return Promise.resolve(enabled);
  }

  setFlashlightStatus(enabled) {
    this.runCommand(nativeEvents.setFlashlightStatus, [enabled]);
  }

  getStats() {
    this.runCommand(nativeEvents.getStats, []);
  }

  disableOpenSLES() {
    this.runCommand(nativeEvents.disableOpenSLES, []);
  }

  toggleSoundSetup(speaker) {
    this.runCommand(nativeEvents.toggleSoundSetup, [speaker]);
  }

  captureFrame(filename) {
    this.runCommand(nativeEvents.captureFrame, [filename]);
  }

  runCommand(event, args) {
    switch (Platform.OS) {
      case "android":
        UIManager.dispatchViewManagerCommand(
          findNodeHandle(this.refs.videoView),
          event,
          args
        );
        break;
      default:
        break;
    }
  }

  buildNativeEventWrappers() {
    return [
      "onCameraSwitched",
      "onVideoChanged",
      "onAudioChanged",
      "onRoomDidConnect",
      "onRoomDidFailToConnect",
      "onRoomDidDisconnect",
      "onParticipantAddedDataTrack",
      "onParticipantRemovedDataTrack",
      "onDataTrackMessageReceived",
      "onDataTrackBinaryMessageReceived",
      "onParticipantAddedVideoTrack",
      "onParticipantRemovedVideoTrack",
      "onParticipantAddedAudioTrack",
      "onParticipantRemovedAudioTrack",
      "onRoomParticipantDidConnect",
      "onRoomParticipantDidDisconnect",
      "onParticipantEnabledVideoTrack",
      "onParticipantDisabledVideoTrack",
      "onParticipantEnabledAudioTrack",
      "onParticipantDisabledAudioTrack",
      "onStatsReceived",
      "onNetworkQualityLevelsChanged",
      "onDominantSpeakerDidChange",
      "onLocalParticipantSupportedCodecs",
      "onFlashlightStatusChanged",
    ].reduce((wrappedEvents, eventName) => {
      let handler = (data) => this.props[eventName](data.nativeEvent);

      if (this.props[eventName]) {
        if (eventName === "onDataTrackBinaryMessageReceived") {
          handler = (data) =>
            this.props[eventName]({
              ...data.nativeEvent,
              message: toByteArray(data.nativeEvent.message),
            });
        }
        return {
          ...wrappedEvents,
          [eventName]: handler,
        };
      }
      return wrappedEvents;
    }, {});
  }

  render() {
    return (
      <NativeCustomTwilioVideoView
        ref="videoView"
        {...this.props}
        {...this.buildNativeEventWrappers()}
      />
    );
  }
}

CustomTwilioVideoView.propTypes = propTypes;

const NativeCustomTwilioVideoView = requireNativeComponent(
  "RNCustomTwilioVideoView",
  CustomTwilioVideoView
);

module.exports = CustomTwilioVideoView;
