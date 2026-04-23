export function TvIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm7-4 4 4h-2.4L12 5.4 10.4 7H8l4-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4a1 1 0 0 1 1 1v1.1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-5a1 1 0 0 1 0 2h-1.1a1 1 0 1 1 0-2H19ZM7.2 7.2a1 1 0 0 1 0 1.4l-.8.8A1 1 0 0 1 5 8l.8-.8a1 1 0 0 1 1.4 0Zm10.8 9.4.8.8a1 1 0 0 1-1.4 1.4l-.8-.8a1 1 0 0 1 1.4-1.4ZM12 17.9a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1.1a1 1 0 0 1 1-1ZM5 11a1 1 0 1 1 0 2H3.9a1 1 0 0 1 0-2H5Zm1.4 5.6a1 1 0 0 1 1.4 0 1 1 0 0 1 0 1.4l-.8.8a1 1 0 0 1-1.4-1.4l.8-.8Zm11.2-8.8a1 1 0 0 1 1.4 0l.8.8A1 1 0 1 1 18.4 10l-.8-.8a1 1 0 0 1 0-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.6 3.2a1 1 0 0 1 .8 1.6A8 8 0 1 0 19.2 16a1 1 0 0 1 1.6.8A10 10 0 1 1 14.6 3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.8 4a6.8 6.8 0 0 1 5.42 10.9l3.44 3.44a1 1 0 0 1-1.42 1.42l-3.44-3.44A6.8 6.8 0 1 1 10.8 4Zm0 2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13a1.5 1.5 0 0 1 1.16 2.45L15 13.15V18a1 1 0 0 1-.55.9l-4 2A1 1 0 0 1 9 20v-6.85l-4.66-5.7A1.5 1.5 0 0 1 4 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.2 10.8 19C6.4 15.1 3.5 12.5 3.5 9.2A4.6 4.6 0 0 1 8.2 4.5c1.5 0 2.9.7 3.8 1.8a5 5 0 0 1 3.8-1.8 4.6 4.6 0 0 1 4.7 4.7c0 3.3-2.9 5.9-7.3 9.8L12 20.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}
