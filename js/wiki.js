/* Wiki Website Client Helpers — Atlas of Tesseract City */
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose'
});

document.addEventListener('DOMContentLoaded', () => {
  // Add Download Script buttons to all code blocks
  document.querySelectorAll('pre code').forEach((codeBlock, idx) => {
    const pre = codeBlock.parentElement;
    if (pre && !pre.closest('.code-block-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      
      const filename = codeBlock.getAttribute('data-filename') || `script_${idx + 1}.txt`;
      
      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `<span>📄 ${filename}</span>`;
      
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'code-download-btn';
      downloadBtn.textContent = '⬇ Download Script';
      downloadBtn.addEventListener('click', () => {
        const text = codeBlock.textContent || '';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      });
      
      header.appendChild(downloadBtn);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    }
  });

  // 2. Client-side Search with search-index.json support
  let searchIndex = null;
  try {
    const res = await fetch('search-index.json');
    if (res.ok) {
      searchIndex = await res.json();
    }
  } catch {}

  const searchInput = document.getElementById('wiki-search');
  if (searchInput) {
    const searchContainer = searchInput.parentElement;
    if (searchContainer) {
      searchContainer.style.position = 'relative';

      const resultsDropdown = document.createElement('div');
      resultsDropdown.className = 'search-results-dropdown';
      resultsDropdown.style.display = 'none';
      searchContainer.appendChild(resultsDropdown);

      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        
        // Filter sidebar nav links
        document.querySelectorAll('.wiki-nav-item').forEach(el => {
          const text = el.textContent.toLowerCase();
          el.style.display = (!q || text.includes(q)) ? '' : 'none';
        });

        if (!q || q.length < 2 || !searchIndex) {
          resultsDropdown.style.display = 'none';
          return;
        }

        const matches = searchIndex.filter(item => {
          const titleMatch = item.title && item.title.toLowerCase().includes(q);
          const snippetMatch = item.snippet && item.snippet.toLowerCase().includes(q);
          const keywordMatch = item.keywords && item.keywords.some(k => k.toLowerCase().includes(q));
          return titleMatch || snippetMatch || keywordMatch;
        }).slice(0, 8);

        if (matches.length === 0) {
          resultsDropdown.innerHTML = '<div style="padding:10px; color:#94a3b8; font-size:11px;">No articles matching "' + q + '"</div>';
          resultsDropdown.style.display = 'block';
          return;
        }

        resultsDropdown.innerHTML = matches.map(function(m) {
          return '<div class="search-result-item" onclick="window.location.href=\'' + m.filename + '\'">' +
            '<div class="search-result-title">📄 ' + (m.title || m.filename) + '</div>' +
            '<div class="search-result-snippet">' + (m.snippet || '').substring(0, 110) + '...</div>' +
          '</div>';
        }).join('');
        resultsDropdown.style.display = 'block';
      });

      document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
          resultsDropdown.style.display = 'none';
        }
      });
    }
  }
});
