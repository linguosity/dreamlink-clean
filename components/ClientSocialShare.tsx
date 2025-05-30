'use client';

import dynamic from 'next/dynamic';

// Import SocialShare as a client component
const SocialShare = dynamic(() => import("@/components/SocialShare"), { ssr: false });

interface ClientSocialShareProps {
  url: string;
  title: string;
  size?: number;
  faded?: boolean;
}

export default function ClientSocialShare(props: ClientSocialShareProps) {
  return <SocialShare {...props} />;
}