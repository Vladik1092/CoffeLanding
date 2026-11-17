/* ===== Бургер-меню ===== */
const burger = document.querySelector('.burger');
const links = document.querySelector('.links');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    links.classList.toggle('open');
});

links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
        burger.classList.remove('active');
        links.classList.remove('open');
    })
);

/* ===== Canvas: оптимизированный мягкий дым ===== */
const canvas = document.getElementById('smoke-canvas');
const ctx = canvas.getContext('2d');

let W, H, dpr;
const particles = [];

const isMobile = window.innerWidth < 768;
const PARTICLE_COUNT = isMobile ? 40 : 80; 
const TARGET_FPS = isMobile ? 30 : 60;
const FRAME_TIME = 1000 / TARGET_FPS;
let lastTime = 0;

// Создаем невидимый холст (спрайт) для одной мягкой частицы дыма
const smokeSprite = document.createElement('canvas');
const spriteCtx = smokeSprite.getContext('2d');
const SPRITE_SIZE = 200;

smokeSprite.width = SPRITE_SIZE;
smokeSprite.height = SPRITE_SIZE;

// Рисуем мягкое пятно один раз
function createSmokeSprite() {
    const r = SPRITE_SIZE / 2;
    const grad = spriteCtx.createRadialGradient(r, r, 0, r, r, r);
    
    // Тёмно-серый цвет, чтобы было видно на светлом фоне
    grad.addColorStop(0, 'rgba(130, 125, 120, 0.35)');   
    grad.addColorStop(0.5, 'rgba(160, 155, 150, 0.15)'); 
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');      
    
    spriteCtx.fillStyle = grad;
    spriteCtx.beginPath();
    spriteCtx.arc(r, r, r, 0, Math.PI * 2);
    spriteCtx.fill();
}
createSmokeSprite();

function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const sources = [0.15, 0.4, 0.65, 0.85]; 

function createParticle(randomY = false) {
    const radius = (isMobile ? 50 : 80) + Math.random() * (isMobile ? 50 : 80);
    const sourceX = sources[Math.floor(Math.random() * sources.length)] * W;
    const spread = W * 0.15;

    return {
        x: sourceX + (Math.random() - 0.5) * spread,
        y: randomY ? Math.random() * H : H + radius,
        radius,
        vy: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
        wobbleAmp: 1.0 + Math.random() * 1.5,
        growth: 0.2 + Math.random() * 0.3,
        alpha: 0.3 + Math.random() * 0.4, // Заметная прозрачность
        life: 0,
        maxLife: 500 + Math.random() * 500
    };
}

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle(true));
    }
}

function draw(currentTime) {
    if (currentTime - lastTime < FRAME_TIME) {
        requestAnimationFrame(draw);
        return;
    }
    lastTime = currentTime;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * p.wobbleAmp;
        p.y -= p.vy;
        p.radius += p.growth;
        p.life++;

        let currentAlpha = p.alpha;
        if (p.life < 60) currentAlpha *= (p.life / 60);
        if (p.y < H * 0.4) currentAlpha *= (p.y / (H * 0.4)); 

        ctx.globalAlpha = Math.max(0, currentAlpha);
        
        const size = p.radius * 2;
        ctx.drawImage(
            smokeSprite, 
            p.x - p.radius, 
            p.y - p.radius, 
            size, 
            size
        );

        if (p.y < -p.radius || p.life > p.maxLife) {
            particles[i] = createParticle(false);
        }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resize();
        initParticles();
    }, 200);
});

resize();
initParticles();
requestAnimationFrame(draw);