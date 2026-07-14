import { Link } from "react-router-dom";

type LogoProps = {
  className?: string;
  textColor?: string;
};

export default function Logo({
  className = "",
  textColor = "text-cream",
}: LogoProps) {
  return (
    <Link
      to="/"
      className={`font-display italic font-black ${textColor} leading-none select-none hover:opacity-80 transition-opacity ${className}`}
      style={{
        fontFamily: "'Fraunces Variable', serif",
        fontStyle: "italic",
        fontWeight: 900,
      }}
    >
      HighFive<span className="text-rose">!</span>
    </Link>
  );
}
