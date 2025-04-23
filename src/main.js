// Project filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const projectCards = document.querySelectorAll('#projects .project-card');
    
    // Add click event to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const selectedCategory = this.getAttribute('data-category');
            
            // Filter projects with animation
            projectCards.forEach(card => {
                // First make all cards slightly transparent
                card.style.opacity = '0.4';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (selectedCategory === 'all') {
                        card.classList.remove('hidden');
                        setTimeout(() => {
                            // Remove inline styles after animation to allow CSS hover to work
                            card.style.opacity = '';
                            card.style.transform = '';
                        }, 50);
                    } else {
                        const categories = card.getAttribute('data-categories');
                        if (categories && categories.includes(selectedCategory)) {
                            card.classList.remove('hidden');
                            setTimeout(() => {
                                // Remove inline styles after animation to allow CSS hover to work
                                card.style.opacity = '';
                                card.style.transform = '';
                            }, 50);
                        } else {
                            card.classList.add('hidden');
                        }
                    }
                }, 200);
            });
        });
    });
    
    // Update category indicators based on data-categories
    projectCards.forEach(card => {
        const categoriesAttr = card.getAttribute('data-categories');
        if (categoriesAttr) {
            const categories = categoriesAttr.split(' ');
            const indicator = card.querySelector('.category-indicator');
            
            if (indicator) {
                let categoryText = '';
                categories.forEach((cat, index) => {
                    switch(cat) {
                        case 'web3d':
                            categoryText += 'Web 3D';
                            break;
                        case 'nodejs':
                            categoryText += 'Node.js';
                            break;
                        case 'figma':
                            categoryText += 'Figma';
                            break;
                        case 'ml':
                            categoryText += 'ML/DL';
                            break;
                        case 'play':
                            categoryText += 'Google Play';
                            break;
                        default:
                            categoryText += cat;
                    }
                    
                    if (index < categories.length - 1) {
                        categoryText += ', ';
                    }
                });
                
                indicator.textContent = categoryText;
            }
        }
    });
});