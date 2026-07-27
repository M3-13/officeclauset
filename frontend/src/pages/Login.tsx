export default function Login() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,215,0,0.06) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 w-full max-w-[440px] mx-4 bg-bg-card border border-border-gold/25 rounded-xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <h2 className="font-heading text-scale-2xl text-accent text-center mb-8">
          Login
        </h2>
        <p className="text-fg-muted text-center text-scale-sm">
          Login-Funktionalität wird in Ticket #1 implementiert.
        </p>
      </div>
    </div>
  );
}
