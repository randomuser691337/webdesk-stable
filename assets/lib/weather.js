var canvases = {
    snow: function (el) {
        const NUMBER_OF_SNOWFLAKES = 200;
        const MAX_SNOWFLAKE_SIZE = 3;
        const MAX_SNOWFLAKE_SPEED = 3;
        const SNOWFLAKE_COLOUR = '#ddd';
        const snowflakes = [];

        const canvas = el;
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        canvas.style.top = '0px';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');


        const createSnowflake = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
            color: SNOWFLAKE_COLOUR,
            speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
            sway: Math.random() - 0.5
        });

        const drawSnowflake = snowflake => {
            ctx.beginPath();
            ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
            ctx.fillStyle = snowflake.color;
            ctx.fill();
            ctx.closePath();
        }

        const updateSnowflake = snowflake => {
            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.sway; // next
            if (snowflake.y > canvas.height) {
                Object.assign(snowflake, createSnowflake());
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snowflakes.forEach(snowflake => {
                updateSnowflake(snowflake);
                drawSnowflake(snowflake);
            });

            requestAnimationFrame(animate);
        }

        for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
            snowflakes.push(createSnowflake());
        }

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        window.addEventListener('scroll', () => {
            canvas.style.top = `${window.scrollY}px`;
        });

        animate()
    },
    rain: function (el) {
        const rainContainer = document.querySelector('.rain-container');
        const numberOfDrops = 150;

        for (let i = 0; i < numberOfDrops; i++) {
            const raindrop = document.createElement('div');
            raindrop.classList.add('raindrop');

            raindrop.style.left = `${Math.random() * 100}vw`;

            const size = Math.random() * 0.5 + 0.5;
            raindrop.style.transform = `scale(${size})`;

            raindrop.style.animationDuration = `${Math.random() * 2 + 1}s`;
            raindrop.style.animationDelay = `-${Math.random() * 2}s`;

            rainContainer.appendChild(raindrop);

            raindrop.addEventListener('animationiteration', () => {
                createSplash(raindrop);
            });
        }

        function createSplash(raindrop) {
            const splash = document.createElement('div');
            splash.classList.add('splash');

            const dropX = raindrop.style.left;
            const dropY = window.innerHeight;

            splash.style.left = dropX;
            splash.style.top = `${dropY - 5}px`;

            rainContainer.appendChild(splash);

            setTimeout(() => {
                splash.remove();
            }, 300);
        }
    }
}