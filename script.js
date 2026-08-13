/* Tech & AI Insights Hub — homepage feed
   Fetches posts/posts.json, renders post cards, and handles category filtering. */

const CATEGORIES = ['All', 'AI News', 'AI Update', 'Top 5 AI', 'Automation Workflow'];

const CATEGORY_CLASS = {
  'AI News': 'tag--ai-news',
  'AI Update': 'tag--ai-update',
  'Top 5 AI': 'tag--top-5',
  'Automation Workflow': 'tag--automation'
};

let allPosts = [];
let activeFilter = 'All';

async function loadPosts() {
  const grid = document.getElementById('posts-grid');
  try {
    const res = await fetch('posts/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('posts.json request failed: ' + res.status);
    allPosts = await res.json();
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderStatusLine();
    renderFilters();
    renderPosts();
  } catch (err) {
    renderStatusLine();
    grid.innerHTML = `
      <div class="empty-state">
        <h3>Couldn't load the post feed</h3>
        <p>posts/posts.json didn't load. If you're viewing this as a local file, serve it over http(s) instead — GitHub Pages works.</p>
      </div>`;
  }
}

function renderStatusLine() {
  const el = document.getElementById('status-line');
  if (!el) return;
  if (!allPosts.length) {
    el.innerHTML = `<span class="dot"></span>Publishes daily via GitHub Actions`;
    return;
  }
  const count = allPosts.length;
  const latest = formatDate(allPosts[0].date);
  el.innerHTML = `<span class="dot"></span>${count} article${count === 1 ? '' : 's'} · latest ${latest} · publishes daily via GitHub Actions`;
}

function renderFilters() {
  const wrap = document.getElementById('filters');
  wrap.innerHTML = CATEGORIES.map(cat =>
    `<button type="button" class="filter-pill${cat === activeFilter ? ' active' : ''}" data-cat="${cat}" aria-pressed="${cat === activeFilter}">${cat}</button>`
  ).join('');
  wrap.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderPosts();
    });
  });
}

function renderPosts() {
  const grid = document.getElementById('posts-grid');
  const filtered = activeFilter === 'All' ? allPosts : allPosts.filter(p => p.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No posts in "${escapeHtml(activeFilter)}" yet</h3>
        <p>New articles publish daily — check back soon, or pick another category above.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(post => `
    <article class="post-card">
      <div class="post-meta">
        <span class="tag ${CATEGORY_CLASS[post.category] || 'tag--ai-news'}">${escapeHtml(post.category || 'AI News')}</span>
        <time class="date" datetime="${escapeHtml(post.date || '')}">${formatDate(post.date)}</time>
      </div>
      <h3><a href="${escapeAttr(post.url)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt || '')}</p>
      <a href="${escapeAttr(post.url)}" class="read-more">Read Article
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </article>
  `).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr || '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str = '') {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', loadPosts);
