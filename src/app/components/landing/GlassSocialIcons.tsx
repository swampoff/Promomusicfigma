import svgPaths from "../../../imports/svg-54whsdyszv";

/* ── Shared glass card wrapper ── */
function GlassCard({
  children,
  glowColor,
  shadowColor,
}: {
  children: React.ReactNode;
  glowColor: string;
  shadowColor: string;
}) {
  return (
    <div
      className="backdrop-blur-[10px] relative rounded-[10px] shrink-0 w-[36px] h-[36px] cursor-pointer group transition-transform hover:scale-110"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(248,251,255,0.06) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <div className="relative w-full h-full overflow-clip rounded-[inherit] flex items-center justify-center">
        {children}
        {/* Bottom ellipse glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20px] h-[10px] pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-[6px] opacity-60"
            style={{ backgroundColor: glowColor }}
          />
        </div>
      </div>
      {/* Inner shadow */}
      <div
        className="absolute inset-[-0.4px] pointer-events-none rounded-[inherit]"
        style={{ boxShadow: `inset 0px 0px 6px 0px ${shadowColor}` }}
      />
      {/* Border */}
      <div
        aria-hidden="true"
        className="absolute border-[0.6px] border-solid inset-[-0.3px] pointer-events-none rounded-[10.3px]"
        style={{
          borderColor: "rgba(216,216,216,0.05)",
          boxShadow: "6px 3px 12px 0px rgba(0,0,0,0.08)",
        }}
      />
    </div>
  );
}

/* ── Telegram ── */
export function GlassTelegram() {
  return (
    <GlassCard glowColor="#1893D1" shadowColor="rgba(13,180,252,0.32)">
      <svg
        className="block w-[24px] h-[24px]"
        fill="none"
        viewBox="0 0 32 32"
      >
        <circle
          cx="16"
          cy="16"
          fill="url(#glass-tg-bg)"
          r="14"
        />
        <path d={svgPaths.p8969330} fill="white" />
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="glass-tg-bg"
            x1="16"
            x2="16"
            y1="2"
            y2="30"
          >
            <stop stopColor="#37BBFE" />
            <stop offset="1" stopColor="#007DBB" />
          </linearGradient>
        </defs>
      </svg>
    </GlassCard>
  );
}

/* ── YouTube ── */
export function GlassYoutube() {
  return (
    <GlassCard glowColor="#FC0D1B" shadowColor="rgba(252,13,27,0.32)">
      <svg
        className="block w-[24px] h-[24px]"
        fill="none"
        viewBox="0 0 32 32"
      >
        <path d={svgPaths.p20338400} fill="#FC0D1B" />
        <path d="M13 12V20L21 16L13 12Z" fill="white" />
      </svg>
    </GlassCard>
  );
}

/* ── VK (custom glass icon, same style) ── */
export function GlassVK() {
  return (
    <GlassCard glowColor="#4680C2" shadowColor="rgba(70,128,194,0.32)">
      <svg
        className="block w-[24px] h-[24px]"
        fill="none"
        viewBox="0 0 32 32"
      >
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#glass-vk-bg)" />
        <path
          d="M16.87 22.56c-5.17 0-8.12-3.54-8.24-9.44h2.59c.08 4.33 2 6.16 3.52 6.54V13.12h2.44v3.73c1.5-.16 3.07-1.86 3.6-3.73h2.44c-.41 1.46-1.67 3.16-2.63 3.72.96.44 2.4 1.94 2.96 3.72h-2.68c-.44-1.36-1.53-2.81-3.69-3.02v3.02h-.31z"
          fill="white"
        />
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="glass-vk-bg"
            x1="16"
            x2="16"
            y1="2"
            y2="30"
          >
            <stop stopColor="#4C75A3" />
            <stop offset="1" stopColor="#3A5D8C" />
          </linearGradient>
        </defs>
      </svg>
    </GlassCard>
  );
}