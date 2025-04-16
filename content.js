(function() {
    let currentUrl = window.location.href;
    let isObserving = false;
    let buttonObserver = null;
    let pageObserver = null;
    
    // Create the copy button
    function createCopyButton() {
      // Remove any existing buttons first to prevent duplicates
      const existingButton = document.getElementById('shopee-copy-categories-btn');
      if (existingButton) {
        existingButton.remove();
      }
      
      // Find the category filter section specifically
      const categorySection = document.querySelector('.shopee-filter-group.shopee-facet-filter');
      if (!categorySection) {
        // If no category section is found, don't add the button
        return;
      }
      
      // Check if the legend text is "Berdasarkan Kategori" to ensure we have the right section
      const legend = categorySection.querySelector('legend.shopee-filter-group__header');
      if (!legend || legend.textContent !== 'Berdasarkan Kategori') {
        return;
      }
      
      // Create the button
      const button = document.createElement('button');
      button.id = 'shopee-copy-categories-btn';
      button.textContent = 'Copy Categories';
      
      // Important: Use anonymous function to ensure we get a fresh reference to categorySection
      button.addEventListener('click', function() {
        // Find the section again to ensure we have the latest DOM reference
        const freshCategorySection = document.querySelector('.shopee-filter-group.shopee-facet-filter');
        if (freshCategorySection) {
          const freshLegend = freshCategorySection.querySelector('legend.shopee-filter-group__header');
          if (freshLegend && freshLegend.textContent === 'Berdasarkan Kategori') {
            copyCategories(freshCategorySection);
          }
        }
      });
      
      // Insert the button right after the category section
      categorySection.parentNode.insertBefore(button, categorySection.nextSibling);
      
      // Setup observer for this button to detect if it gets removed
      observeButtonPresence(button);
    }
    
    // Observe if the button is removed from DOM and recreate if needed
    function observeButtonPresence(button) {
      if (buttonObserver) {
        buttonObserver.disconnect();
      }
      
      buttonObserver = new MutationObserver((mutations) => {
        if (!document.body.contains(button)) {
          createCopyButton();
        }
      });
      
      buttonObserver.observe(button.parentNode, { 
        childList: true,
        subtree: false
      });
    }
    
    // Function to copy categories from the specific category section
    function copyCategories(categorySection) {
      // First click the "Lainnya" button if it exists to expand all categories
      const expandButton = categorySection.querySelector('.shopee-filter-group__toggle-btn');
      if (expandButton && expandButton.getAttribute('aria-expanded') === 'false') {
        expandButton.click();
        
        // Wait a moment for categories to expand
        setTimeout(() => extractAndCopy(categorySection), 500);
      } else {
        extractAndCopy(categorySection);
      }
    }
    
    function extractAndCopy(categorySection) {
      // Extract only category names from this specific section
      const categoryElements = categorySection.querySelectorAll('.shopee-checkbox__label');
      const categories = Array.from(categoryElements).map(element => {
        // Get the category name without the count (e.g., "Sneakers" instead of "Sneakers (42RB+)")
        const fullText = element.textContent;
        return fullText.replace(/\s*\([^)]*\)$/, '');
      });
      
      // Join with semicolons
      const formattedCategories = categories.join('; ');
      
      // Copy to clipboard
      navigator.clipboard.writeText(formattedCategories)
        .then(() => {
          showCopyNotification('Categories copied to clipboard!');
        })
        .catch(err => {
          showCopyNotification('Failed to copy categories', true);
          console.error('Could not copy text: ', err);
        });
    }
    
    // Show a temporary notification
    function showCopyNotification(message, isError = false) {
      // Remove any existing notifications
      const existingNotifications = document.querySelectorAll('.shopee-copy-notification');
      existingNotifications.forEach(notification => {
        document.body.removeChild(notification);
      });
      
      const notification = document.createElement('div');
      notification.className = isError 
        ? 'shopee-copy-notification error' 
        : 'shopee-copy-notification success';
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);
    }
    
    // Function to detect URL changes
    function checkURLChange() {
      if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        
        // URL changed, need to refresh everything
        console.log("URL changed, refreshing extension...");
        
        // Reset observers
        if (buttonObserver) {
          buttonObserver.disconnect();
          buttonObserver = null;
        }
        
        // Try to create the button after a delay to ensure the page has loaded
        setTimeout(() => {
          createCopyButton();
        }, 2000);
      }
    }
    
    // Function to initialize and set up observers
    function initialize() {
      // Initial attempt to create the button
      createCopyButton();
      
      // Set up a mutation observer to handle dynamic page changes
      if (!isObserving) {
        pageObserver = new MutationObserver((mutations) => {
          // Check if our button exists, if not try to create it
          if (!document.getElementById('shopee-copy-categories-btn')) {
            createCopyButton();
          }
          
          // Check if URL changed (for SPA behavior)
          checkURLChange();
        });
        
        // Observe changes to the body
        pageObserver.observe(document.body, { 
          childList: true, 
          subtree: true,
          characterData: false
        });
        
        isObserving = true;
        
        // Also set interval to check URL changes
        setInterval(checkURLChange, 1000);
      }
    }
    
    // Run the script when page is fully loaded
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => {
        // Wait a bit to make sure Shopee's interface is fully loaded
        setTimeout(initialize, 1500);
      });
    } else {
      // DOM already loaded
      setTimeout(initialize, 1500);
    }
    
    // Additional event listeners for navigation detection
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        createCopyButton();
      }, 1500);
    });
    
    window.addEventListener('pushState', () => {
      setTimeout(() => {
        createCopyButton();
      }, 1500);
    });
    
    window.addEventListener('replaceState', () => {
      setTimeout(() => {
        createCopyButton();
      }, 1500);
    });
  })();