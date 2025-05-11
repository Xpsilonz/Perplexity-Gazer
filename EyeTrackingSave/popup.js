document.addEventListener('DOMContentLoaded', () => {
  const viewBtn = document.getElementById('viewText');
  const clearBtn = document.getElementById('clearText');
  const status = document.getElementById('status');
  const textList = document.getElementById('textList');
  const themeToggle = document.getElementById('themeToggle');

  // Function to update text list
  function updateTextList(data) {
    textList.innerHTML = ''; // Clear existing list
    if (data && data.length > 0) {
      data.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'text-item';
        div.innerHTML = `${item.text.substring(0, 50)}${
          item.text.length > 50 ? '...' : ''
        } <span>(${new Date(item.timestamp).toLocaleTimeString()})</span>`;
        div.setAttribute('data-fulltext', item.text); // Moved inside loop
        textList.appendChild(div);
      });
      status.textContent = `Status: ${data.length} items saved`;
      status.style.backgroundColor = document.body.classList.contains('dark')
        ? '#4a7043'
        : '#d4edda';
    } else {
      textList.innerHTML = '<p>No text saved yet.</p>';
      status.textContent = 'Status: No data';
      status.style.backgroundColor = document.body.classList.contains('dark')
        ? '#555'
        : '#e9ecef';
    }
  }

  // View saved text
  viewBtn.addEventListener('click', () => {
    viewBtn.disabled = true;
    status.textContent = 'Status: Loading...';
    status.classList.add('loading');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getText' }, (response) => {
        viewBtn.disabled = false;
        status.classList.remove('loading');
        if (response && response.data) {
          updateTextList(response.data);
        } else {
          updateTextList([]);
        }
      });
    });
  });

  // Clear text
  clearBtn.addEventListener('click', () => {
    clearBtn.disabled = true;
    status.textContent = 'Status: Clearing...';
    status.classList.add('loading');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'clearText' }, (response) => {
        clearBtn.disabled = false;
        status.classList.remove('loading');
        if (response && response.status === 'textCleared') {
          updateTextList([]);
          status.textContent = 'Status: Text cleared';
          status.style.backgroundColor = document.body.classList.contains('dark')
            ? '#723b42'
            : '#f8d7da';
        } else {
          status.textContent = 'Status: Error clearing text';
          status.style.backgroundColor = document.body.classList.contains('dark')
            ? '#723b42'
            : '#f8d7da';
        }
      });
    });
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark')
      ? 'Light Theme'
      : 'Dark Theme';
    if (status.textContent.includes('items saved')) {
      status.style.backgroundColor = document.body.classList.contains('dark')
        ? '#4a7043'
        : '#d4edda';
    } else if (status.textContent.includes('Text cleared') || status.textContent.includes('Error')) {
      status.style.backgroundColor = document.body.classList.contains('dark')
        ? '#723b42'
        : '#f8d7da';
    } else {
      status.style.backgroundColor = document.body.classList.contains('dark')
        ? '#555'
        : '#e9ecef';
    }
  });

  // Initial load
  status.textContent = 'Status: Ready';
});