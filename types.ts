export interface SocialMediaPost {
  platform: 'Instagram' | 'Twitter' | 'Facebook' | 'WhatsApp' | 'TikTok';
  content: string;
  hashtags: string[];
}