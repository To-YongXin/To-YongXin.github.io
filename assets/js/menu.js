const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
const particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5
    });
}

function animate() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 153, 170, 0.5)';

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(animate);
}
animate();

/** 读取章节配置：优先内嵌 JSON（支持 file://），http 下可回退 fetch */
async function loadChaptersConfig() {
    const embedded = document.getElementById('chapters-data');
    if (embedded) {
        try {
            return JSON.parse(embedded.textContent);
        } catch (e) {
            console.warn('解析内嵌章节配置失败', e);
        }
    }

    if (location.protocol === 'http:' || location.protocol === 'https:') {
        try {
            const res = await fetch('chapters/chapters.json');
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn('fetch chapters.json 失败，使用内嵌配置', e);
        }
    }

    return null;
}

function renderMenu(data) {
    const listEl = document.getElementById('menu-list');
    listEl.innerHTML = '';

    data.chapters.forEach(ch => {
        const label = `第${ch.number}章 ${ch.title}`;
        if (ch.enabled) {
            const a = document.createElement('a');
            a.href = ch.path;
            a.className = 'menu-item';
            a.textContent = label;
            listEl.appendChild(a);
        } else {
            const span = document.createElement('span');
            span.className = 'menu-item disabled';
            span.textContent = label;
            listEl.appendChild(span);
        }
    });

    const pending = document.createElement('span');
    pending.className = 'menu-item disabled';
    pending.textContent = '未完待续……';
    listEl.appendChild(pending);
}

async function loadMenu() {
    const data = await loadChaptersConfig();
    if (data) {
        renderMenu(data);
    } else {
        console.error('无法加载章节配置');
    }
}

loadMenu();
