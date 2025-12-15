// 1. Reveal Elements on Scroll
        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 150;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);
        // Trigger once on load
        reveal();

        // 2. Number Counter Animation
        const counters = document.querySelectorAll('.counter');
        let hasAnimatedCounters = false;

        function animateCounters() {
            if (hasAnimatedCounters) return;
            const triggerBottom = window.innerHeight / 5 * 4;
            // Check if first counter is visible
            if(counters[0] && counters[0].getBoundingClientRect().top < triggerBottom) {
                hasAnimatedCounters = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const increment = target / 50; 
                    const updateCounter = () => {
                        const c = +counter.innerText;
                        if(c < target) {
                            counter.innerText = Math.ceil(c + increment);
                            setTimeout(updateCounter, 30);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                    };
                    updateCounter();
                });
            }
        }
        window.addEventListener('scroll', animateCounters);