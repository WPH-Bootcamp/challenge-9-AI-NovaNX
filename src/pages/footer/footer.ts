import facebookIconUrl from "../../assets/images/FacebookMobile.svg";
import instagramIconUrl from "../../assets/images/InstagramMobile.svg";
import linkedinIconUrl from "../../assets/images/linkedlnMobile.svg";
import tiktokIconUrl from "../../assets/images/TiktokMobile.svg";

export type SocialLink = {
  label: string;
  href: string;
  iconUrl: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Facebook", href: "#", iconUrl: facebookIconUrl },
  { label: "Instagram", href: "#", iconUrl: instagramIconUrl },
  { label: "LinkedIn", href: "#", iconUrl: linkedinIconUrl },
  { label: "TikTok", href: "#", iconUrl: tiktokIconUrl },
];

export const EXPLORE_LINKS: FooterLink[] = [
  { label: "All Food", href: "#" },
  { label: "Nearby", href: "#" },
  { label: "Discount", href: "#" },
  { label: "Best Seller", href: "#" },
  { label: "Delivery", href: "#" },
  { label: "Lunch", href: "#" },
];

export const HELP_LINKS: FooterLink[] = [
  { label: "How to Order", href: "#" },
  { label: "Payment Methods", href: "#" },
  { label: "Track My Order", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Contact Us", href: "#" },
];
