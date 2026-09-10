/** Editable brand templates. Run: node scripts/export-brand-materials.mjs */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/brand/social');
const data = async (file, mime) => `data:${mime};base64,${(await readFile(path.join(root, file))).toString('base64')}`;
const [mark, idle, runner, project, syne, inter, mono] = await Promise.all([
  data('public/brand/aa-mark.png', 'image/png'),
  data('public/brand/operator-idle.png', 'image/png'),
  data('public/brand/operator-runner.png', 'image/png'),
  data('public/projects/notchy.webp', 'image/webp'),
  data('node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2', 'font/woff2'),
  data('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font/woff2'),
  data('node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff2', 'font/woff2'),
]);

const css = `
@font-face{font-family:Syne;src:url('${syne}');font-weight:400 800;font-display:block}
@font-face{font-family:Inter;src:url('${inter}');font-weight:100 900;font-display:block}
@font-face{font-family:Mono;src:url('${mono}');font-weight:400;font-display:block}
:root{--ink:#0a0b0a;--olive:#6f9554;--paper:#f1efe7;--cobalt:#3047e8}
*{box-sizing:border-box}html,body{margin:0}body{font-family:Inter,sans-serif;color:var(--ink);background:var(--paper)}
.artboard{position:relative;overflow:hidden;background:var(--paper)}
h1,h2,h3,p{margin:0}h1,h2,h3{font-family:Syne,sans-serif;font-weight:800;letter-spacing:-.065em}h1{line-height:.93}p{line-height:1.4}
.mono{font-family:Mono,monospace;text-transform:uppercase;font-size:17px;letter-spacing:.065em}
.header{position:absolute;left:56px;right:56px;top:48px;display:flex;align-items:center;justify-content:space-between;height:56px;z-index:3}
.identity{display:flex;align-items:center;gap:16px}.identity img{width:57px;height:57px;object-fit:contain}.identity strong{font-family:Syne;font-size:27px;letter-spacing:-1px}
.footer{position:absolute;bottom:42px;left:56px;right:56px;display:flex;justify-content:space-between;border-top:1px solid currentColor;padding-top:19px;z-index:3}
.kicker{display:inline-block;background:var(--cobalt);color:var(--paper);padding:12px 16px;font-family:Mono;font-size:16px;letter-spacing:.04em;text-transform:uppercase}
.outline{-webkit-text-stroke:1.5px var(--ink);color:transparent}.arrow{font-family:Inter;font-size:48px;font-weight:400;letter-spacing:0}.grid{background-image:linear-gradient(#0a0b0a0d 1px,transparent 1px),linear-gradient(90deg,#0a0b0a0d 1px,transparent 1px);background-size:54px 54px}
img{display:block} .mascot{object-fit:contain;position:absolute}.small{font-size:17px}.rule{height:1px;background:currentColor}
.intro h1{position:absolute;left:56px;top:170px;font-size:114px;z-index:2}.intro .green{position:absolute;background:var(--olive);width:360px;height:610px;right:75px;top:245px;transform:rotate(8deg)}
.intro .mascot{right:28px;top:422px;width:490px;height:490px;z-index:2}.intro .copy{position:absolute;left:60px;top:688px;width:445px;font-size:29px;letter-spacing:-.8px}.intro .kicker{position:absolute;left:60px;top:592px}.intro .index{position:absolute;right:58px;top:160px;font-size:20px}
.education h1{position:absolute;left:56px;top:170px;font-size:100px}.education .steps{position:absolute;left:56px;top:470px;width:660px}.step{border-top:1px solid var(--ink);padding:24px 0 26px;display:grid;grid-template-columns:55px 1fr;gap:16px}.step h2{font-size:37px;letter-spacing:-1.5px;margin-bottom:11px}.step p{font-size:25px;max-width:510px;letter-spacing:-.4px}.step .number{font-family:Mono;font-size:21px;color:var(--cobalt);padding-top:4px}
.education .side{position:absolute;right:0;top:470px;width:280px;height:692px;background:var(--olive)}.education .mascot{right:-54px;top:688px;width:450px;height:475px;transform:rotate(-9deg)}.education .side-label{position:absolute;right:40px;top:512px;writing-mode:vertical-rl;font-size:16px}.education .bottom-note{position:absolute;left:56px;bottom:162px;font-size:21px;max-width:620px}
.case{background:var(--ink);color:var(--paper)}.case .header{left:42px;right:42px;top:32px}.case .identity img{background:var(--paper);border-radius:50%;padding:5px}.case h1{position:absolute;left:42px;top:185px;font-size:65px;z-index:2}.case .kicker{position:absolute;left:42px;top:125px;font-size:13px;padding:9px 12px}.case .copy{position:absolute;left:44px;top:305px;max-width:405px;font-size:27px;letter-spacing:-.5px}.case .project{position:absolute;right:42px;top:137px;width:628px;height:364px;object-fit:contain;object-position:center;background:var(--ink);border:1px solid #f1efe733;border-radius:5px}.case .case-label{position:absolute;right:58px;top:460px;background:var(--olive);color:var(--ink);padding:8px 12px;font-size:12px}.case .footer{left:42px;right:42px;bottom:28px;font-size:13px}.case .arrow{position:absolute;left:44px;top:423px;color:var(--olive)}
.story .header{top:210px}.story h1{position:absolute;left:64px;top:381px;font-size:100px;width:952px}.story .kicker{position:absolute;left:64px;top:294px}.story .green-disc{position:absolute;right:-60px;top:987px;width:690px;height:550px;background:var(--olive);border-radius:50%}.story .mascot{left:310px;top:1040px;width:725px;height:495px}.story .copy{position:absolute;left:66px;top:808px;width:720px;font-size:34px;letter-spacing:-.8px}.story .cta{position:absolute;left:64px;right:64px;top:1580px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);padding:25px 0;display:flex;justify-content:space-between;align-items:center;font-size:31px;letter-spacing:-1px}.story .story-note{position:absolute;left:65px;top:1718px;font-size:18px}
.board .header{top:36px;left:48px;right:48px}.board .header .mono{font-size:14px}.board .board-title{position:absolute;top:138px;left:48px;font-size:78px}.board .descriptor{position:absolute;top:238px;left:51px;font-size:21px;color:#42443f}.board .mark-panel{position:absolute;top:316px;left:48px;width:470px;height:497px;background:var(--ink);color:var(--paper);padding:26px}.board .mark-panel img{width:330px;height:330px;object-fit:contain;margin:28px auto 0;background:var(--paper);border-radius:50%;padding:30px}.board .mark-panel .mono{font-size:13px}.board .mascot-panel{position:absolute;left:546px;top:316px;width:508px;height:497px;background:var(--olive)}.board .mascot-panel img{position:absolute;left:24px;bottom:34px;width:280px;height:354px;object-fit:contain}.board .mascot-panel img:last-of-type{left:220px;width:300px}.board .mascot-panel .mono{position:absolute;left:25px;top:27px;font-size:13px}.board .spec{position:absolute;left:1092px;right:48px;top:317px}.board .spec .mono{font-size:13px}.board .type-title{font-family:Syne;font-weight:800;font-size:69px;letter-spacing:-3px;margin-top:13px}.board .type-body{font-size:24px;margin-top:14px;line-height:1.45;max-width:330px}.board .type-mono{font-family:Mono;font-size:14px;margin-top:29px;padding:18px 0;border-top:1px solid #0a0b0a33}.board .swatches{position:absolute;left:48px;right:48px;top:845px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.swatch{height:106px;padding:18px 21px;border:1px solid #0a0b0a22;display:flex;flex-direction:column;justify-content:space-between}.swatch span{font-family:Mono;font-size:13px}.swatch strong{font-family:Syne;font-size:22px;letter-spacing:-.8px}.board .footer{left:48px;right:48px;bottom:29px;font-size:13px}
`;
const brand = `<div class="identity"><img src="${mark}" alt="Ian Silva cap icon"><strong>IAN SILVA</strong></div>`;
const header = label => `<header class="header">${brand}<span class="mono">${label}</span></header>`;
const footer = label => `<footer class="footer mono"><span>${label}</span><span>iamnsilva.me/studio ↗</span></footer>`;
const templates = [
  {name:'01-studio-introduction',title:'Ian Silva — Studio introduction',width:1080,height:1080,cls:'intro grid',body:`${header('Independent AI consultant')}<div class="green"></div><h1>Less busy.<br>More <span class="outline">built.</span></h1><span class="kicker">AI systems. Human direction.</span><p class="copy">I turn repetitive work into useful tools, workflows and digital experiences.</p><img class="mascot" src="${idle}" alt="Mouthless Operator mascot wearing an olive cap">${footer('Design × automation')}`},
  {name:'02-workflow-field-notes',title:'Ian Silva — Workflow field notes',width:1080,height:1350,cls:'education',body:`${header('Field notes / 01')}<h1>Before you<br><span class="outline">automate.</span></h1><div class="side"></div><span class="side-label mono">Make the workflow make sense.</span><div class="steps"><div class="step"><span class="number">01</span><div><h2>Map the repetition.</h2><p>Find the task people repeat. Name the input, the outcome and the owner.</p></div></div><div class="step"><span class="number">02</span><div><h2>Keep a human checkpoint.</h2><p>Decide what needs review and what happens when the system is unsure.</p></div></div><div class="step"><span class="number">03</span><div><h2>Start with one useful loop.</h2><p>Ship a small workflow. Check its output. Improve it with the people using it.</p></div></div></div><img class="mascot" src="${idle}" alt="Operator mascot"><p class="bottom-note">A better process comes before a bigger tool stack.</p>${footer('Save for your next workflow')}`},
  {name:'03-notchy-project',title:'Ian Silva — NOTCHY project announcement',width:1200,height:630,cls:'case',body:`${header('Selected work / 01')}<span class="kicker">Independent project</span><h1>NOTCHY.</h1><p class="copy">A quieter way to keep<br>an eye on AI usage.</p><span class="arrow">↗</span><img class="project" src="${project}" alt="Existing NOTCHY project artwork from Ian Silva’s portfolio"><span class="case-label mono">macOS / AI usage monitor</span>${footer('Product design × development')}`},
  {name:'04-studio-story',title:'Ian Silva — Studio story',width:1080,height:1920,cls:'story grid',body:`${header('From idea to working system')}<span class="kicker">Ian Silva / Studio</span><h1>Make room<br>for the<br><span class="outline">good work.</span></h1><p class="copy">Useful AI workflows.<br>Thoughtful digital experiences.<br>Built around how you work.</p><div class="green-disc"></div><img class="mascot" src="${runner}" alt="Frame Runner Operator in motion"><div class="cta"><span>Explore the studio</span><span class="arrow">↗</span></div><p class="story-note mono">iamnsilva.me/studio</p>`},
  {name:'05-brand-board',title:'Ian Silva — Brand system',width:1600,height:1040,cls:'board',body:`${header('Identity system / 01')}<h1 class="board-title">A little edge. A lot of intent.</h1><p class="descriptor">Ian Silva — AI consulting, automation and digital experiences.</p><section class="mark-panel"><span class="mono">01 / Silva Mask</span><img src="${mark}" alt="AA Silva Mask primary logo"></section><section class="mascot-panel"><span class="mono">02 / The Operator</span><img src="${idle}" alt="Operator idle pose"><img src="${runner}" alt="Operator runner pose"></section><section class="spec"><p class="mono">03 / Type & voice</p><div class="type-title">Useful.<br>Distinct.</div><p class="type-body">Syne gives it character.<br>Inter keeps it clear.</p><p class="type-mono">SPACE MONO / SMALL SIGNALS</p><p class="type-body">Direct, curious, capable.<br>Playful in the details.</p></section><div class="swatches"><div class="swatch" style="background:var(--ink);color:var(--paper)"><strong>Ink</strong><span>#0A0B0A</span></div><div class="swatch" style="background:var(--olive)"><strong>Olive</strong><span>#6F9554</span></div><div class="swatch" style="background:var(--paper)"><strong>Paper</strong><span>#F1EFE7</span></div><div class="swatch" style="background:var(--cobalt);color:var(--paper)"><strong>Cobalt</strong><span>#3047E8</span></div></div>${footer('Green cap. Clear thinking.')}`},
];
await mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true});
try {
  for (const template of templates) {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=${template.width}"><title>${template.title}</title><style>${css}</style></head><body><main class="artboard ${template.cls}" style="width:${template.width}px;height:${template.height}px">${template.body}</main></body></html>`;
    const htmlPath = path.join(out, `${template.name}.html`);
    await writeFile(htmlPath, html);
    const page = await browser.newPage({viewport:{width:template.width,height:template.height},deviceScaleFactor:1});
    await page.goto(`file://${htmlPath}`);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode())); });
    await page.screenshot({path:path.join(out, `${template.name}.png`)});
    await page.close();
    console.log(`Exported ${template.name}: ${template.width}×${template.height}`);
  }
} finally { await browser.close(); }
