/**
 * useCabinetSection - shared hook for all 6 cabinets
 * Derives activeSection from URL pathname and provides a setter that navigates.
 *
 * Usage:
 *   const [activeSection, setActiveSection] = useCabinetSection('artist', 'home');
 *   // URL /artist/tracks  -> activeSection = 'tracks'
 *   // URL /artist          -> activeSection = 'home' (default)
 *   // setActiveSection('video') navigates to /artist/video
 */

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useCabinetSection(cabinetPrefix: string, defaultSection: string) {
  const location = useLocation();
  const navigate = useNavigate();

  // /artist/tracks -> 'tracks', /artist -> defaultSection, /artist/ -> defaultSection
  const prefix = `/${cabinetPrefix}`;
  const rest = location.pathname.startsWith(prefix)
    ? location.pathname.slice(prefix.length).replace(/^\//, '')
    : '';
  const activeSection = rest || defaultSection;

  const setActiveSection = useCallback(
    (section: string) => {
      const target =
        section === defaultSection
          ? `/${cabinetPrefix}`
          : `/${cabinetPrefix}/${section}`;
      navigate(target);
    },
    [cabinetPrefix, defaultSection, navigate],
  );

  return [activeSection, setActiveSection] as const;
}