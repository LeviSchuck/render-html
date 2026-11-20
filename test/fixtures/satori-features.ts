import type { HtmlElement } from '@levischuck/tiny-html';
import type { EmojiType } from '../../src/types.ts';

export interface VisualExample {
  name: string;
  note: string;
  html: string;
  width?: number;
  height?: number;
  emoji?: EmojiType;
  since?: string;
  svgIncludes?: string[];
  samples?: { x: number; y: number; rgba: number[] }[];
  element?: HtmlElement;
  knownIssue?: string;
}

const pattern = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="40" height="60" fill="#ef4444"/><rect x="40" width="40" height="60" fill="#22c55e"/><rect x="80" width="40" height="60" fill="#3b82f6"/><circle cx="60" cy="30" r="14" fill="white"/></svg>');
const webp = 'data:image/webp;base64,' + Buffer.from(await Bun.file(new URL('./image-pattern.webp', import.meta.url)).arrayBuffer()).toString('base64');
const frame = (body: string, style = '') => `<div style="display:flex;width:480px;height:240px;background:white;color:#0f172a;font-family:Roboto Mono;font-size:18px;${style}">${body}</div>`;
const box = (text: string, style: string) => `<div style="display:flex;align-items:center;justify-content:center;${style}">${text}</div>`;
const sample = (x: number, y: number, rgba: number[]) => ({x, y, rgba});
const labeledImage = (label: string, style: string) => `<div style="display:flex;flex-direction:column;gap:12px;align-items:center"><div style="display:flex;width:100px;height:120px;background:#e2e8f0"><img src="${pattern}" style="width:100px;height:120px;${style}"/></div><span style="font-size:15px">${label}</span></div>`;

