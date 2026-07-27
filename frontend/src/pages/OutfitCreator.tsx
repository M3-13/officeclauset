export default function OutfitCreator() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-6" />
        <h1 className="font-heading text-scale-3xl text-accent text-center mb-4"
          style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}>
          Outfit-Creator
        </h1>
        <p className="text-fg-muted text-center">
          Kombinieren Sie Ihre Lieblingsstücke. Wird in Ticket #2 implementiert.
        </p>
      </div>
    </div>
  );
}
