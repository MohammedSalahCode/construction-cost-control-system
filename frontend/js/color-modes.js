/**
 * Theme Switcher
 *
 * Handles theme persistence, system preference detection,
 * theme switching, and theme menu updates.
 */

(() => {
  const THEME = 'construction-cost-control-theme';

  /**
   * Retrieves the stored theme preference from localStorage
   * @returns {string|null} Theme name ('light', 'dark', 'auto') or null
   */
  const getStoredTheme = () => localStorage.getItem(THEME);

  /**
   * Saves the theme preference to localStorage
   * @param {string} theme - Theme name ('light', 'dark', or 'auto')
   */
  const setStoredTheme = theme => localStorage.setItem(THEME, theme);

  /**
   * Determines the preferred theme based on stored preference or system setting
   * @returns {string} Preferred theme ('light' or 'dark')
   */
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  /**
   * Applies the theme to the document and dispatches a change event
   * @param {string} theme - Theme to apply ('light', 'dark', or 'auto')
   */
  const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-coreui-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-coreui-theme', theme);
    }
    const event = new Event('ColorSchemeChange');
    document.documentElement.dispatchEvent(event);
  };
  setTheme(getPreferredTheme());

  /**
   * Updates the theme toggle UI to reflect the active theme
   * @param {string} theme - Currently active theme
   */
  const showActiveTheme = theme => {
    const activeThemeIcon = document.querySelector('.theme-icon-active');
    const btnToActive = document.querySelector(`[data-coreui-theme-value="${theme}"]`);
    if (!btnToActive) {
        return;
    }
    for (const element of document.querySelectorAll('[data-coreui-theme-value]')) {
        element.classList.remove('active');
    }
    btnToActive.classList.add('active');
    if (!activeThemeIcon) {
        return;
    }
    const selectedIcon = btnToActive.querySelector('i');
    if (!selectedIcon) {
        return;
    }
    const themeIcons = ['cil-sun', 'cil-moon', 'cil-contrast'];
    activeThemeIcon.classList.remove(...themeIcons);
    const matchedIcon = themeIcons.find(icon => selectedIcon.classList.contains(icon));
    activeThemeIcon.classList.add(matchedIcon || 'cil-contrast');
  };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme());
    }
  });
  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme());
    for (const toggle of document.querySelectorAll('[data-coreui-theme-value]')) {
      toggle.addEventListener('click', () => {
        const theme = toggle.getAttribute('data-coreui-theme-value');
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme);
      });
    }
  });
})();
//# sourceMappingURL=color-modes.js.map