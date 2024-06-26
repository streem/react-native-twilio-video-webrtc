//
//  TwilioVideo.js
//  Black
//
//  Created by Martín Fernández on 6/13/17.
//
//

import { Component } from "react";
import PropTypes from "prop-types";
import { NativeModules, NativeEventEmitter, View } from "react-native";
import { toByteArray } from "base64-js";

const { TWVideoModule } = NativeModules;

export default class TwilioVideo extends Component {
  static propTypes = {
    /**
     * Called when the room has connected
     *
     * @param {{roomName, participants}}
     */
    onRoomDidConnect: PropTypes.func,
    /**
     * Called when the room has disconnected
     *
     * @param {{roomName, error}}
     */
    onRoomDidDisconnect: PropTypes.func,
    /**
     * Called when connection with room failed
     *
     * @param {{roomName, error}}
     */
    onRoomDidFailToConnect: PropTypes.func,
    /**
     * Called when a new participant has connected
     *
     * @param {{roomName, participant}}
     */
    onRoomParticipantDidConnect: PropTypes.func,
    /**
     * Called when a participant has disconnected
     *
     * @param {{roomName, participant}}
     */
    onRoomParticipantDidDisconnect: PropTypes.func,
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
     * Called when a dataTrack receives a message
     *
     * @param {{message}}
     */
    onDataTrackMessageReceived: PropTypes.func,
    /**
     * Called when a dataTrack receives a binary message
     *
     * @param {{message}}
     */
    onDataTrackBinaryMessageReceived: PropTypes.func,
    /**
     * Called when the camera has started
     *
     */
    onCameraDidStart: PropTypes.func,
    /**
     * Called when the camera has been interrupted
     *
     */
    onCameraWasInterrupted: PropTypes.func,
    /**
     * Called when the camera interruption has ended
     *
     */
    onCameraInterruptionEnded: PropTypes.func,
    /**
     * Called when the camera has stopped runing with an error
     *
     * @param {{error}} The error message description
     */
    onCameraDidStopRunning: PropTypes.func,
    /**
     * Called when stats are received (after calling getStats)
     *
     */
    onStatsReceived: PropTypes.func,
    /**
     * Called when the network quality levels of a participant have changed (only if enableNetworkQualityReporting is set to True when connecting)
     *
     */
    onNetworkQualityLevelsChanged: PropTypes.func,
    /**
     * Called when dominant speaker changes
     * @param {{ participant, room }} dominant participant
     */
    onDominantSpeakerDidChange: PropTypes.func,
    /**
     * Called when the flashlight status changes
     * @param {{ status, error }} 
     */
    onFlashlightStatusChanged: PropTypes.func,
    /**
     * Whether or not video should be automatically initialized upon mounting
     * of this component. Defaults to true. If set to false, any use of the
     * camera will require calling `_startLocalVideo`.
     */
    autoInitializeCamera: PropTypes.bool,
    /**
     * The name of the local video track to use.  Defaults to "camera".
     */
    localVideoTrackName: PropTypes.string,
    ...View.propTypes,
  };

  constructor(props) {
    super(props);

    this._subscriptions = [];
    this._eventEmitter = new NativeEventEmitter(TWVideoModule);
  }

  componentDidMount() {
    this._registerEvents();
    this._setLocalVideoTrackName(this.props.localVideoTrackName);

    if (this.props.autoInitializeCamera !== false) {
      this._startLocalVideo();
    }
    this._startLocalAudio();
  }

