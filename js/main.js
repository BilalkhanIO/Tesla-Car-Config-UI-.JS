// DOM Elements
const topBar = document.querySelector('#top-bar');
const exteriorColorSection = document.querySelector('#exterior-buttons');
const interiorColorSection = document.querySelector('#interior-buttons');
const exteriorImage = document.querySelector('#exterior-image');
const interiorImage = document.querySelector('#interior-image');
const wheelButtonsSection = document.querySelector('#wheel-buttons');
const performanceBtn = document.querySelector('#performance-btn');
const totalPriceElement = document.querySelector('#total-price');
const fullSelfDrivingCheckbox = document.querySelector('#full-self-driving-checkbox');
const accessoryCheckboxes = document.querySelectorAll('.accessory-form-checkbox');
const downPaymentElement = document.querySelector('#down-payment');
const monthlyPaymentElement = document.querySelector('#monthly-payment');

// Configuration and Pricing
const basePrice = 52490;
let currentPrice = basePrice;

let selectedColor = 'Stealth Grey';
const selectedOptions = {
    'Performance Wheels': false,
    'Performance Package': false,
    'Full Self-Driving': false,
};

const pricing = {
    'Performance Wheels': 2500,
    'Performance Package': 5000,
    'Full Self-Driving': 8500,
    Accessories: {
        'Center Console Trays': 35,
        'Sunshade': 105,
        'All-Weather Interior Liners': 225,
    }
};

// Image Mapping
const exteriorImages = {
    'Stealth Grey': './images/model-y-stealth-grey.jpg',
    'Pearl White': './images/model-y-pearl-white.jpg',
    'Deep Blue': './images/model-y-deep-blue-metallic.jpg',
    'Solid Black': './images/model-y-solid-black.jpg',
    'Ultra Red': './images/model-y-ultra-red.jpg',
    'Quicksilver': './images/model-y-quicksilver.jpg'
};

const interiorImages = {
    'Dark': './images/model-y-interior-dark.jpg',
    'Light': './images/model-y-interior-light.jpg'
};

// Event Handlers
const handleColorButtonClick = (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const buttons = event.currentTarget.querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove('btn-selected'));
    button.classList.add('btn-selected');

    if (event.currentTarget === exteriorColorSection) {
        selectedColor = button.querySelector('img').alt;
        updateExteriorImage();
    } else if (event.currentTarget === interiorColorSection) {
        const color = button.querySelector('img').alt;
        interiorImage.src = interiorImages[color];
    }
};

const updateExteriorImage = () => {
    const performanceSuffix = selectedOptions['Performance Wheels'] ? '-performance' : '';
    const colorKey = selectedColor in exteriorImages ? selectedColor : 'Stealth Grey';
    exteriorImage.src = exteriorImages[colorKey].replace('.jpg', `${performanceSuffix}.jpg`);
};

const handleWheelButtonClick = (event) => {
    if (event.target.tagName !== 'BUTTON') return;
    
    const buttons = wheelButtonsSection.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-gray-700', 'text-white');
        btn.classList.add('bg-gray-200');
    });

    event.target.classList.add('bg-gray-700', 'text-white');
    event.target.classList.remove('bg-gray-200');

    selectedOptions['Performance Wheels'] = event.target.textContent.includes('Performance');
    updateExteriorImage();
    updateTotalPrice();
};

const handlePerformanceButtonClick = () => {
    selectedOptions['Performance Package'] = !selectedOptions['Performance Package'];
    performanceBtn.classList.toggle('bg-gray-700');
    performanceBtn.classList.toggle('text-white');
    updateTotalPrice();
};

// Price Updates
const updateTotalPrice = () => {
    currentPrice = basePrice;
    
    Object.entries(selectedOptions).forEach(([option, isSelected]) => {
        if (isSelected && pricing[option]) {
            currentPrice += pricing[option];
        }
    });

    accessoryCheckboxes.forEach(checkbox => {
        const accessoryLabel = checkbox.closest('label').querySelector('span').textContent.trim();
        if (checkbox.checked && pricing.Accessories[accessoryLabel]) {
            currentPrice += pricing.Accessories[accessoryLabel];
        }
    });

    totalPriceElement.textContent = `$${currentPrice.toLocaleString()}`;
    updatePaymentBreakdown();
};

const updatePaymentBreakdown = () => {
    const downPayment = currentPrice * 0.1;
    downPaymentElement.textContent = `$${downPayment.toLocaleString()}`;

    const loanAmount = currentPrice - downPayment;
    const monthlyInterestRate = 0.03 / 12;
    const loanTermMonths = 60;

    const monthlyPayment = (loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths))) /
        (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);

    monthlyPaymentElement.textContent = `$${monthlyPayment.toFixed(2).toLocaleString()}`;
};

// Configuration Management
const configManager = {
    saveConfiguration() {
        const config = {
            id: Date.now(),
            selectedColor,
            selectedOptions,
            currentPrice,
            timestamp: new Date().toISOString()
        };
        
        let savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
        savedConfigs.push(config);
        localStorage.setItem('savedConfigs', JSON.stringify(savedConfigs));
        
        return config.id;
    },

    loadConfiguration(configId) {
        const savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
        const config = savedConfigs.find(c => c.id === configId);
        if (config) {
            selectedColor = config.selectedColor;
            Object.assign(selectedOptions, config.selectedOptions);
            updateUI();
        }
    },

    shareConfiguration() {
        const configId = this.saveConfiguration();
        const shareUrl = `${window.location.origin}${window.location.pathname}?config=${configId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Tesla Model Y Configuration',
                text: 'Check out my Tesla Model Y configuration!',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Configuration link copied to clipboard!');
        }
    }
};

// Add lazy loading for images
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                configManager.saveConfiguration();
                break;
            case 'o':
                e.preventDefault();
                // Show saved configurations
                break;
        }
    }
});

// Event Listeners
window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        const atTop = window.scrollY === 0;
        topBar.classList.toggle('visible', atTop);
        topBar.classList.toggle('hidden', !atTop);
    });
});

exteriorColorSection.addEventListener('click', handleColorButtonClick);
interiorColorSection.addEventListener('click', handleColorButtonClick);
wheelButtonsSection.addEventListener('click', handleWheelButtonClick);
performanceBtn.addEventListener('click', handlePerformanceButtonClick);
fullSelfDrivingCheckbox.addEventListener('change', () => {
    selectedOptions['Full Self-Driving'] = fullSelfDrivingCheckbox.checked;
    updateTotalPrice();
});
accessoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateTotalPrice);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    
    // Check for shared configuration
    const urlParams = new URLSearchParams(window.location.search);
    const sharedConfigId = urlParams.get('config');
    if (sharedConfigId) {
        configManager.loadConfiguration(parseInt(sharedConfigId));
    }
    
    updateTotalPrice();
});
