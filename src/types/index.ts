export type MediaType = 'text' | 'photo' | 'video';

export interface Prediction {
  id: number;
  userId: string;
  username: string;
  displayName: string;
  userAvatar?: string;
  userTitle?: string;
  userBlueTick?: boolean;
  userGreyTick?: boolean;
  date: string;
  question: string;
  description?: string;
  endDate: string;
  mediaType: MediaType;
  mediaUrl?: string;
  videoThumbnail?: string;
  xpPool: string;
  xcPool: string;
  yesPercentXP: number;
  noPercentXP: number;
  yesPercentXC: number;
  noPercentXC: number;
  yesMultiplier: string;
  noMultiplier: string;
  comments: number;
  reposts: number;
  likes: number;
  isLiked?: boolean;
  isReposted?: boolean;
  category: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  followers: number;
  following: number;
  xp: string;
  xc: string;
  predictions: number;
  accuracy: number;
  isFollowing?: boolean;
  joinedDate: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  predictions: number;
  avatar?: string;
  banner?: string;
  isJoined?: boolean;
}
