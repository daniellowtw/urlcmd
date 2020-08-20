import React from "react";
import ReactDOM from 'react-dom';
import App from "./App";

// Entry point, bootstrap and check if requirements are met.
if (supports_html5_storage()) {
    document.addEventListener("DOMContentLoaded", function (event) {
        ReactDOM.render(
            <div>
                <App />
            </div>,
            document.getElementById('app')
        );
    });
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
