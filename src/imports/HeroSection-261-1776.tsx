import svgPaths from "./svg-2dp86otbls";
import img1000F645546712ClV1SoTwMf2K99Veh5CVx7TVQc38K6Hp1 from "figma:asset/b7d1667f0950310f363210f862d397782b867e87.png";

function BasilSearchOutline() {
  return (
    <div className="relative size-[25px]" data-name="basil:search-outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="basil:search-outline">
          <path clipRule="evenodd" d={svgPaths.p27b34300} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0">
      <p className="font-['Vazirmatn:Light',sans-serif] font-light leading-[normal] opacity-60 relative shrink-0 text-[12px] text-white">Search For Musics, Artists, ...</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-h-px min-w-px relative">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <BasilSearchOutline />
        </div>
      </div>
      <Frame1 />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="bg-[#1f1f1f] flex-[1_0_0] h-[38px] min-h-px min-w-px relative rounded-[10px]" data-name="Search bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[8px] py-[6px] relative size-full">
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex font-['Vazirmatn:Medium',sans-serif] font-medium items-center justify-between leading-[normal] relative shrink-0 text-[16px] text-center text-white w-full whitespace-pre-wrap">
      <p className="flex-[1_0_0] min-h-px min-w-px relative">About Us</p>
      <p className="flex-[1_0_0] min-h-px min-w-px relative">Contact</p>
      <p className="flex-[1_0_0] min-h-px min-w-px relative">Premuim</p>
    </div>
  );
}

function Titles() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px relative" data-name="Titles">
      <Frame2 />
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[4px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#ee10b0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[6px] relative size-full">
          <p className="font-['Vazirmatn:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#ee10b0] text-[14px] text-center text-shadow-[0px_2px_4px_rgba(0,0,0,0.2)]" dir="auto">
            Login
          </p>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#ee10b0] flex-[1_0_0] h-[36px] min-h-px min-w-px relative rounded-[4px]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[6px] relative size-full">
          <p className="font-['Vazirmatn:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[14px] text-center text-shadow-[0px_2px_4px_rgba(0,0,0,0.2)] text-white" dir="auto">
            Sign Up
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px relative">
      <Button />
      <Button1 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <SearchBar />
      <Titles />
      <Frame />
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative w-full">
          <div className="font-['Vazirmatn:ExtraBold',sans-serif] font-extrabold leading-[0] relative shrink-0 text-[0px] text-[40px] text-white whitespace-nowrap">
            <p className="mb-0">
              <span className="leading-[normal]">{`All the `}</span>
              <span className="leading-[normal] text-[#ee10b0]">Best Songs</span>
            </p>
            <p className="leading-[normal]">in One Place</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative w-full">
          <p className="font-['Vazirmatn:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[12px] text-justify text-white w-[332px] whitespace-pre-wrap">On our website, you can access an amazing collection of popular and new songs. Stream your favorite tracks in high quality and enjoy without interruptions. Whatever your taste in music, we have it all for you!</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#ee10b0] content-stretch flex h-[40px] items-center justify-center px-[24px] py-[8px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Vazirmatn:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-center text-shadow-[0px_2px_4px_rgba(0,0,0,0.2)] text-white" dir="auto">
        Discover Now
      </p>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-center px-[24px] py-[8px] relative rounded-[4px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#0e9eef] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Vazirmatn:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#0e9eef] text-[16px] text-center text-shadow-[0px_2px_4px_rgba(0,0,0,0.2)]" dir="auto">
        Create Playlist
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center relative shrink-0 w-full">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[352px]">
      <Frame5 />
      <Frame4 />
      <Frame3 />
    </div>
  );
}

function HeroSection1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[114px] items-start justify-center left-[2.31%] right-[2.31%] top-[16px]" data-name="Hero Section">
      <Frame7 />
      <Frame6 />
    </div>
  );
}

export default function HeroSection() {
  return (
    <div className="relative size-full" data-name="Hero Section">
      <div className="absolute flex h-[595px] items-center justify-center left-0 right-0 top-0">
        <div className="-scale-y-100 flex-none h-[595px] rotate-180 w-[1081px]">
          <div className="relative rounded-[25px] size-full" data-name="1000_F_645546712_ClV1SoTWMf2K99veh5cVx7tVQc38K6Hp 1">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[25px]">
              <img alt="" className="absolute max-w-none object-cover rounded-[25px] size-full" src={img1000F645546712ClV1SoTwMf2K99Veh5CVx7TVQc38K6Hp1} />
              <div className="absolute inset-0 rounded-[25px]" style={{ backgroundImage: "linear-gradient(91.8205deg, rgba(0, 0, 0, 0) 13.23%, rgba(0, 0, 0, 0.8) 64.014%), linear-gradient(90deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.8) 101.37%)" }} />
            </div>
          </div>
        </div>
      </div>
      <HeroSection1 />
    </div>
  );
}