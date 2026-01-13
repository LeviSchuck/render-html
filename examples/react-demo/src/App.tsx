import { useState, useEffect, useRef } from 'react';
import './App.css';
import { renderHtml, extractFontsFromHTML, loadFonts, FontError } from '@levischuck/render-html';
import { htmlNodeToHtmlElement, readHtml } from '@levischuck/tiny-html';
import type { FontLoader } from '@levischuck/render-html';
import { initClientWasm } from '@levischuck/render-html/client-wasm';

const defaultContent = `<div style="font-family: 'Sour Gummy'; display: flex; flex-direction: column; width: 100vw; align-items: center; justify-content: center; background-color: #160f29; color: white; font-size: 60px; font-weight: 600; margin: 0; padding: 40px">
Hello 🌎
<hr style="border-color: white; border-width: 3px; width: 200px" />
<img src="https://avatars.githubusercontent.com/u/245911?v=4" width="100" height="100" style="border-radius: 20px" />
</div>`

const LocalFontLoader : FontLoader = {
  load: async (font) => {
    const fontResponse = await fetch(`/fonts/${font.family.replace(/ /g, '')}-Regular.ttf`);
		if (!fontResponse.ok) {
			return FontError;
		}
    return await fontResponse.arrayBuffer();
  }
}

function App() {
  const [html, setHtml] = useState(defaultContent);
  const [width, setWidth] = useState(576);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPreview() {
      setIsRendering(true);
      setError(null);

      try {
				await initClientWasm();
        // Parse HTML string to HtmlElement
        const { node } = readHtml(html);
        const element = htmlNodeToHtmlElement(node);

        // Extract and load fonts
        const fontsToLoad = extractFontsFromHTML(element);
        const fonts = await loadFonts(fontsToLoad, {
					fontLoaders: [LocalFontLoader],
				});

        // Prepare width/height: 0 -> undefined
        const renderWidth = width === 0 ? undefined : width;
        const renderHeight = height === 0 ? undefined : height;

        // Render the image
        const imageBlob = await renderHtml(element, {
          width: renderWidth,
          height: renderHeight,
          format,
          fonts,
          emoji: 'twemoji',
        });

        if (cancelled) return;

        // Revoke previous URL before creating new one
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }

        // Create object URL for preview
        const url = URL.createObjectURL(imageBlob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      } catch (err) {
        if (cancelled) return;
				console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to render preview');
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setPreviewUrl(null);
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }

    renderPreview();

    return () => {
      cancelled = true;
      // Revoke URL when effect cleanup runs
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [html, width, height, format]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>render-html Demo</h1>
        <div className="controls">
          <div className="config-section">
            <div className="toggle-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label className="toggle">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'png'}
                  onChange={() => setFormat('png')}
                />
                <span>PNG</span>
              </label>
              <label className="toggle">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'svg'}
                  onChange={() => setFormat('svg')}
                />
                <span>SVG</span>
              </label>
            </div>
            <label className="config-label">
              <span>width:</span>
              <input
                type="number"
                min="0"
                max="2000"
                step="1"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              />
            </label>
            <label className="config-label">
              <span>height:</span>
              <input
                type="number"
                min="0"
                max="2000"
                step="1"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="editor-panel">
          <h2>ReceiptLine Markup</h2>
          <textarea
            className="editor"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="preview-panel">
          <h2>Preview</h2>
          <div className="preview">
            {isRendering && <div style={{ color: '#b0b0b0' }}>Rendering...</div>}
            {error && (
              <div className="error">
                <strong>Error:</strong> {error}
              </div>
            )}
            {!isRendering && !error && previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
