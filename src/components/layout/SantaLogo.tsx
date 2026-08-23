export default function SantaLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="21" r="12" fill="#FFD9B3" />
      <path
        d="M8 21c0-6.6 5.4-12 12-12s12 5.4 12 12H8z"
        fill="#ffffff"
      />
      <path
        d="M6 20C6 11.7 12.7 5 21 5c5 0 9.4 2.4 12.1 6.1.8 1.1-.1 2.6-1.4 2.4-2.3-.4-5.6-.6-9.7.6-6 1.7-10.6 5.6-13 8.2-1 1.1-2.9.5-3-.9V20z"
        fill="#D94A3D"
      />
      <circle cx="34" cy="12.5" r="2.6" fill="#ffffff" />
      <circle cx="15.5" cy="23" r="1.6" fill="#2a2a2a" />
      <circle cx="24.5" cy="23" r="1.6" fill="#2a2a2a" />
      <circle cx="13" cy="27" r="2" fill="#F4897A" />
      <circle cx="27" cy="27" r="2" fill="#F4897A" />
      <path
        d="M11 28c1.5 4.5 5.2 7.5 9 7.5s7.5-3 9-7.5c-3 2.2-6 3-9 3s-6-.8-9-3z"
        fill="#ffffff"
      />
    </svg>
  );
}
