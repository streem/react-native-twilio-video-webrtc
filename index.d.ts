declare module 'react-native-twilio-video-webrtc' {
  import { ViewProps } from 'react-native';
  import React from 'react';

  export interface TrackIdentifier {
    participantSid: string;
    videoTrackSid: string;
  }

  type scaleType = 'fit' | 'fill';
  type cameraType = 'front' | 'back';

  interface TwilioVideoParticipantViewProps extends ViewProps {
    trackIdentifier: TrackIdentifier;
    ref?: React.Ref<any>;
    scaleType?: scaleType;
  }

  interface TwilioVideoLocalViewProps extends ViewProps {
    enabled: boolean;
    ref?: React.Ref<any>;
    scaleType?: scaleType;
  }

  interface Participant {
    sid: string;
    identity: string;
  }

  interface Track {
    enabled: boolean;
    trackName: string;
    trackSid: string;
  }

  export interface TrackEventCbArgs {
    participant: Participant;
    track: Track;
  }

  export type TrackEventCb = (t: TrackEventCbArgs) => void;

  export interface DataTrackEventCbArgs {
    message: string;
    trackSid: string;
  }

  export interface DataTrackBinaryEventCbArgs {
    message: Uint8Array;
    trackSid: string;
  }

  export type DataTrackEventCb = (t: DataTrackEventCbArgs) => void;
  export type DataTrackBinaryEventCb = (t: DataTrackBinaryEventCbArgs) => void;

  interface RoomEventCommonArgs {
    roomName: string;
    roomSid: string;
  }

  export type RoomErrorEventArgs = RoomEventCommonArgs & {
    error: any;
    errorCode: string,
  };

  type RoomEventArgs = RoomEventCommonArgs & {
    participants: Participant[];
    localParticipant: Participant;
  };

  type ParticipantEventArgs = RoomEventCommonArgs & {
    participant: Participant;
  };

  type NetworkLevelChangeEventArgs = {
    participant: Participant;
    isLocalUser: boolean;
    quality: number;
  };

  export type RoomEventCb = (p: RoomEventArgs) => void;
  export type RoomErrorEventCb = (t: RoomErrorEventArgs) => void;

  export type ParticipantEventCb = (p: ParticipantEventArgs) => void;

  export type NetworkLevelChangeEventCb = (
    p: NetworkLevelChangeEventArgs,
  ) => void;

  export type FlashlightStatusChangedEventArgs = { status: string };

  export type FlashlightStatusChangedEventCb = (
    p: FlashlightStatusChangedEventArgs
  ) => void;

  export type DominantSpeakerChangedEventArgs = RoomEventCommonArgs & {
    participant: Participant;
  };

  export type DominantSpeakerChangedCb = (
    d: DominantSpeakerChangedEventArgs,
  ) => void;

  export type LocalParticipantSupportedCodecsCbEventArgs = {
    supportedCodecs: Array<string>;
  };

  export type LocalParticipantSupportedCodecsCb = (
    d: LocalParticipantSupportedCodecsCbEventArgs,
  ) => void;

  export type TwilioVideoProps = ViewProps & {
    onCameraDidStart?: () => void;
    onCameraDidStopRunning?: (err: any) => void;
    onCameraWasInterrupted?: () => void;
    onDominantSpeakerDidChange?: DominantSpeakerChangedCb;
    onParticipantAddedAudioTrack?: TrackEventCb;
    onParticipantAddedVideoTrack?: TrackEventCb;
    onParticipantDisabledVideoTrack?: TrackEventCb;
    onParticipantDisabledAudioTrack?: TrackEventCb;
    onParticipantEnabledVideoTrack?: TrackEventCb;
    onParticipantEnabledAudioTrack?: TrackEventCb;
    onParticipantRemovedAudioTrack?: TrackEventCb;
    onParticipantRemovedVideoTrack?: TrackEventCb;
    onParticipantAddedDataTrack?: TrackEventCb;
    onParticipantRemovedDataTrack?: TrackEventCb;
    onRoomDidConnect?: RoomEventCb;
    onFlashlightStatusChanged?: FlashlightStatusChangedEventCb;
    onRoomDidDisconnect?: RoomErrorEventCb;
    onRoomDidFailToConnect?: RoomErrorEventCb;
    onRoomParticipantDidConnect?: ParticipantEventCb;
    onRoomParticipantDidDisconnect?: ParticipantEventCb;
    onNetworkQualityLevelsChanged?: NetworkLevelChangeEventCb;
    onLocalParticipantSupportedCodecs?: LocalParticipantSupportedCodecsCb;
    onStatsReceived?: (data: any) => void;
    onDataTrackMessageReceived?: DataTrackEventCb;
    onDataTrackBinaryMessageReceived?: DataTrackBinaryEventCb;

    localVideoTrackName?: string;
    // iOS only
    autoInitializeCamera?: boolean;
    ref?: React.Ref<any>;
  };

  type iOSConnectParams = {
    roomName?: string;
    accessToken: string;
    cameraType?: cameraType;
    dominantSpeakerEnabled?: boolean;
    enableAudio?: boolean;
    enableVideo?: boolean;
    encodingParameters?: {
      enableH264Codec?: boolean;
      // if audioBitrate OR videoBitrate is provided, you must provide both
      audioBitrate?: number;
      videoBitrate?: number;
    };
    enableNetworkQualityReporting?: boolean;
  };

  type androidConnectParams = {
    roomName?: string;
    accessToken: string;
    cameraType?: cameraType;
    dominantSpeakerEnabled?: boolean;
    enableAudio?: boolean;
    enableVideo?: boolean;
    enableRemoteAudio?: boolean;
    encodingParameters?: {
      enableH264Codec?: boolean;
    };
    enableNetworkQualityReporting?: boolean;
    maintainVideoTrackInBackground?: boolean;
  };

  class TwilioVideo extends React.Component<TwilioVideoProps> {
    setLocalVideoEnabled: (
      enabled: boolean,
      cameraType?: cameraType,
    ) => Promise<boolean>;
    setLocalAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setBluetoothHeadsetConnected: (enabled: boolean) => Promise<boolean>;
    connect: (options: iOSConnectParams | androidConnectParams) => void;
    disconnect: () => void;
    flipCamera: () => void;
    toggleSoundSetup: (speaker: boolean) => void;
    setFlashlightStatus: (enabled: boolean) => void;
    getStats: () => void;
    publishLocalAudio: () => void;
    unpublishLocalAudio: () => void;
    publishLocalVideo: () => void;
    unpublishLocalVideo: () => void;
    sendString: (message: string) => void;

    /**
     * Prepares the local video track so that it can receive a new name.  The local
     * video should be unpublished and disabled before calling this method, and you
     * will need to enable and publish the video track for it to take effect.
     *
     * @param {string} localVideoTrackName - The new name for the local video track,
     * which should match the prop of the same name.  This is needed here to deal with
     * platform oddities around when the prop gets sent to the native side... :-/
     */
    prepareToRebuildLocalVideoTrack: (localVideoTrackName: string) => void;
    /**
     * Send a capture frame request to the native `TwilioVideoLocalView`.
     *
     * The native view then captures the frame and saves it to the apps document directory as a `.jpeg` file.
     *
     * An event is emitted to JS when the captured frame is saved.
     *
     * Listen to JS event via `DeviceEventEmitter.addListener('onFrameCaptured', ({filename}) => { // code here })`.
     *
     * `import { DeviceEventEmitter } from 'react-native';`
     */
    captureFrame: (filename: string) => void;
  }

  class TwilioVideoLocalView extends React.Component<TwilioVideoLocalViewProps> {}

  class TwilioVideoParticipantView extends React.Component<TwilioVideoParticipantViewProps> {}

  export { TwilioVideoLocalView, TwilioVideoParticipantView, TwilioVideo };
}
