import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import type { RootState } from '../store';

export const LivePreviewEmbed: React.FC = () => {
  const headerHtml = useSelector(
    (state: RootState) => state.editor.headerTemplate?.html ?? ''
  );
  const heroHtml = useSelector(
    (state: RootState) => state.editor.heroTemplate?.html ?? ''
  );
  const colorPalette = useSelector(
    (state: RootState) => state.colors.palette
  );
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

  const sanitizedHeader = useMemo(
    () => DOMPurify.sanitize(headerHtml, { USE_PROFILES: { html: true } }),
    [headerHtml]
  );
  const sanitizedHero = useMemo(
    () => DOMPurify.sanitize(heroHtml, { USE_PROFILES: { html: true } }),
    [heroHtml]
  );

  const generateCss = (): string => {
    let cssVars = '';
    colorPalette.forEach((color, index) => {
      cssVars += `--color-${index}: ${color};`;
    });
    const background = darkMode
      ? colorPalette[colorPalette.length - 1] ?? '#000'
      : colorPalette[0] ?? '#fff';
    const text =
      darkMode && colorPalette[0]
        ? colorPalette[0]
        : colorPalette[colorPalette.length - 1] ?? '#000';
    return `
      :root { ${cssVars} }
      html, body { margin:0; padding:0; width:100%; height:100%; }
      body { background-color: ${background}; color: ${text}; }
      img, svg, video { max-width:100%; height:auto; display:block; }
    `;
  };

  const srcDoc = useMemo(() => {
    const csp = `
      default-src 'none';
      style-src 'unsafe-inline' data:;
      img-src data: https:;
      font-src data: https:;
    `;
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          <style>${generateCss()}</style>
        </head>
        <body>
          ${sanitizedHeader}
          ${sanitizedHero}
        </body>
      </html>
    `;
  }, [sanitizedHeader, sanitizedHero, colorPalette, darkMode]);

  return (
    <iframe
      title="Live Preview"
      style={{ width: '100%', height: '100%', border: 'none' }}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
    />
  );
};