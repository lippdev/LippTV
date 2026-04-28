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

export function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 12.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12.75Z" fill="currentColor" />
    </svg>
  );
}

export function MaximizeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.75 6A1.75 1.75 0 0 0 6 7.75v8.5C6 17.22 6.78 18 7.75 18h8.5A1.75 1.75 0 0 0 18 16.25v-8.5A1.75 1.75 0 0 0 16.25 6h-8.5Zm0 1.5h8.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.75 7A1.75 1.75 0 0 0 8 8.75v6.5C8 16.22 8.78 17 9.75 17h6.5A1.75 1.75 0 0 0 18 15.25v-6.5A1.75 1.75 0 0 0 16.25 7h-6.5Zm0 1.5h6.5a.25.25 0 0 1 .25.25v6.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25v-6.5a.25.25 0 0 1 .25-.25Z"
        fill="currentColor"
      />
      <path
        d="M7.75 9A1.75 1.75 0 0 1 9 9.52V11h-1.5V9.75a.25.25 0 0 1 .25-.25H9V8H7.75A1.75 1.75 0 0 0 6 9.75V16.25C6 17.22 6.78 18 7.75 18H14v-1.5H7.75a.25.25 0 0 1-.25-.25V9.75A.25.25 0 0 1 7.75 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.28 7.22a.75.75 0 0 1 1.06 0L12 10.94l3.66-3.72a.75.75 0 1 1 1.08 1.04L13.06 12l3.68 3.74a.75.75 0 1 1-1.08 1.04L12 13.06l-3.66 3.72a.75.75 0 1 1-1.08-1.04L10.94 12 7.22 8.26a.75.75 0 0 1 .06-1.04Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4.35 4.5 10v8.25c0 .69.56 1.25 1.25 1.25H10v-5.25c0-.69.56-1.25 1.25-1.25h1.5c.69 0 1.25.56 1.25 1.25v5.25h4.25c.69 0 1.25-.56 1.25-1.25V10L12 4.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlaylistsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.75 6a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75Zm0 5.25a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75ZM6 16.5c0-.41.34-.75.75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 16.5Zm11.1-1.82a.75.75 0 0 1 1.15.64v3.36a.75.75 0 0 1-1.15.64l-2.63-1.68a.75.75 0 0 1 0-1.28l2.63-1.68Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function VideoCollectionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.75 5A1.75 1.75 0 0 0 4 6.75v10.5C4 18.22 4.78 19 5.75 19h12.5A1.75 1.75 0 0 0 20 17.25V6.75A1.75 1.75 0 0 0 18.25 5H5.75Zm.25 1.75c0-.14.11-.25.25-.25h11.5c.14 0 .25.11.25.25v10.5a.25.25 0 0 1-.25.25H6.25a.25.25 0 0 1-.25-.25V6.75Zm3 1.25a.75.75 0 0 0-.75.75v6.5a.75.75 0 0 0 1.12.66l5.25-3.25a.75.75 0 0 0 0-1.28L9.37 8.11A.75.75 0 0 0 9 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7.75C4 6.78 4.78 6 5.75 6h3.18c.46 0 .89.21 1.18.57l.64.8c.14.17.35.28.57.28h6.93c.97 0 1.75.78 1.75 1.75v7.85c0 .97-.78 1.75-1.75 1.75H5.75A1.75 1.75 0 0 1 4 17.25V7.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 8.75A3.25 3.25 0 1 0 12 15.25 3.25 3.25 0 0 0 12 8.75Zm7.25 3.17v.16c0 .57-.41 1.06-.98 1.16l-.71.12a5.92 5.92 0 0 1-.57 1.37l.42.58c.34.46.29 1.1-.12 1.5l-.11.11c-.4.41-1.04.46-1.5.12l-.58-.42c-.43.24-.89.43-1.37.57l-.12.71c-.1.57-.59.98-1.16.98h-.16c-.57 0-1.06-.41-1.16-.98l-.12-.71a5.92 5.92 0 0 1-1.37-.57l-.58.42c-.46.34-1.1.29-1.5-.12l-.11-.11c-.41-.4-.46-1.04-.12-1.5l.42-.58a5.92 5.92 0 0 1-.57-1.37l-.71-.12a1.18 1.18 0 0 1-.98-1.16v-.16c0-.57.41-1.06.98-1.16l.71-.12c.14-.48.33-.94.57-1.37l-.42-.58a1.18 1.18 0 0 1 .12-1.5l.11-.11c.4-.41 1.04-.46 1.5-.12l.58.42c.43-.24.89-.43 1.37-.57l.12-.71c.1-.57.59-.98 1.16-.98h.16c.57 0 1.06.41 1.16.98l.12.71c.48.14.94.33 1.37.57l.58-.42c.46-.34 1.1-.29 1.5.12l.11.11c.41.4.46 1.04.12 1.5l-.42.58c.24.43.43.89.57 1.37l.71.12c.57.1.98.59.98 1.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}
