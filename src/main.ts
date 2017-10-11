import { LocalStorageStore } from './store/store';
import { App } from './commands/app';
import { windowUI } from './ui/ui';

// Bootstrap and check if requirements are met.
if (supports_html5_storage()) {
    const app = new App();
    // Execute command before window loads to save time
    app.executeCmd(window.location)
    const ui = new windowUI(app);
} else {
    document.write("This app requires Localstorage but it is not supported by your browser. Please use a newer browser.")
}

// supports_html5_storage checks if the user agent supports localStorage.
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
