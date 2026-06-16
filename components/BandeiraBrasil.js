// Mini bandeira do Brasil (SVG). Passe className="cc-bandeira" para ela
// tremular no hover quando estiver dentro de um elemento com a classe ".cc-copa".
export default function BandeiraBrasil({ className = "", width = 18, height = 13 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 20"
      width={width}
      height={height}
      aria-label="Bandeira do Brasil"
    >
      <rect width="28" height="20" fill="#009739" />
      <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#FEDD00" />
      <circle cx="14" cy="10" r="4.1" fill="#002776" />
    </svg>
  );
}
