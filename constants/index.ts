import { FeatureItem, FAQItem, BadgeItem } from '@/types';

export const APP_CONFIG = {
  name: 'Kyvo',
  tagline: 'One Link. Everywhere.',
  description: 'Create your personal page, share custom social media, portfolio, store, and video links in one beautiful place.',
  url: 'https://kyvo.fun',
};

export const COLOR_PALETTE = {
  primary: '#3B82F6',    // Blue
  secondary: '#FF4D6D',  // Pink/Red
  yellow: '#FFD43B',     // Yellow
  purple: '#A855F7',     // Purple
  green: '#51CF66',      // Green
  background: '#F8F9FA', // Off-White
  text: '#111111',       // Black
  border: '#111111',     // Black
};

export const DEMO_BADGES: BadgeItem[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Early Adopter',
    description: 'Free Event Badge for early Kyvo creators!',
    icon: 'Rocket',
    color: '#FFFFFF',
    bg_color: '#FF4D6D',
    is_event: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Verified Creator',
    description: 'Verified authentic creator badge',
    icon: 'Sparkles',
    color: '#111111',
    bg_color: '#FFD43B',
    is_event: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: 'Kyvo VIP',
    description: 'VIP creator member badge',
    icon: 'Crown',
    color: '#FFFFFF',
    bg_color: '#A855F7',
    is_event: false,
    created_at: new Date().toISOString(),
  },
];

export const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
];

export const FEATURES: FeatureItem[] = [
  {
    id: 'analytics',
    title: 'Real-time Analytics',
    description: 'Track clicks, profile views, traffic sources, and audience engagement with live insights.',
    iconName: 'BarChart3',
    badge: 'Insights',
    bgColor: '#FFD43B',
  },
  {
    id: 'qr-code',
    title: 'Instant QR Code',
    description: 'Generate a downloadable, high-res Neobrutalist QR code to share your Kyvo page anywhere offline.',
    iconName: 'QrCode',
    badge: 'Sharing',
    bgColor: '#FF4D6D',
  },
  {
    id: 'social-icons',
    title: 'Rich Social Icons',
    description: 'Connect 30+ platforms including Instagram, TikTok, YouTube, GitHub, LinkedIn, Spotify & more.',
    iconName: 'Share2',
    badge: 'Integrations',
    bgColor: '#A855F7',
  },
];

export const FAQS: FAQItem[] = [
  {
    question: 'What is Kyvo?',
    answer: 'Kyvo is a modern link-in-bio platform designed with bold Neobrutalism aesthetics. It allows creators, professionals, and brands to aggregate all their social media links, content, shop items, and portfolio in one single link.',
  },
  {
    question: 'How do I claim my unique Kyvo URL?',
    answer: 'Simply click "Get Started" and log in with your Google Account. Kyvo will automatically reserve your personalized URL at kyvo.fun/your-username.',
  },
  {
    question: 'Is Kyvo free to use?',
    answer: 'Yes! Kyvo offers link creation, customization options, QR code generation, and analytics for free.',
  },
  {
    question: 'Can I customize my page colors and design?',
    answer: 'Absolutely. Kyvo features high-contrast Neobrutalism themes with curated color palettes (Blue, Pink, Yellow, Purple, Green) and custom avatar styles.',
  },
  {
    question: 'Where can I share my Kyvo link?',
    answer: 'You can put your Kyvo URL in your Instagram bio, TikTok profile, Twitter/X bio, YouTube video descriptions, email signatures, or business cards.',
  },
];
