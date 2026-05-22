/**
 * 章节背景粒子效果注册表
 * 用法: ParticleEffects.init('spark')  或在 body 上设 data-particle="spark" 自动初始化
 */
window.ParticleEffects = (function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return { init: () => {}, onChapterChange: () => {} };

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let particleState = 0;
    let time = 0;
    let rafId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const effects = {
        /** 第一章：多阶段萤火虫 */
        'firefly-states': {
            count: 150,
            trail: 'rgba(5, 5, 5, 0.2)',
            onChapterChange(state) {
                particleState = state;
                if (state === 3) {
                    for (let i = 0; i < particles.length; i++) {
                        particles[i].vx = Math.random() * 0.3 + 0.1;
                        particles[i].vy = (Math.random() - 0.5) * 0.3;
                    }
                } else if (state === 4) {
                    for (let i = 0; i < particles.length; i++) {
                        particles[i].vx = (Math.random() - 0.5) * 0.3;
                        particles[i].vy = Math.random() * 0.5 + 0.2;
                    }
                }
            },
            create() {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 1,
                    vy: (Math.random() - 0.5) * 1,
                    baseSize: Math.random() * 2 + 0.5,
                    color: `rgba(255, 153, 170, ${Math.random() * 0.5 + 0.3})`,
                    update() {
                        if (particleState === 0 || particleState === 1) {
                            this.x += this.vx;
                            this.y += this.vy;
                            if (this.x < 0 || this.x > width) this.vx *= -1;
                            if (this.y < 0 || this.y > height) this.vy *= -1;
                        } else if (particleState === 2) {
                            const dx = width / 2 - this.x;
                            const dy = height / 2 - this.y;
                            this.vx += dx * 0.00002;
                            this.vy += dy * 0.00002;
                            this.vx *= 0.9;
                            this.vy *= 0.9;
                            this.x += this.vx + (Math.random() - 0.5) * 0.25;
                            this.y += this.vy + (Math.random() - 0.5) * 0.25;
                        } else if (particleState === 3) {
                            this.x += this.vx;
                            this.y += this.vy;
                            if (this.x < 0) this.x = width;
                            if (this.x > width) this.x = 0;
                            if (this.y < 0) this.y = height;
                            if (this.y > height) this.y = 0;
                        } else if (particleState === 4) {
                            this.y += Math.abs(this.vy) * 0.6;
                            this.x += Math.sin(this.y * 0.02) * 0.3;
                            if (this.y > height) {
                                this.y = -10;
                                this.x = Math.random() * width;
                            }
                        }
                    },
                    draw() {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
                        ctx.fillStyle = this.color;
                        ctx.fill();
                    }
                };
            }
        },

        /** 第二章：轻盈气泡上浮 */
        bubble: {
            count: 120,
            trail: 'rgba(5, 5, 5, 0.2)',
            onChapterChange(state) { particleState = state; },
            create() {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: Math.random() * 0.5 + 0.2,
                    baseSize: Math.random() * 2 + 1,
                    color: `rgba(255, 153, 170, ${Math.random() * 0.5 + 0.2})`,
                    swayOffset: Math.random() * Math.PI * 2,
                    update() {
                        this.y -= this.vy;
                        if (particleState === 0 || particleState === 1) {
                            this.x += Math.sin(time + this.swayOffset) * 0.3;
                        } else if (particleState === 2) {
                            this.x += Math.sin(time * 1.5 + this.swayOffset) * 0.6;
                            this.y -= this.vy * 0.2;
                        }
                        if (this.y < -20) {
                            this.y = height + 20;
                            this.x = Math.random() * width;
                        }
                    },
                    draw() {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
                        ctx.fillStyle = this.color;
                        ctx.fill();
                    }
                };
            },
            tick() { time += 0.02; }
        },

        /** 第三章：暖光细雨 */
        'warm-rain': {
            count: 150,
            trail: 'rgba(8, 5, 5, 0.2)',
            create() {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: 0.2 + Math.random() * 0.3,
                    vy: 0.5 + Math.random() * 0.6,
                    baseSize: Math.random() * 1.5 + 0.5,
                    color: `rgba(255, 218, 185, ${Math.random() * 0.5 + 0.1})`,
                    update() {
                        this.x += this.vx;
                        this.y += this.vy;
                        if (this.y > height) {
                            this.y = -10;
                            this.x = Math.random() * width;
                        }
                        if (this.x > width) this.x = -10;
                    },
                    draw() {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
                        ctx.fillStyle = this.color;
                        ctx.fill();
                    }
                };
            }
        },

        /** 第四章：樱花花瓣 */
        petal: {
            count: 80,
            clear: true,
            create() {
                const p = {
                    x: Math.random() * width,
                    y: Math.random() * height - height,
                    r: Math.random() * 3 + 2,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: Math.random() * 1 + 0.5,
                    rotation: Math.random() * Math.PI,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    opacity: Math.random() * 0.5 + 0.3,
                    update() {
                        this.x += this.vx + Math.sin(this.y * 0.01) * 0.5;
                        this.y += this.vy;
                        this.rotation += this.rotationSpeed;
                        if (this.y > height) {
                            this.y = -20;
                            this.x = Math.random() * width;
                        }
                    },
                    draw() {
                        ctx.save();
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        ctx.beginPath();
                        ctx.ellipse(0, 0, this.r * 1.5, this.r, 0, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 183, 197, ${this.opacity})`;
                        ctx.fill();
                        ctx.restore();
                    }
                };
                return p;
            }
        },

        /** 第五章：粉色流光萤火 */
        spark: {
            count: 100,
            trail: 'rgba(5, 5, 5, 0.15)',
            create() {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    speedX: Math.random() * 1.5 + 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.2,
                    update() {
                        this.x += this.speedX;
                        this.y += this.speedY;
                        if (this.x > width) this.x = -10;
                        if (this.y > height) this.y = 0;
                        if (this.y < 0) this.y = height;
                    },
                    draw() {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 153, 170, ${this.opacity})`;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = '#ff99aa';
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                };
            }
        }
    };

    let activeEffect = null;

    function animate() {
        if (activeEffect.clear) {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);
        } else {
            ctx.fillStyle = activeEffect.trail || 'rgba(5, 5, 5, 0.2)';
            ctx.fillRect(0, 0, width, height);
        }

        if (activeEffect.tick) activeEffect.tick();

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        rafId = requestAnimationFrame(animate);
    }

    function init(type) {
        const effect = effects[type];
        if (!effect) {
            console.warn('Unknown particle effect:', type);
            return;
        }
        activeEffect = effect;
        particles = [];
        particleState = 0;
        time = 0;
        for (let i = 0; i < effect.count; i++) {
            particles.push(effect.create());
        }
        if (rafId) cancelAnimationFrame(rafId);
        animate();
    }

    function onChapterChange(state) {
        if (activeEffect && activeEffect.onChapterChange) {
            activeEffect.onChapterChange(state);
        }
    }

    const autoType = document.body.dataset.particle;
    if (autoType) init(autoType);

    return { init, onChapterChange };
})();
