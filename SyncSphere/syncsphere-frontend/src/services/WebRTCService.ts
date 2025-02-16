import { Socket } from 'socket.io-client';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
}

class WebRTCService {
  private socket: Socket;
  private userId: string;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private onMessageCallback: ((message: any) => void) | null = null;

  // STUN servers for NAT traversal
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  constructor(socket: Socket, userId: string) {
    this.socket = socket;
    this.userId = userId;
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('webrtc_offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      await this.handleOffer(data.offer, data.from);
    });

    this.socket.on('webrtc_answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      await this.handleAnswer(data.answer, data.from);
    });

    this.socket.on('webrtc_ice_candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      await this.handleNewICECandidate(data.candidate, data.from);
    });

    this.socket.on('user_joined_room', (userId: string) => {
      if (userId !== this.userId) {
        this.initiatePeerConnection(userId);
      }
    });

    this.socket.on('user_left_room', (userId: string) => {
      this.closePeerConnection(userId);
    });
  }

  private async initiatePeerConnection(targetUserId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection(this.configuration);
    const dataChannel = peerConnection.createDataChannel('chat');
    
    this.setupDataChannel(dataChannel);
    this.setupPeerConnectionListeners(peerConnection, targetUserId);

    this.peerConnections.set(targetUserId, { connection: peerConnection, dataChannel });

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.socket.emit('webrtc_offer', { offer, to: targetUserId });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, fromUserId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection(this.configuration);
    
    peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
      this.peerConnections.set(fromUserId, { 
        connection: peerConnection, 
        dataChannel: event.channel 
      });
    };

    this.setupPeerConnectionListeners(peerConnection, fromUserId);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.socket.emit('webrtc_answer', { answer, to: fromUserId });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, fromUserId: string): Promise<void> {
    const peer = this.peerConnections.get(fromUserId);
    if (peer) {
      try {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }

  private async handleNewICECandidate(candidate: RTCIceCandidateInit, fromUserId: string): Promise<void> {
    const peer = this.peerConnections.get(fromUserId);
    if (peer) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }

  private setupPeerConnectionListeners(peerConnection: RTCPeerConnection, targetUserId: string): void {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc_ice_candidate', {
          candidate: event.candidate,
          to: targetUserId,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        this.closePeerConnection(targetUserId);
      }
    };
  }

  private setupDataChannel(dataChannel: RTCDataChannel): void {
    dataChannel.onmessage = (event) => {
      if (this.onMessageCallback) {
        try {
          const message = JSON.parse(event.data);
          this.onMessageCallback(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  public sendMessage(message: any): void {
    this.peerConnections.forEach((peer) => {
      if (peer.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(message));
      }
    });
  }

  public onMessage(callback: (message: any) => void): void {
    this.onMessageCallback = callback;
  }

  private closePeerConnection(userId: string): void {
    const peer = this.peerConnections.get(userId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
      this.peerConnections.delete(userId);
    }
  }

  public closeAllConnections(): void {
    this.peerConnections.forEach((_, userId) => {
      this.closePeerConnection(userId);
    });
  }
}

export default WebRTCService; 