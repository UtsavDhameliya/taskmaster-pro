import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../contra_assets');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching browser to capture Contra portfolio photos...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    defaultViewport: {
      width: 1440,
      height: 960,
      deviceScaleFactor: 2, // 2x Retina resolution
    },
  });

  const page = await browser.newPage();

  // 1. Landing Page (Light Mode)
  console.log('Capturing 01_Landing_Hero_Light.png...');
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    localStorage.setItem('todo_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await page.screenshot({
    path: path.join(outDir, '01_Landing_Hero_Light.png'),
  });

  // 2. Landing Page (Dark Mode)
  console.log('Capturing 02_Landing_Hero_Dark.png...');
  await page.evaluate(() => {
    localStorage.setItem('todo_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await sleep(800);
  await page.screenshot({
    path: path.join(outDir, '02_Landing_Hero_Dark.png'),
  });

  // 3. Login to Dashboard
  console.log('Logging in as Admin...');
  await page.evaluate(async () => {
    const res = await fetch('http://127.0.0.1:8000/v1/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dhameliyautsav08@gmail.com',
        password: 'Admin123!',
      }),
    });
    const data = await res.json();
    localStorage.setItem('todo_token', data.token);
    localStorage.setItem('todo_user', JSON.stringify(data.user));
    localStorage.setItem('todo_theme', 'dark');
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);

  // 4. Dashboard (Dark Mode)
  console.log('Capturing 03_Dashboard_Tasks_Dark.png...');
  await page.screenshot({
    path: path.join(outDir, '03_Dashboard_Tasks_Dark.png'),
  });

  // 5. Dashboard (Light Mode)
  console.log('Capturing 04_Dashboard_Tasks_Light.png...');
  await page.evaluate(() => {
    localStorage.setItem('todo_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await sleep(800);
  await page.screenshot({
    path: path.join(outDir, '04_Dashboard_Tasks_Light.png'),
  });

  // 6. Task Creation Modal
  console.log('Capturing 05_Task_Creation_Modal.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('New Task'));
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({
    path: path.join(outDir, '05_Task_Creation_Modal.png'),
  });

  // Close modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Cancel'));
    if (btn) btn.click();
  });
  await sleep(600);

  // 7. Trash & Recovery Drawer
  console.log('Capturing 06_Trash_And_Recovery_Drawer.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Trash'));
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({
    path: path.join(outDir, '06_Trash_And_Recovery_Drawer.png'),
  });

  // Close trash
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Close'));
    if (btn) btn.click();
  });
  await sleep(600);

  // 8. Admin Console - Users Tab
  console.log('Capturing 07_Admin_Console_User_Directory.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Admin Panel'));
    if (btn) btn.click();
  });
  await sleep(1500);
  await page.screenshot({
    path: path.join(outDir, '07_Admin_Console_User_Directory.png'),
  });

  // 9. Admin Console - All Tasks Tab
  console.log('Capturing 08_Admin_Console_Global_Tasks.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('All Tasks'));
    if (btn) btn.click();
  });
  await sleep(1200);
  await page.screenshot({
    path: path.join(outDir, '08_Admin_Console_Global_Tasks.png'),
  });

  // Go back to tasks
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Back to My Tasks'));
    if (btn) btn.click();
  });
  await sleep(800);

  // 10. User Profile Modal
  console.log('Capturing 09_User_Profile_And_Security.png...');
  await page.evaluate(() => {
    const headerBtns = Array.from(document.querySelectorAll('header button'));
    // Profile button has user initial
    const btn = headerBtns.find((b) => b.querySelector('div.bg-gradient-to-tr'));
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({
    path: path.join(outDir, '09_User_Profile_And_Security.png'),
  });

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS CAPTURED BEAUTIFULLY!');
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
