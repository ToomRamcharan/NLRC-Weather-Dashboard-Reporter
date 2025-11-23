// Weather Dashboard Configuration
const CONFIG = {
    API_KEY: '67c6e780ecf74b253203a296bba3b0bd',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric',
    LANGUAGE: 'en',

    // App Settings
    APP_NAME: 'NLRC Weather Reporter',
    SPLASH_DURATION: 3000, // milliseconds
    MAX_HISTORY: 5,

    // Animation Settings
    ENABLE_3D: true,
    PARTICLE_COUNT: 100,
    ANIMATION_SPEED: 1.0
};

// Note: For production, move API_KEY to environment variables
// This is a client-side app, so the key will be visible in the browser
// For true security, implement a backend proxy server
