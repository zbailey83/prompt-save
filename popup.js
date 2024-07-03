document.addEventListener('DOMContentLoaded', () => {
  const promptName = document.getElementById('promptName');
  const promptText = document.getElementById('promptText');
  const saveButton = document.getElementById('saveButton');
  const promptList = document.getElementById('promptList');

  // Load saved prompts
  loadPrompts();

  // Save prompt
  saveButton.addEventListener('click', () => {
    const name = promptName.value.trim();
    const text = promptText.value.trim();

    if (name && text) {
      chrome.storage.sync.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        prompts.push({ name, text });
        chrome.storage.sync.set({ prompts }, () => {
          loadPrompts();
          promptName.value = '';
          promptText.value = '';
        });
      });
    }
  });

  // Load and display prompts
  function loadPrompts() {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      promptList.innerHTML = '';

      prompts.forEach((prompt, index) => {
        const promptElement = createPromptElement(prompt, index);
        promptList.appendChild(promptElement);
      });
    });
  }

  // Create prompt element
  function createPromptElement(prompt, index) {
    const promptItem = document.createElement('div');
    promptItem.className = 'prompt-item';

    const promptHeader = document.createElement('div');
    promptHeader.className = 'prompt-header';

    const promptName = document.createElement('span');
    promptName.className = 'prompt-name';
    promptName.textContent = prompt.name;

    const promptPreview = document.createElement('span');
    promptPreview.className = 'prompt-preview';
    promptPreview.textContent = prompt.text.slice(0, 50) + (prompt.text.length > 50 ? '...' : '');

    promptHeader.appendChild(promptName);
    promptHeader.appendChild(promptPreview);

    const promptText = document.createElement('div');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt.text;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(prompt.text).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this prompt?')) {
        chrome.storage.sync.get(['prompts'], (result) => {
          const prompts = result.prompts || [];
          prompts.splice(index, 1);
          chrome.storage.sync.set({ prompts }, loadPrompts);
        });
      }
    });

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(deleteButton);

    promptItem.appendChild(promptHeader);
    promptItem.appendChild(promptText);
    promptItem.appendChild(buttonGroup);

    promptHeader.addEventListener('click', () => {
      promptText.style.display = promptText.style.display === 'none' ? 'block' : 'none';
    });

    return promptItem;
  }
});
