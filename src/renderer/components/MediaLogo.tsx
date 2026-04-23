import { useMemo, useState } from "react";

type Props = {
  src?: string;
  name: string;
  className?: string;
};

function normaliseLogoUrl(src: string | undefined) {
  const value = src?.trim();
  if (!value) {
    return undefined;
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  return undefined;
}

function initials(name: string) {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return (parts.map((part) => part[0]).join("") || "?").toUpperCase();
}

export function MediaLogo({ src, name, className }: Props) {
  const [failed, setFailed] = useState(false);
  const logoUrl = useMemo(() => normaliseLogoUrl(src), [src]);
  const showImage = Boolean(logoUrl && !failed);

  return (
    <div className={`media-logo ${className ?? ""}`.trim()}>
      {showImage ? (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
