// 3D Animations and Effects using Three.js
class WeatherAnimations {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.animationFrame = null;
        this.currentWeather = 'clear';
    }

    init() {
        if (!CONFIG.ENABLE_3D) return;

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-canvas'),
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createRainParticles() {
        this.clearParticles();

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const x = Math.random() * 20 - 10;
            const y = Math.random() * 20;
            const z = Math.random() * 20 - 10;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0x4fc3f7,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const rain = new THREE.Points(geometry, material);
        this.scene.add(rain);
        this.particles.push(rain);
    }

    createSnowParticles() {
        this.clearParticles();

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const x = Math.random() * 20 - 10;
            const y = Math.random() * 20;
            const z = Math.random() * 20 - 10;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });

        const snow = new THREE.Points(geometry, material);
        this.scene.add(snow);
        this.particles.push(snow);
    }

    createCloudParticles() {
        this.clearParticles();

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < CONFIG.PARTICLE_COUNT / 2; i++) {
            const x = Math.random() * 20 - 10;
            const y = Math.random() * 5 + 3;
            const z = Math.random() * 20 - 10;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0xe0e0e0,
            size: 0.3,
            transparent: true,
            opacity: 0.5
        });

        const clouds = new THREE.Points(geometry, material);
        this.scene.add(clouds);
        this.particles.push(clouds);
    }

    createStarParticles() {
        this.clearParticles();

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < CONFIG.PARTICLE_COUNT * 2; i++) {
            const x = Math.random() * 40 - 20;
            const y = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        this.particles.push(stars);
    }

    clearParticles() {
        this.particles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.particles = [];
    }

    updateWeather(weatherCondition) {
        this.currentWeather = weatherCondition.toLowerCase();

        if (this.currentWeather.includes('rain') || this.currentWeather.includes('drizzle')) {
            this.createRainParticles();
        } else if (this.currentWeather.includes('snow')) {
            this.createSnowParticles();
        } else if (this.currentWeather.includes('cloud')) {
            this.createCloudParticles();
        } else if (this.currentWeather.includes('clear')) {
            this.createStarParticles();
        } else {
            this.clearParticles();
        }
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());

        // Animate particles
        this.particles.forEach(particle => {
            const positions = particle.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Rain/Snow falling effect
                if (this.currentWeather.includes('rain')) {
                    positions[i + 1] -= 0.1 * CONFIG.ANIMATION_SPEED;
                    if (positions[i + 1] < -10) positions[i + 1] = 10;
                } else if (this.currentWeather.includes('snow')) {
                    positions[i + 1] -= 0.03 * CONFIG.ANIMATION_SPEED;
                    positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
                    if (positions[i + 1] < -10) positions[i + 1] = 10;
                } else if (this.currentWeather.includes('cloud')) {
                    positions[i] += 0.01 * CONFIG.ANIMATION_SPEED;
                    if (positions[i] > 10) positions[i] = -10;
                } else if (this.currentWeather.includes('clear')) {
                    // Twinkling stars
                    particle.material.opacity = 0.5 + Math.sin(Date.now() * 0.001 + i) * 0.3;
                }
            }

            particle.geometry.attributes.position.needsUpdate = true;
        });

        // Rotate scene slightly for depth
        this.scene.rotation.y += 0.0005;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.clearParticles();
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize animations when DOM is ready
let weatherAnimations;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        weatherAnimations = new WeatherAnimations();
        weatherAnimations.init();
    }
});
