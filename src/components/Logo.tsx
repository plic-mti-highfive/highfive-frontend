import { Link } from 'react-router-dom'

type LogoProps = {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      className={`font-display italic font-black text-ink leading-none select-none hover:opacity-80 transition-opacity ${className}`}
      style={{ fontFamily: "'Fraunces Variable', serif", fontStyle: 'italic', fontWeight: 900 }}
    >
      HighFive<span className="text-rose">!</span>
    </Link>
  )
}
