interface UnderConstructionModalProps {
  itemName: string;
  onClose: () => void;
}

export default function UnderConstructionModal({
  itemName,
  onClose,
}: UnderConstructionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.85)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="under-construction.dialog"
    >
      <div
        className="relative rounded-xl p-8 max-w-sm w-full mx-4 text-center"
        style={{
          background: "#1a2540",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Gold decorative bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, #c9a84c, transparent)",
          }}
        />

        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "2px solid rgba(201,168,76,0.3)",
          }}
        >
          <span style={{ fontSize: 28 }}>🚧</span>
        </div>

        {/* Section name */}
        <p className="text-xs font-mono mb-1" style={{ color: "#8a9bb5" }}>
          {itemName}
        </p>

        {/* Headline */}
        <h2
          className="text-2xl font-display font-bold mb-2"
          style={{ color: "#f5f0e8" }}
        >
          Under Construction
        </h2>

        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "#8a9bb5" }}
        >
          This section is coming soon. Check back after the next update.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-smooth"
          style={{
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#c9a84c",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(201,168,76,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(201,168,76,0.15)";
          }}
          data-ocid="under-construction.close_button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
