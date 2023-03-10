export class Install {
    /**
     * @param {DOMElement} trigger - Triggering element
     */
    constructor(trigger) {
      this._trigger = trigger;
      this._trigger.addEventListener('click', (e) => {
        if (this._installEvent) {
            this._installEvent.prompt();
        }
      });
    }
  
    /**
     * Toggle visibility of install button
     * @param {string} action
     */
    toggleInstallButton(action, installEvent) {
        this._installEvent = installEvent;
      if (action === 'hide') {
        this._trigger.style.display = 'none';
      } else {
        this._trigger.style.display = 'block';
      }
    }
  }