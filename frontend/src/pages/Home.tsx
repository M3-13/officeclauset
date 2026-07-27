import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,215,0,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="mb-8">
          <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent" />
          <div className="flex justify-center -mt-2 mb-4">
            <div className="w-1 h-1 bg-accent rotate-45" />
          </div>
        </div>

        <h1 className="font-heading text-scale-4xl md:text-7xl text-accent mb-6 tracking-wide"
          style={{ textShadow: "0 0 40px rgba(255,215,0,0.3)" }}>
          OfficeClauset
        </h1>

        <p className="text-fg-muted text-scale-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Ihr glamouröser Kleiderschrank-Manager im Hollywood-Stil. Organisieren Sie
          Ihre Garderobe, kombinieren Sie Outfits und treten Sie auf wie ein Star —
          jeden Tag.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-accent text-bg font-semibold uppercase tracking-wider rounded-md min-h-[48px] leading-[24px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] hover:scale-[1.03] transition-all duration-250 active:scale-[0.97]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-block px-8 py-3 border-[1.5px] border-accent text-accent font-medium uppercase tracking-wider rounded-md min-h-[48px] leading-[24px] hover:bg-accent/8 hover:border-accent-glow hover:text-accent-glow hover:shadow-[0_0_16px_rgba(255,215,0,0.2)] transition-all duration-250"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
