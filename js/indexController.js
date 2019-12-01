let userConsent = false;


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    new IndexController();
  });
}

function IndexController() {
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {
  
  if (!navigator.serviceWorker) return;

  let indexController = this;

  navigator.serviceWorker.register('./sw.js').then((reg) => {
    console.log('ServiceWorker registration successful with scope: ', reg.scope);

  
    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      indexController._updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      indexController._trackInstalling(reg.installing);
      return;
    }

  
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      indexController._trackInstalling(newWorker);
    });
  }).catch((err) =>{
    console.log('ServiceWorker registration failed: ', err);
  });

  
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
};


IndexController.prototype._trackInstalling = function(worker) {
  let indexController = this;
  worker.addEventListener('statechange', () => {
    if (worker.state == 'installed') {
      indexController._updateReady(worker);
    }
  });
};

IndexController.prototype._updateReady = function (worker) {
  userConsent = confirm("New version available. Do you want to update?");

  if (!userConsent) return;
  worker.postMessage('updateSW');

};
