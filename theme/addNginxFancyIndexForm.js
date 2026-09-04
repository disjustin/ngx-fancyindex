// addNginxFancyIndexForm.js
// Enhances the Nginx FancyIndex page with search, theme, sorting, pagination, and more.
// Optimized for modern browsers: Chrome, Firefox, Safari, Edge
// © 2017, Lilian Besson (Naereen) and contributors,
// open-sourced under the MIT License, https://lbesson.mit-license.org/
// hosted on GitHub, https://GitHub.com/Naereen/Nginx-Fancyindex-Theme

(function () {
        'use strict';

        const THEME_STORAGE_KEY = 'fancyindex-theme';
        const SPACING_STORAGE_KEY = 'fancyindex-spacing';
        const ITEMS_PER_PAGE = 100;

        // Service Worker disabled for built-in theme (assets served from module)

        const form = document.createElement('form');
        const input = document.createElement('input');
        const heading = document.querySelector('h1');
        const themeToggle = document.createElement('button');
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const table = document.querySelector('#list');
        const tbody = table?.querySelector('tbody');
        const thead = table?.querySelector('thead');

        // Sorting state
        let currentSort = { column: 'name', order: 'asc' };

        // Parse current sort from URL
        function parseSortFromURL() {
                const params = new URLSearchParams(window.location.search);
                const c = params.get('C');
                const o = params.get('O');

                if (c) {
                        switch (c) {
                                case 'N': currentSort.column = 'name'; break;
                                case 'S': currentSort.column = 'size'; break;
                                case 'M': currentSort.column = 'date'; break;
                        }
                }
                if (o) {
                        currentSort.order = o === 'D' ? 'desc' : 'asc';
                }
        }

        // Setup sortable column headers with arrow icons
        function setupSortableHeaders() {
                if (!thead) return;

                const headerRow = thead.querySelector('tr');
                if (!headerRow) return;

                // Clear existing content and rebuild headers
                const headers = [
                        { key: 'name', label: 'File Name', param: 'N', colspan: 2 },
                        { key: 'size', label: 'File Size', param: 'S' },
                        { key: 'date', label: 'Date', param: 'M' }
                ];

                headerRow.innerHTML = '';

                headers.forEach(header => {
                        const th = document.createElement('th');
                        if (header.colspan) th.colSpan = header.colspan;

                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'sort-header';
                        btn.setAttribute('data-sort', header.key);

                        const labelSpan = document.createElement('span');
                        labelSpan.className = 'sort-label';
                        labelSpan.textContent = header.label;

                        const arrowSpan = document.createElement('span');
                        arrowSpan.className = 'sort-arrow';
                        arrowSpan.setAttribute('aria-hidden', 'true');

                        // Set initial arrow state
                        if (currentSort.column === header.key) {
                                btn.classList.add('active');
                                arrowSpan.textContent = currentSort.order === 'asc' ? ' ↑' : ' ↓';
                                btn.setAttribute('aria-sort', currentSort.order === 'asc' ? 'ascending' : 'descending');
                        } else {
                                arrowSpan.textContent = '';
                        }

                        btn.appendChild(labelSpan);
                        btn.appendChild(arrowSpan);

                        btn.addEventListener('click', () => {
                                // Toggle order if same column, otherwise default to ascending
                                let newOrder;
                                if (currentSort.column === header.key) {
                                        newOrder = currentSort.order === 'asc' ? 'D' : 'A';
                                } else {
                                        newOrder = 'A';
                                }

                                // Navigate to sorted URL
                                const url = new URL(window.location.href);
                                url.searchParams.set('C', header.param);
                                url.searchParams.set('O', newOrder);
                                window.location.href = url.toString();
                        });

                        th.appendChild(btn);
                        headerRow.appendChild(th);
                });
        }

        // Adopt the toolbar rendered by the theme header, or build it when absent
        const toolbar = document.querySelector('.top-toolbar') || document.createElement('div');
        toolbar.className = 'top-toolbar';

        // Title on left side
        if (!toolbar.querySelector('.toolbar-title')) {
                const toolbarTitle = document.createElement('span');
                toolbarTitle.className = 'toolbar-title';
                toolbarTitle.textContent = 'Nginx Static File Server';
                toolbar.appendChild(toolbarTitle);
        }

        // Right side controls container
        const toolbarControls = toolbar.querySelector('.toolbar-controls') || document.createElement('div');
        toolbarControls.className = 'toolbar-controls';

        // Search input (added to toolbar controls)
        input.name = 'filter';
        input.id = 'search';
        input.type = 'search';
        input.placeholder = 'Search...';
        input.setAttribute('aria-label', 'Search directory');
        form.className = 'toolbar-search';
        form.appendChild(input);
        toolbarControls.appendChild(form);

        // Line spacing toggle
        const spacingToggle = document.createElement('button');
        spacingToggle.type = 'button';
        spacingToggle.className = 'spacing-toggle';
        spacingToggle.setAttribute('aria-label', 'Change line spacing');

        const spacingOptions = ['compact', 'normal', 'comfortable'];
        const spacingIcons = { compact: '≡', normal: '☰', comfortable: '═' };
        const spacingLabels = { compact: 'Compact spacing', normal: 'Normal spacing', comfortable: 'Comfortable spacing' };
        let currentSpacingIndex = 1; // Default to normal

        function updateSpacingButton() {
                const spacing = spacingOptions[currentSpacingIndex];
                spacingToggle.innerHTML = spacingIcons[spacing];
                spacingToggle.title = spacingLabels[spacing];
                spacingToggle.setAttribute('data-spacing', spacing);
        }

        function applySpacing(spacing) {
                root.classList.remove('spacing-compact', 'spacing-normal', 'spacing-comfortable');
                root.classList.add(`spacing-${spacing}`);
        }

        function getStoredSpacing() {
                try {
                        return localStorage.getItem(SPACING_STORAGE_KEY) || 'normal';
                } catch (error) {
                        return 'normal';
                }
        }

        function storeSpacing(spacing) {
                try {
                        localStorage.setItem(SPACING_STORAGE_KEY, spacing);
                } catch (error) {
                        // Storage not available
                }
        }

        spacingToggle.addEventListener('click', () => {
                currentSpacingIndex = (currentSpacingIndex + 1) % 3;
                const spacing = spacingOptions[currentSpacingIndex];
                storeSpacing(spacing);
                applySpacing(spacing);
                updateSpacingButton();
        });

        // Initialize spacing
        const storedSpacing = getStoredSpacing();
        currentSpacingIndex = spacingOptions.indexOf(storedSpacing);
        if (currentSpacingIndex === -1) currentSpacingIndex = 1;
        applySpacing(storedSpacing);
        updateSpacingButton();

        toolbarControls.appendChild(spacingToggle);

        
        parseSortFromURL();
        setupSortableHeaders();
        
        // Create breadcrumb navigation from h1
        function createBreadcrumbs() {
                if (!heading) return;

                const pathText = heading.textContent.trim();
                if (!pathText || pathText === '/') return;

                const breadcrumbNav = document.createElement('nav');
                breadcrumbNav.className = 'breadcrumb-nav';
                breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');

                const parts = pathText.split('/').filter(p => p);
                let currentPath = '';

                const breadcrumbList = document.createElement('ol');
                breadcrumbList.className = 'breadcrumb';

                // Add root (using hostname)
                const rootLi = document.createElement('li');
                const rootLink = document.createElement('a');
                rootLink.href = '/';
                rootLink.textContent = window.location.hostname;
                rootLi.appendChild(rootLink);
                breadcrumbList.appendChild(rootLi);

                // Add each path segment
                parts.forEach((part, index) => {
                        currentPath += '/' + part;
                        const li = document.createElement('li');

                        if (index === parts.length - 1) {
                                // Last item - current directory
                                li.textContent = part;
                                li.setAttribute('aria-current', 'page');
                                li.className = 'breadcrumb-current';
                        } else {
                                const link = document.createElement('a');
                                link.href = currentPath + '/';
                                link.textContent = part;
                                li.appendChild(link);
                        }

                        breadcrumbList.appendChild(li);
                });

                breadcrumbNav.appendChild(breadcrumbList);

                // Add copy URL button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-page-url-btn';
                copyBtn.textContent = 'Copy URL';
                copyBtn.title = 'Copy current page URL';
                copyBtn.setAttribute('aria-label', 'Copy current page URL');
                copyBtn.type = 'button';

                copyBtn.addEventListener('click', async () => {
                        const url = window.location.href;
                        try {
                                const originalText = copyBtn.textContent;
                                if (navigator.clipboard && window.isSecureContext) {
                                        await navigator.clipboard.writeText(url);
                                } else {
                                        //https://stackoverflow.com/a/33928558
                                        const textarea = document.createElement('textarea');
                                        textarea.value = url;
                                        document.body.appendChild(textarea);
                                        textarea.select();
                                        textarea.setSelectionRange(0, 99999); // For mobile devices
                                        // Execute the copy command
                                        document.execCommand('copy');
                                        document.body.removeChild(textarea);
                                }
                                //console.log('Text copied to clipboard:', url);
                                copyBtn.textContent = 'Copied!';
                                setTimeout(() => {
                                        copyBtn.textContent = originalText;
                                }, 2000);
                        } catch (err) {
                                console.error(err)
                                const originalText = copyBtn.textContent;
                                copyBtn.textContent = 'Failed';
                                setTimeout(() => {
                                        copyBtn.textContent = originalText;
                                }, 2000);
                        }
                });

                breadcrumbNav.appendChild(copyBtn);
                heading.replaceWith(breadcrumbNav);
        }

        createBreadcrumbs();

        // Theme toggle with Auto/Light/Dark modes (icon-based)
        themeToggle.type = 'button';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Change theme');

        const themeOptions = ['auto', 'light', 'dark'];
        const themeIcons = { auto: '◐', light: '☀', dark: '☾' };
        const themeLabels = { auto: 'Auto theme', light: 'Light theme', dark: 'Dark theme' };
        let currentThemeIndex = 0;

        function updateThemeButton() {
                const theme = themeOptions[currentThemeIndex];
                themeToggle.innerHTML = themeIcons[theme];
                themeToggle.title = themeLabels[theme];
                themeToggle.setAttribute('data-theme', theme);
        }

        themeToggle.addEventListener('click', () => {
                currentThemeIndex = (currentThemeIndex + 1) % 3;
                const theme = themeOptions[currentThemeIndex];
                storeTheme(theme);
                applyTheme(theme);
                updateThemeButton();
        });

        toolbarControls.appendChild(themeToggle);
        if (!toolbarControls.parentNode) {
                toolbar.appendChild(toolbarControls);
        }

        // Insert toolbar at top of body
        if (!toolbar.parentNode) {
                document.body.insertBefore(toolbar, document.body.firstChild);
        }

        const listItems = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
        let filteredItems = [...listItems];
        let currentPage = 1;

        // Pagination
        function createPagination() {
                const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
                if (totalPages <= 1) return null;

                const paginationDiv = document.createElement('div');
                paginationDiv.className = 'pagination';
                paginationDiv.setAttribute('role', 'navigation');
                paginationDiv.setAttribute('aria-label', 'Pagination');

                const info = document.createElement('span');
                info.className = 'pagination-info';
                const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
                const end = Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length);
                info.textContent = `Showing ${start}-${end} of ${filteredItems.length}`;
                paginationDiv.appendChild(info);

                const buttonsDiv = document.createElement('div');
                buttonsDiv.className = 'pagination-buttons';

                // Previous button
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '← Previous';
                prevBtn.className = 'pagination-btn';
                prevBtn.disabled = currentPage === 1;
                prevBtn.addEventListener('click', () => {
                        if (currentPage > 1) {
                                currentPage--;
                                renderPage();
                        }
                });
                buttonsDiv.appendChild(prevBtn);

                // Page numbers (show current and nearby pages)
                const maxButtons = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                let endPage = Math.min(totalPages, startPage + maxButtons - 1);

                if (endPage - startPage < maxButtons - 1) {
                        startPage = Math.max(1, endPage - maxButtons + 1);
                }

                if (startPage > 1) {
                        const firstBtn = createPageButton(1);
                        buttonsDiv.appendChild(firstBtn);
                        if (startPage > 2) {
                                const ellipsis = document.createElement('span');
                                ellipsis.textContent = '...';
                                ellipsis.className = 'pagination-ellipsis';
                                buttonsDiv.appendChild(ellipsis);
                        }
                }

                for (let i = startPage; i <= endPage; i++) {
                        buttonsDiv.appendChild(createPageButton(i));
                }

                if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                                const ellipsis = document.createElement('span');
                                ellipsis.textContent = '...';
                                ellipsis.className = 'pagination-ellipsis';
                                buttonsDiv.appendChild(ellipsis);
                        }
                        const lastBtn = createPageButton(totalPages);
                        buttonsDiv.appendChild(lastBtn);
                }

                // Next button
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next →';
                nextBtn.className = 'pagination-btn';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.addEventListener('click', () => {
                        if (currentPage < totalPages) {
                                currentPage++;
                                renderPage();
                        }
                });
                buttonsDiv.appendChild(nextBtn);

                paginationDiv.appendChild(buttonsDiv);
                return paginationDiv;
        }

        function createPageButton(pageNum) {
                const btn = document.createElement('button');
                btn.textContent = pageNum;
                btn.className = 'pagination-btn';
                if (pageNum === currentPage) {
                        btn.classList.add('active');
                        btn.setAttribute('aria-current', 'page');
                }
                btn.addEventListener('click', () => {
                        currentPage = pageNum;
                        renderPage();
                });
                return btn;
        }

        function renderPage() {
                if (!tbody) return;

                // Hide all items
                listItems.forEach(item => item.style.display = 'none');

                // Show current page items
                const start = (currentPage - 1) * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const pageItems = filteredItems.slice(start, end);

                pageItems.forEach(item => {
                        if (!item.hidden) {
                                item.style.display = '';
                        }
                });

                // Remove existing pagination (both top and bottom)
                const existingPaginations = table?.parentNode.querySelectorAll('.pagination');
                existingPaginations?.forEach(p => p.remove());

                if (filteredItems.length > ITEMS_PER_PAGE) {
                        // Add pagination at top (before table)
                        const topPagination = createPagination();
                        if (topPagination && table) {
                                topPagination.classList.add('pagination-top');
                                table.before(topPagination);
                        }

                        // Add pagination at bottom (after table)
                        const bottomPagination = createPagination();
                        if (bottomPagination && table) {
                                table.after(bottomPagination);
                        }
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Search with debouncing
        let searchTimeout;
        input.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                        const searchValue = this.value.trim();

                        if (!searchValue) {
                                filteredItems = [...listItems];
                                listItems.forEach(item => item.hidden = false);
                                currentPage = 1;
                                renderPage();
                                return;
                        }

                        const expression = "(^|.*[^\\p{L}])" +
                                searchValue.split(/\s+/).join("([^\\p{L}]|[^\\p{L}].*[^\\p{L}])") +
                                ".*$";
                        const matcher = new RegExp(expression, 'iu');

                        filteredItems = listItems.filter(item => {
                                const text = item.querySelector('td')?.textContent.replace(/\s+/g, ' ') || '';
                                const matches = matcher.test(text);
                                item.hidden = !matches;
                                return matches;
                        });

                        currentPage = 1;
                        renderPage();
                }, 150);
        }, { passive: true });

        // Theme management
        function getStoredTheme() {
                try {
                        return localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
                } catch (error) {
                        return 'auto';
                }
        }

        function storeTheme(theme) {
                try {
                        localStorage.setItem(THEME_STORAGE_KEY, theme);
                } catch (error) {
                        // Storage not available
                }
        }

        function applyTheme(theme) {
                let actualTheme;

                if (theme === 'auto') {
                        actualTheme = mediaQuery.matches ? 'dark' : 'light';
                        // Listen for system theme changes
                        mediaQuery.addEventListener('change', handleSystemThemeChange);
                } else {
                        actualTheme = theme;
                        // Remove listener if manually set
                        mediaQuery.removeEventListener('change', handleSystemThemeChange);
                }

                root.classList.remove('theme-light', 'theme-dark');
                root.classList.add(`theme-${actualTheme}`);
                root.style.colorScheme = actualTheme;
        }

        function handleSystemThemeChange(event) {
                const storedTheme = getStoredTheme();
                if (storedTheme === 'auto') {
                        applyTheme('auto');
                }
        }

        // Initialize theme
        const storedTheme = getStoredTheme();
        currentThemeIndex = themeOptions.indexOf(storedTheme);
        if (currentThemeIndex === -1) currentThemeIndex = 0;
        applyTheme(storedTheme);
        updateThemeButton();

        // Enable theme transitions only after the initial paint
        requestAnimationFrame(() => root.classList.add('theme-ready'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
                const activeElement = document.activeElement;
                const isTyping = activeElement &&
                        (activeElement.tagName === 'INPUT' ||
                         activeElement.tagName === 'TEXTAREA' ||
                         activeElement.isContentEditable) &&
                        activeElement !== input;

                // '/' or 'Ctrl+F' - Focus search
                if ((event.key === '/' || (event.ctrlKey && event.key === 'f')) && !isTyping) {
                        event.preventDefault();
                        input.focus();
                        input.select();
                        return;
                }

                // 'Escape' - Clear search (when search is focused)
                if (event.key === 'Escape' && activeElement === input) {
                        event.preventDefault();
                        input.value = '';
                        input.dispatchEvent(new Event('input'));
                        input.blur();
                        return;
                }

                // 't' - Toggle theme (not when typing)
                if (event.key === 't' && !isTyping) {
                        event.preventDefault();
                        themeToggle.click();
                        return;
                }
        });

        // Initial render
        renderPage();
}());