  componentWillUnmount() {
    this._unregisterEvents();
    this._stopLocalVideo();
    this._stopLocalAudio();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.localVideoTrackName !== this.props.localVideoTrackName) {
      this._setLocalVideoTrackName(this.props.localVideoTrackName);
    }
  }

  /**
   * Locally mute/ unmute all remote audio tracks from a given participant
   */
  setRemoteAudioPlayback({ participantSid, enabled }) {
    TWVideoModule.setRemoteAudioPlayback(participantSid, enabled);
  }

  setRemoteAudioEnabled(enabled) {
    return Promise.resolve(enabled);
  }

  setBluetoothHeadsetConnected(enabled) {
    return Promise.resolve(enabled);
  }

  setFlashlightStatus(enabled) {
    TWVideoModule.setFlashlightStatus(enabled);
  }

  /**
   * Enable or disable local video
   */
  setLocalVideoEnabled(enabled, cameraType) {
    if (!enabled) {
      // We need to explicitly wait for the local video to stop before resolving the returned promise.
      // The call to setLocalVideoEnabled() _does_ stop the camera, but it does so asynchronously.
      return Promise.resolve()
          .then(() => this._stopLocalVideo())
          .then(() => TWVideoModule.setLocalVideoEnabled(enabled, cameraType));
    } else {
      return TWVideoModule.setLocalVideoEnabled(enabled, cameraType);
    }
  }

  /**
   * Enable or disable local audio
   */
  setLocalAudioEnabled(enabled) {
    return TWVideoModule.setLocalAudioEnabled(enabled);
  }

  /**
   * Filp between the front and back camera
   */
  flipCamera() {
    TWVideoModule.flipCamera();
  }

  prepareToRebuildLocalVideoTrack(localVideoTrackName) {
    this._setLocalVideoTrackName(localVideoTrackName);
    TWVideoModule.prepareToRebuildLocalVideoTrack();
  }

  /**
   * Toggle screen sharing
   */
  toggleScreenSharing(status) {
    TWVideoModule.toggleScreenSharing(status);
  }

  /**
   * Toggle audio setup from speaker (default) and headset
   */
  toggleSoundSetup(speaker) {
    TWVideoModule.toggleSoundSetup(speaker);
  }

  /**
   * Get connection stats
   */
  getStats() {
    TWVideoModule.getStats();
  }

  /**
   * Connect to given room name using the JWT access token
   * @param  {String} roomName    The connecting room name
   * @param  {String} accessToken The Twilio's JWT access token
   * @param  {String} encodingParameters Control Encoding config
   * @param  {Boolean} enableNetworkQualityReporting Report network quality of participants
   */
  connect({
            roomName,
            accessToken,
            cameraType = "front",
            enableAudio = true,
            enableVideo = true,
            encodingParameters = null,
            enableNetworkQualityReporting = false,
            dominantSpeakerEnabled = false,
          }) {
    TWVideoModule.connect(
        accessToken,
        roomName,
        enableAudio,
        enableVideo,
        encodingParameters,
        enableNetworkQualityReporting,
        dominantSpeakerEnabled,
        cameraType
    );
  }

  /**
   * Disconnect from current room
   */
  disconnect() {
    TWVideoModule.disconnect();
  }

  /**
   * Publish a local audio track
   */
  publishLocalAudio() {
    TWVideoModule.publishLocalAudio();
  }

  /**
   * Publish a local video track
   */
  publishLocalVideo() {
    TWVideoModule.publishLocalVideo();
  }

  /**
   * Unpublish a local audio track
   */
  unpublishLocalAudio() {
    TWVideoModule.unpublishLocalAudio();
  }

  /**
   * Unpublish a local video track
   */
  unpublishLocalVideo() {
    TWVideoModule.unpublishLocalVideo();
  }

  /**
   * SendString to datatrack
   * @param  {String} message    The message string to send
   */
  sendString(message) {
    TWVideoModule.sendString(message);
  }

  captureFrame(filename) {
    TWVideoModule.captureFrame(filename);
  }

  _setLocalVideoTrackName(name) {
    TWVideoModule.setLocalVideoTrackName(name);
  }

  _startLocalVideo() {
    return TWVideoModule.startLocalVideo();
  }

  _stopLocalVideo() {
    return TWVideoModule.stopLocalVideo();
  }

  _startLocalAudio() {
    TWVideoModule.startLocalAudio();
  }

  _stopLocalAudio() {
    TWVideoModule.stopLocalAudio();
  }

  _unregisterEvents() {
    TWVideoModule.changeListenerStatus(false);
    this._subscriptions.forEach((e) => e.remove());
    this._subscriptions = [];
  }

  _registerEvents() {
    TWVideoModule.changeListenerStatus(true);
    this._subscriptions = [
      this._eventEmitter.addListener("roomDidConnect", (data) => {
        if (this.props.onRoomDidConnect) {
          this.props.onRoomDidConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomDidDisconnect", (data) => {
        if (this.props.onRoomDidDisconnect) {
          this.props.onRoomDidDisconnect(data);
        }
      }),
      this._eventEmitter.addListener("roomDidFailToConnect", (data) => {
        if (this.props.onRoomDidFailToConnect) {
          this.props.onRoomDidFailToConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomParticipantDidConnect", (data) => {
        if (this.props.onRoomParticipantDidConnect) {
          this.props.onRoomParticipantDidConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomParticipantDidDisconnect", (data) => {
        if (this.props.onRoomParticipantDidDisconnect) {
          this.props.onRoomParticipantDidDisconnect(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedVideoTrack", (data) => {
        if (this.props.onParticipantAddedVideoTrack) {
          this.props.onParticipantAddedVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedDataTrack", (data) => {
        if (this.props.onParticipantAddedDataTrack) {
          this.props.onParticipantAddedDataTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedDataTrack", (data) => {
        if (this.props.onParticipantRemovedDataTrack) {
          this.props.onParticipantRemovedDataTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedVideoTrack", (data) => {
        if (this.props.onParticipantRemovedVideoTrack) {
          this.props.onParticipantRemovedVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedAudioTrack", (data) => {
        if (this.props.onParticipantAddedAudioTrack) {
          this.props.onParticipantAddedAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedAudioTrack", (data) => {
        if (this.props.onParticipantRemovedAudioTrack) {
          this.props.onParticipantRemovedAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantEnabledVideoTrack", (data) => {
        if (this.props.onParticipantEnabledVideoTrack) {
          this.props.onParticipantEnabledVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener(
          "participantDisabledVideoTrack",
          (data) => {
            if (this.props.onParticipantDisabledVideoTrack) {
              this.props.onParticipantDisabledVideoTrack(data);
            }
          }
      ),
      this._eventEmitter.addListener("participantEnabledAudioTrack", (data) => {
        if (this.props.onParticipantEnabledAudioTrack) {
          this.props.onParticipantEnabledAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener(
          "participantDisabledAudioTrack",
          (data) => {
            if (this.props.onParticipantDisabledAudioTrack) {
              this.props.onParticipantDisabledAudioTrack(data);
            }
        }
      ),
      this._eventEmitter.addListener("dataTrackMessageReceived", (data) => {
        if (this.props.onDataTrackMessageReceived) {
          this.props.onDataTrackMessageReceived(data);
        }
      }),
      this._eventEmitter.addListener(
        "dataTrackBinaryMessageReceived",
        (data) => {
          if (this.props.onDataTrackBinaryMessageReceived) {
            const byteArray = toByteArray(data.message);
            this.props.onDataTrackBinaryMessageReceived({
              ...data,
              message: byteArray,
            });
          }
        }
      ),
      this._eventEmitter.addListener("cameraDidStart", (data) => {
        if (this.props.onCameraDidStart) {
          this.props.onCameraDidStart(data);
        }
      }),
      this._eventEmitter.addListener("cameraWasInterrupted", (data) => {
        if (this.props.onCameraWasInterrupted) {
          this.props.onCameraWasInterrupted(data);
        }
      }),
      this._eventEmitter.addListener("cameraInterruptionEnded", (data) => {
        if (this.props.onCameraInterruptionEnded) {
          this.props.onCameraInterruptionEnded(data);
        }
      }),
      this._eventEmitter.addListener("cameraDidStopRunning", (data) => {
        if (this.props.onCameraDidStopRunning) {
          this.props.onCameraDidStopRunning(data);
        }
      }),
      this._eventEmitter.addListener("statsReceived", (data) => {
        if (this.props.onStatsReceived) {
          this.props.onStatsReceived(data);
        }
      }),
      this._eventEmitter.addListener("networkQualityLevelsChanged", (data) => {
        if (this.props.onNetworkQualityLevelsChanged) {
          this.props.onNetworkQualityLevelsChanged(data);
        }
      }),
      this._eventEmitter.addListener("onDominantSpeakerDidChange", (data) => {
        if (this.props.onDominantSpeakerDidChange) {
          this.props.onDominantSpeakerDidChange(data);
        }
      }),
      this._eventEmitter.addListener("onFlashlightStatusChanged", (data) => {
        if (this.props.onFlashlightStatusChanged) {
          this.props.onFlashlightStatusChanged(data);
        }
      }),
    ];
  }

  render() {
    return this.props.children || null;
  }
}
