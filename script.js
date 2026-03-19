// 1. 初始化 Three.js 场景
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// 2. 粒子参数设置
const PARTICLE_COUNT = 4000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3); // 当前位置
const targetPositions = new Float32Array(PARTICLE_COUNT * 3); // 目标心形位置
const randomPositions = new Float32Array(PARTICLE_COUNT * 3); // 初始/消散的随机位置

// 生成心形坐标的数学公式
function getHeartPosition(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x * 0.8, y: y * 0.8 }; // 缩放系数
}

// 初始化粒子位置
for (let i = 0; i < PARTICLE_COUNT; i++) {
    // 初始位置分布在很远的空间
    const rx = (Math.random() - 0.5) * 400;
    const ry = (Math.random() - 0.5) * 400;
    const rz = (Math.random() - 0.5) * 400;
    
    randomPositions[i * 3] = rx;
    randomPositions[i * 3 + 1] = ry;
    randomPositions[i * 3 + 2] = rz;

    // 当前位置先等于随机位置
    positions[i * 3] = rx;
    positions[i * 3 + 1] = ry;
    positions[i * 3 + 2] = rz;

    // 计算目标心形位置
    const t = Math.random() * Math.PI * 2;
    const heartPos = getHeartPosition(t);
    // 给心形增加一定的 3D 厚度 (Z轴随机)
    const zOffset = (Math.random() - 0.5) * 10;
    
    // 加一点随机散射，让心形看起来像星云而不是单薄的线
    const scatter = (Math.random() - 0.5) * 2;

    targetPositions[i * 3] = heartPos.x + scatter;
    targetPositions[i * 3 + 1] = heartPos.y + scatter;
    targetPositions[i * 3 + 2] = zOffset;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// 粒子材质 (粉色发光点)
const material = new THREE.PointsMaterial({
    color: 0xff4d6d,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// 3. 动画状态机
let state = 'gathering'; // gathering, beating, dissolving
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    const positionsAttribute = geometry.attributes.position;
    
    if (state === 'gathering') {
        // 从随机位置向心形平滑过渡
        let allArrived = true;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            positionsAttribute.array[ix] += (targetPositions[ix] - positionsAttribute.array[ix]) * 0.02;
            positionsAttribute.array[iy] += (targetPositions[iy] - positionsAttribute.array[iy]) * 0.02;
            positionsAttribute.array[iz] += (targetPositions[iz] - positionsAttribute.array[iz]) * 0.02;
            
            if (Math.abs(targetPositions[ix] - positionsAttribute.array[ix]) > 0.1) allArrived = false;
        }
        if (allArrived) {
            state = 'beating';
            document.getElementById('hint').style.opacity = 1;
            // 允许点击
            container.addEventListener('click', showModal);
        }
    } else if (state === 'beating') {
        // 心跳效果 (结合正弦波的整体缩放)
        time += 0.05;
        const scale = 1 + Math.sin(time) * 0.05 + Math.sin(time * 2) * 0.02;
        particleSystem.scale.set(scale, scale, scale);
        // 缓慢自转
        particleSystem.rotation.y += 0.005;
    } else if (state === 'dissolving') {
        // 验证成功，粒子消散
        particleSystem.scale.set(1, 1, 1); // 停止心跳缩放
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            // 向随机位置飞散
            positionsAttribute.array[ix] += (randomPositions[ix] - positionsAttribute.array[ix]) * 0.05;
            positionsAttribute.array[iy] += (randomPositions[iy] - positionsAttribute.array[iy]) * 0.05;
            positionsAttribute.array[iz] += (randomPositions[iz] - positionsAttribute.array[iz]) * 0.05;
        }
        material.opacity -= 0.01; // 渐渐变透明
    }

    positionsAttribute.needsUpdate = true;
    renderer.render(scene, camera);
}
animate();

// 窗口尺寸自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 4. UI 交互逻辑
const modal = document.getElementById('modal');
const hint = document.getElementById('hint');

function showModal() {
    modal.classList.remove('hidden');
    hint.style.opacity = 0;
    container.removeEventListener('click', showModal); // 防止重复点击
}

// 填充日期下拉框
const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');
const daySelect = document.getElementById('day');

for (let i = 2020; i <= 2030; i++) yearSelect.add(new Option(i, i));
for (let i = 1; i <= 12; i++) monthSelect.add(new Option(i, i));
for (let i = 1; i <= 31; i++) daySelect.add(new Option(i, i));

// 设置默认选中你们相遇的年份附近，避免找太久
yearSelect.value = 2026;
monthSelect.value = 3;

// 验证逻辑
// document.getElementById('verify-btn').addEventListener('click', () => {
//     const y = parseInt(yearSelect.value);
//     const m = parseInt(monthSelect.value);
//     const d = parseInt(daySelect.value);

//     // 核心密码：2026年3月14日
//     if (y === 2026 && m === 3 && d === 14) {
//         modal.classList.add('hidden');
//         document.getElementById('error-msg').classList.add('hidden');
        
//         // 触发消散动画
//         state = 'dissolving';
        
//         // 延时 2.5 秒后跳转到第二页
//         setTimeout(() => {
//             window.location.href = 'page2.html';
//         }, 2500);
//     } else {
//         document.getElementById('error-msg').classList.remove('hidden');
//     }
// });
// 验证逻辑
document.getElementById('verify-btn').addEventListener('click', () => {
    const y = parseInt(yearSelect.value);
    const m = parseInt(monthSelect.value);
    const d = parseInt(daySelect.value);

    // 核心密码：2026年3月14日
    if (y === 2026 && m === 3 && d === 14) {
        modal.classList.add('hidden');
        
        // 增加安全判断：如果存在错误提示标签，才去隐藏它
        const errorMsg = document.getElementById('error-msg');
        if (errorMsg) errorMsg.classList.add('hidden');
        
        // 触发消散动画
        state = 'dissolving';
        
        // 延时 2.5 秒后跳转到第二页
        setTimeout(() => {
            window.location.href = 'page2.html';
        }, 2500);
    } else {
        // 增加安全判断：如果存在错误提示标签，才去显示它
        const errorMsg = document.getElementById('error-msg');
        if (errorMsg) errorMsg.classList.remove('hidden');
    }
});
