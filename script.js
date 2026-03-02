// ============================================================
//  CONFIGURATION
//  Update GITHUB_OWNER and GITHUB_REPO before pushing to GitHub
// ============================================================
const GITHUB_OWNER = 'YOUR_USERNAME';   // e.g. 'jsmith'
const GITHUB_REPO  = 'neurips-lensing-retreat';

// ============================================================
//  STICKY NAV  — index.html only
// ============================================================
const stickyNav = document.getElementById('stickyNav');
if (stickyNav) {
  const hero = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    if (hero && window.scrollY > hero.offsetHeight - 80) {
      stickyNav.classList.add('visible');
    } else {
      stickyNav.classList.remove('visible');
    }
  });
}

// ============================================================
//  PROJECTS PAGE  — fetch open GitHub Issues
// ============================================================
const projectsGrid = document.getElementById('projects-grid');
if (projectsGrid) {
  const newIssueLink = document.getElementById('new-issue-link');
  if (newIssueLink) {
    newIssueLink.href = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new`;
  }
  loadProjects();
}

async function loadProjects() {
  const loading = document.getElementById('projects-loading');
  const grid    = document.getElementById('projects-grid');
  const errBox  = document.getElementById('projects-error');

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=50`
    );
    if (!res.ok) throw new Error(`GitHub API responded with status ${res.status}`);

    const issues = await res.json();
    const projectIssues = issues.filter(i => !i.pull_request);

    loading.style.display = 'none';

    if (projectIssues.length === 0) {
      grid.style.display = 'grid';
      grid.innerHTML = `
        <div id="projects-empty">
          <p style="font-size:1.4rem; margin-bottom:0.5rem;">No projects yet</p>
          <p>Be the first! <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new"
             target="_blank" rel="noopener" style="color:var(--accent);">Open an issue →</a></p>
        </div>`;
      return;
    }

    grid.style.display = 'grid';
    grid.innerHTML = projectIssues.map(renderProjectCard).join('');

  } catch (err) {
    console.error(err);
    loading.style.display = 'none';
    errBox.style.display = 'block';
  }
}

function renderProjectCard(issue) {
  const author = issue.user?.login ?? 'unknown';
  const date = new Date(issue.created_at).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const labels = issue.labels.map(l => {
    const hex = l.color || '1b4965';
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    return `<span class="project-label"
              style="background:rgba(${r},${g},${b},0.15); color:#${hex};">
              ${esc(l.name)}
            </span>`;
  }).join('');

  const rawBody  = issue.body ?? '';
  const bodyText = rawBody.length > 220
    ? rawBody.slice(0, 220) + '…'
    : (rawBody || '<em>No description provided.</em>');

  return `
    <div class="project-card">
      <div class="project-number">#${issue.number} · ${date}</div>
      <div class="project-title">${esc(issue.title)}</div>
      <div class="project-body">${esc(bodyText)}</div>
      <div class="project-meta">
        <span>by <strong>${esc(author)}</strong></span>
        ${labels}
        <a class="project-gh-link" href="${issue.html_url}" target="_blank" rel="noopener">
          View on GitHub →
        </a>
      </div>
    </div>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
