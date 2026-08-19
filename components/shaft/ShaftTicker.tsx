"use client";

const TECH_ITEMS = [
  "AI AGENTS", "MCP SERVERS", "LLM ORCHESTRATION", "BEHAVIORAL PSYCHOLOGY",
  "FULL-STACK SYSTEMS", "AUTOMATION WORKFLOWS", "VECTOR DATABASES",
  "REINFORCEMENT LEARNING", "PRODUCT STRATEGY", "RAPID PROTOTYPING",
];

export default function ShaftTicker() {
  return (
    <section
      // The list is repeated three times to make the scroll seamless, so a
      // screen reader would read every item three times over for no benefit.
      // It's decoration; the same words appear as real content further down.
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y py-4"
      style={{ 
        borderColor: "rgb(var(--shaft-border))",
        backgroundColor: "rgb(var(--shaft-bg))"
      }}
    >
      <div className="flex whitespace-nowrap shaft-ticker">
        {/* Triple items for seamless loop */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center">
            {TECH_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <span 
                  className="font-space-mono text-[9px] tracking-[0.4em] uppercase px-12"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  {item}
                </span>
                <div 
                  className="w-1 h-1 shrink-0 rounded-full"
                  style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Editorial side annotations — using shaft-bg for the fade */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-32 z-10 pointer-events-none" 
        style={{ background: "linear-gradient(to right, rgb(var(--shaft-bg)), transparent)" }}
      />
      <div 
        className="absolute top-0 bottom-0 right-0 w-32 z-10 pointer-events-none" 
        style={{ background: "linear-gradient(to left, rgb(var(--shaft-bg)), transparent)" }}
      />
    </section>
  );
}
