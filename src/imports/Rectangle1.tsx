export default function Rectangle() {
  return (
    <div className="backdrop-blur-[21px] relative rounded-[40px] size-full" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 194 311\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'1\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(19.021 29.985 -18.704 81.362 3.7854 11.151)\'><stop stop-color=\'rgba(255,255,255,0.4)\' offset=\'0\'/><stop stop-color=\'rgba(255,255,255,0)\' offset=\'1\'/></radialGradient></defs></svg>')" }}>
      <div aria-hidden="true" className="absolute border-[#151515] border-[3.5px] border-solid inset-[-3.5px] pointer-events-none rounded-[43.5px]" />
    </div>
  );
}