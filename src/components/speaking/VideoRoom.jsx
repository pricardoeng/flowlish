"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function VideoRoom({ roomId, userName, userId }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper method to gracefully escape the session
  const exitRoom = () => {
    // Ideally here we would call a server action to reward XP based on call duration!
    router.push('/');
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-bold">Iniciando câmera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-zinc-950 flex flex-col pt-4">
      {/* Small top header for navigation to avoid getting completely trapped */}
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" className="text-white hover:bg-zinc-800" onClick={exitRoom}>
          <ArrowLeft size={18} className="mr-2" /> Encerrar Prática
        </Button>
      </div>

      <div className="h-full w-full">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          }}
          userInfo={{
            displayName: userName || 'Estudante Flowlish',
            email: `${userId}@flowlish.dev`
          }}
          onApiReady={(externalApi) => {
            // When user hangs up standardly using Jitsi red button
            externalApi.addListener('videoConferenceLeft', () => {
              exitRoom();
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </div>
  );
}
