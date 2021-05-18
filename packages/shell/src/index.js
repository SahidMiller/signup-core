import "regenerator-runtime";

function loadComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

//TODO God willing, fetch from localstorage the previous IPNS hash
// load that CID from preferred gateway, God willing.
// Check for updated CID from same IPNS hash
const scriptPromise = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  document.body.appendChild(script);
  script.onload = resolve;
  script.onerror = reject;
  script.async = true;
  script.src = '//localhost:5051/js/signupCoreEntry.js';
});

scriptPromise.then(loadComponent("SignupCore", "."))