const features: VisualExample[] = [
  {
    name:'Box sizing: border-box versus content-box', since:'0.16.0',
    note:'Both declare 140 × 100 plus 20px padding and 4px border. The blue content-box is visibly larger.',
    samples:[sample(240,55,[59,130,246,255])],
    html:frame(box('border-box','width:140px;height:100px;padding:20px;border:4px solid #0f172a;background:#22c55e;box-sizing:border-box;font-size:14px')+box('content-box','width:140px;height:100px;padding:20px;border:4px solid #0f172a;background:#3b82f6;box-sizing:content-box;font-size:14px'),'gap:28px;align-items:center;justify-content:center'),
  },
  {
    name:'Display contents: wrapper contributes no box', since:'0.16.0',
    note:'Four colored children share one horizontal flex row; the contents wrapper has no purple background or padding.',
    html:frame(box('1','width:90px;height:100px;background:#ef4444')+'<div style="display:contents;background:purple;padding:40px">'+box('2','width:90px;height:100px;background:#22c55e')+box('3','width:90px;height:100px;background:#3b82f6')+'</div>'+box('4','width:90px;height:100px;background:#facc15'),'gap:16px;align-items:center;justify-content:center'),
    samples:[sample(60,80,[239,68,68,255]),sample(166,80,[34,197,94,255]),sample(272,80,[59,130,246,255])],
  },
  {
    name:'Static positioning and absolute containing block', since:'0.16.0',
    note:'Red marker sits 20px from the OUTER top-left, ignoring the inset static blue wrapper.',
    html:frame('<div style="display:flex;position:static;margin:60px;width:340px;height:120px;background:#dbeafe"><div style="display:flex;position:absolute;left:20px;top:20px;width:60px;height:40px;background:#ef4444"></div></div>','position:relative'),
    samples:[sample(30,30,[239,68,68,255]),sample(90,90,[219,234,254,255])],
  },
  {
    name:'Percentage gap', since:'0.16.0',
    note:'The three 100px blocks have 48px gaps (10% of a 480px flex container).',
    html:frame([1,2,3].map(n=>box(String(n),'width:100px;height:120px;background:#2563eb;color:white')).join(''),'gap:10%;align-items:center'),
    samples:[sample(110,100,[255,255,255,255]),sample(160,100,[37,99,235,255]),sample(265,100,[255,255,255,255])],
  },
  {
    name:'Wrapped rows with align-content space-evenly', since:'0.16.0',
    knownIssue:'Satori 0.32.0 rejects space-evenly in its CSS validator despite the Yoga release notes.',
    note:'Two rows of three blocks; equal free space above, between and below the rows.',
    html:frame([1,2,3,4,5,6].map(n=>box(String(n),'width:140px;height:60px;background:#16a34a;color:white')).join(''),'flex-wrap:wrap;align-content:space-evenly;column-gap:20px'),
    samples:[sample(20,10,[255,255,255,255]),sample(20,50,[22,163,74,255]),sample(20,120,[255,255,255,255]),sample(20,160,[22,163,74,255])],
  },
  {
    name:'Object fit: contain, cover, fill and scale-down', since:'0.22.0',
    note:'Same striped image: letterbox, crop, stretch, and no upscaling. The white circle exposes distortion.',
    html:frame(['contain','cover','fill','scale-down'].map(f=>labeledImage(f,`object-fit:${f}`)).join(''),'gap:16px;align-items:center;justify-content:center'),
  },
  {
    name:'Object position: left, center and right', since:'0.24.0',
    note:'Cover crops select red, green/white, then blue portions of the wide source image.',
    html:frame(['left','center','right'].map(p=>labeledImage(p,`object-fit:cover;object-position:${p} center`)).join(''),'gap:36px;align-items:center;justify-content:center'),
  },
  {
    name:'Background size: contain, cover and auto', since:'0.20.0',
    note:'Top-left aligned image: contain letterboxes, cover crops to fill, auto uses the intrinsic 120 × 60 size. No tiling.',
    html:frame(['contain','cover','auto'].map(s=>`<div style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;width:130px;height:140px;background-color:#e2e8f0;background-image:url(${pattern});background-repeat:no-repeat;background-position:0px 0px;background-size:${s}"></div><span style="font-size:16px">${s}</span></div>`).join(''),'gap:20px;align-items:center;justify-content:center'),
  },
  {
    name:'Text indent: first-line and hanging indent', since:'0.23.0',
    note:'Left paragraph indents only its first line by 32px. Right paragraph outdents its first line by 20px.',
    html:frame('<div style="display:flex;width:170px;text-indent:32px">First line moves right. Wrapped lines return to the left edge.</div><div style="display:flex;width:150px;margin-left:20px;text-indent:-20px">Hanging first line. All wrapped lines stay inside the padded edge.</div>','padding:24px;gap:64px;font-size:20px;line-height:1.4'),
  },
  {
    name:'CSS variables in parsed HTML', since:'0.25.0',
    knownIssue:'tiny-html converts --accent to -Accent, preventing Satori from resolving the CSS variable.',
    note:'First tile inherits blue; second overrides green; third uses the orange fallback.',
    html:frame('<div style="display:flex;gap:16px;--accent:#2563eb">'+box('inherit','width:130px;height:130px;background:var(--accent);color:white;font-size:16px')+box('override','--accent:#16a34a;width:130px;height:130px;background:var(--accent);color:white;font-size:16px')+box('fallback','width:130px;height:130px;background:var(--missing, #f97316);color:white;font-size:16px')+'</div>','align-items:center;justify-content:center'),
    samples:[sample(40,70,[37,99,235,255]),sample(186,70,[22,163,74,255]),sample(332,70,[249,115,22,255])],
  },
  {
    name:'WebP image decoding and intrinsic aspect ratio', since:'0.29.0',
    knownIssue:'Satori embeds WebP in SVG and Chrome displays it, but resvg 2.6.2 omits the WebP image from PNG.',
    note:'Lossless WebP shows red, green, blue bands and a white circle. Height derives from the 2:1 ratio.',
    html:frame(`<img src="${webp}" style="width:400px;object-fit:contain"/>`,'align-items:center;justify-content:center'),
    svgIncludes:['data:image/webp;base64,'],
    samples:[sample(60,100,[239,68,68,255]),sample(240,120,[255,255,255,255]),sample(420,100,[59,130,246,255])],
  },
  {
    name:'Corner shapes: round, bevel, scoop and notch', since:'0.30.0',
    note:'Four blue squares have visibly different 24px corner contours, with white cutouts.',
    html:frame(['round','bevel','scoop','notch'].map(s=>`<div style="display:flex;flex-direction:column;gap:16px;align-items:center">${box('','width:96px;height:120px;background:#2563eb;border-radius:24px;corner-shape:'+s)}<span style="font-size:14px">${s}</span></div>`).join(''),'gap:16px;align-items:center;justify-content:center'),
  },
  {
    name:'Corner shape: squircle and superellipse', since:'0.30.0',
    note:'Purple squircle and custom superellipse silhouettes; orange tile mixes a bevel and notched corners.',
    html:frame(box('squircle','width:132px;height:140px;background:#7c3aed;color:white;border-radius:44px;corner-shape:squircle;font-size:15px')+box('superellipse','width:132px;height:140px;background:#7c3aed;color:white;border-radius:44px;corner-shape:superellipse(0.5);font-size:14px')+box('mixed','width:132px;height:140px;background:#f97316;color:white;border-radius:32px;corner-shape:notch;corner-top-left-shape:bevel;font-size:15px'),'gap:16px;align-items:center;justify-content:center'),
  },
  {
    name:'Clip path shape(): lines and percentages', since:'0.31.0',
    note:'The purple square is clipped to a pentagon, leaving its outer corners transparent over white.',
    html:frame(box('SHAPE','width:200px;height:180px;background:#7c3aed;color:white;font-size:28px;clip-path:shape(from 50% 0, line to 100% 38%, line to 82% 100%, line to 18% 100%, line to 0 38%, close)'),'align-items:center;justify-content:center'),
    svgIncludes:['clipPath'],
    samples:[sample(145,35,[255,255,255,255]),sample(240,50,[124,58,237,255])],
  },
  {
    name:'Clip path shape(): curves, smooth commands and arcs', since:'0.31.0',
    note:'Green curved shape and orange circle demonstrate cubic/smooth curves and elliptical arc commands.',
    html:frame(box('curves','width:180px;height:180px;background:#16a34a;color:white;clip-path:shape(from 50% 0, curve to 100% 50% with 100% 0 from origin, smooth to 50% 100% with 100% 100% from origin, smooth to 0 50% with 0 100% from origin, smooth to 50% 0 with 0 0 from origin, close)')+box('arcs','width:180px;height:180px;background:#f97316;color:white;clip-path:shape(from 0 50%, arc to 100% 50% of 50% 50% cw, arc to 0 50% of 50% 50% cw, close)'),'gap:40px;align-items:center;justify-content:center'),
    svgIncludes:['clipPath'],
  },
  {
    name:'Backdrop filter: blur and grayscale', since:'0.32.0',
    knownIssue:'BackgroundImage SVG filter input renders black instead of sampling the underlying image in Chrome and resvg.',
    samples:[sample(400,100,[123,123,123,255])],
    note:'Panels overlay the same striped background: blurred edges on the left, gray bands on the right. Outer bands stay sharp and colored.',
    html:frame(`<img src="${pattern}" style="position:absolute;left:20px;top:30px;width:440px;height:180px"/><div style="display:flex;position:absolute;left:50px;top:55px;width:160px;height:130px;background:rgba(255,255,255,0.04);backdrop-filter:blur(8px);border:2px solid black"></div><div style="display:flex;position:absolute;left:270px;top:55px;width:160px;height:130px;background:rgba(255,255,255,0.04);backdrop-filter:grayscale(100%);border:2px solid black"></div>`,'position:relative'),
    svgIncludes:['feGaussianBlur','feColorMatrix'],
  },
  {
    name:'Backdrop filter: chained brightness and invert', since:'0.32.0',
    knownIssue:'The chained filter processes a black backdrop instead of the underlying image; it produces a flat gray panel.',
    samples:[sample(100,100,[11,131,131,255])],
    note:'Center overlay inverts and darkens underlying bands; the uncovered band edges keep their original colors.',
    html:frame(`<img src="${pattern}" style="position:absolute;left:20px;top:30px;width:440px;height:180px"/><div style="display:flex;position:absolute;left:80px;top:60px;width:320px;height:120px;background:rgba(255,255,255,0.04);backdrop-filter:invert(100%) brightness(70%);border:2px solid black"></div>`,'position:relative'),
    svgIncludes:['feComponentTransfer'],
  },
  {
    name:'Semitransparent gradient over a colored background', since:'0.19.0',
    note:'A transparent-to-white gradient reveals red at the left and blends smoothly to white at the right.',
    html:frame(box('','width:400px;height:160px;background-color:#ef4444;background-image:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,1))'),'align-items:center;justify-content:center'),
    svgIncludes:['linearGradient'],
  },
  {
    name:'Transparent text with a visible shadow', since:'0.19.0',
    note:'Blue shadow letters remain visible although the text fill itself is transparent.',
    html:frame('<div style="display:flex;font-size:42px;color:transparent;text-shadow:3px 3px 2px #2563eb">SHADOW TEXT</div>','align-items:center;justify-content:center'),
    svgIncludes:['filter'],
  },
  {
    name:'Underline skip-ink and prototype-name glyphs', since:'0.28.1',
    note:'Underlines skip descenders in the first row; the second stays continuous. Constructor/prototype names render as ordinary text.',
    html:frame('<div style="display:flex;font-size:32px;text-decoration:underline;text-decoration-skip-ink:auto">gyp jog quickly</div><div style="display:flex;font-size:32px;text-decoration:underline;text-decoration-skip-ink:none">gyp jog quickly</div><div style="display:flex;font-size:17px;margin-top:24px">constructor toString __proto__</div>','flex-direction:column;align-items:center;justify-content:center;gap:16px'),
  },
  {
    name:'CSS variables with structured styles', since:'0.25.0',
    note:'Structured styles preserve custom property names: blue inherited, green overridden, orange fallback. This bypasses the parsed-HTML conversion gap.',
    html:'<!-- This example uses a structured HtmlElement. Expand the structured input below. -->',
    element:{type:'div',props:{style:{display:'flex',width:'480px',height:'240px',background:'white',alignItems:'center',justifyContent:'center','--accent':'#2563eb'},children:[
      {type:'div',props:{style:{display:'flex',width:'130px',height:'130px',background:'var(--accent)',color:'white',alignItems:'center',justifyContent:'center',fontSize:'16px'},children:'inherit'}},
      {type:'div',props:{style:{display:'flex',marginLeft:'16px',width:'130px',height:'130px','--accent':'#16a34a',background:'var(--accent)',color:'white',alignItems:'center',justifyContent:'center',fontSize:'16px'},children:'override'}},
      {type:'div',props:{style:{display:'flex',marginLeft:'16px',width:'130px',height:'130px',background:'var(--missing, #f97316)',color:'white',alignItems:'center',justifyContent:'center',fontSize:'16px'},children:'fallback'}},
    ]}},
    samples:[sample(40,70,[37,99,235,255]),sample(186,70,[22,163,74,255]),sample(332,70,[249,115,22,255])],
  },
  {
    name:'Scale-down avoids enlarging a small image', since:'0.22.0',
    note:'Contain enlarges the 120 × 60 source to 200 × 100. Scale-down keeps it 120 × 60 inside the same 200 × 150 box.',
    html:frame(['contain','scale-down'].map(f=>`<div style="display:flex;flex-direction:column;align-items:center;gap:12px"><div style="display:flex;width:200px;height:150px;background:#e2e8f0"><img src="${pattern}" style="width:200px;height:150px;object-fit:${f}"/></div><span>${f}</span></div>`).join(''),'gap:24px;align-items:center;justify-content:center'),
    samples:[sample(40,100,[239,68,68,255]),sample(270,100,[226,232,240,255])],
  },
  {
    name:'Percentage background positioning', since:'0.20.0',
    note:'A 320 × 160 contained image should be horizontally centered within a 400 × 160 gray box, leaving 40px at either side.',
    knownIssue:'Satori offsets percentage background positions using the full box size, shifting the image down and right instead of centering it.',
    html:frame(box('','width:400px;height:160px;background-color:#e2e8f0;background-image:url('+pattern+');background-repeat:no-repeat;background-size:contain;background-position:50% 50%'),'align-items:center;justify-content:center'),
    samples:[sample(100,60,[239,68,68,255])],
  },
];

export const featureExamples = features.map(example => ({width:480, height:240, ...example}));
