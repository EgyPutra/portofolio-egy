export default function Loading() {
  return (
    <div
      className="shell loading-state"
      role="status"
      aria-label="Sedang memuat halaman"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-photo" />
      <span className="sr-only">Sedang memuat...</span>
    </div>
  );
}
