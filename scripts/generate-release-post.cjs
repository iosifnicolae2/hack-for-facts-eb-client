'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

function getLatestTag() {
  try {
    return run('git describe --tags --abbrev=0');
  } catch {
    return '';
  }
}

function getRepoHttpsUrl() {
  try {
    const remote = run('git config --get remote.origin.url');
    if (remote.startsWith('git@github.com:')) {
      const repo = remote.replace('git@github.com:', '').replace(/\.git$/, '');
      return `https://github.com/${repo}`;
    }
    if (remote.startsWith('https://github.com/')) {
      return remote.replace(/\.git$/, '');
    }
    return '';
  } catch {
    return '';
  }
}

function getCommitsSince(tag) {
  const range = tag ? `${tag}..HEAD` : '';
  const sepField = '\u001f';
  const sepRec = '\u001e';
  const raw = run(`git log ${range} --no-merges --pretty=format:%H${sepField}%s${sepField}%b${sepRec}`);
  if (!raw) return [];
  return raw
    .split('\u001e')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((rec) => {
      const [hash, subject, body] = rec.split('\u001f');
      const m = subject.match(/^(\w+)(?:\(([\w\-\.\/\s]+)\))?(!)?:\s+(.+)$/);
      const type = m ? m[1] : 'other';
      const scope = m && m[2] ? m[2] : '';
      const bang = Boolean(m && m[3]);
      const desc = m ? m[4] : subject;
      const breaking = bang || /(^|\n)BREAKING CHANGE:/.test(body || '');
      return { hash, type, scope, desc, body, breaking };
    });
}

function computeBump(commits) {
  const hasBreaking = commits.some((c) => c.breaking);
  if (hasBreaking) return 'major';
  const hasFeat = commits.some((c) => c.type === 'feat');
  if (hasFeat) return 'minor';
  const hasPatch = commits.some((c) => ['fix', 'perf', 'refactor', 'revert'].includes(c.type));
  return hasPatch ? 'patch' : null;
}

function incVersion(prev, bump) {
  const parts = (prev || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
  let [maj, min, pat] = parts;
  if (bump === 'major') {
    maj += 1; min = 0; pat = 0;
  } else if (bump === 'minor') {
    min += 1; pat = 0;
  } else if (bump === 'patch') {
    pat += 1;
  }
  return `${maj}.${min}.${pat}`;
}

function groupCommits(commits) {
  const groups = new Map([
    ['breaking', []],
    ['feat', []],
    ['fix', []],
    ['perf', []],
    ['refactor', []],
    ['docs', []],
    ['build', []],
    ['ci', []],
    ['chore', []],
    ['test', []],
    ['style', []],
    ['revert', []],
    ['other', []],
  ]);
  for (const c of commits) {
    if (c.breaking) groups.get('breaking').push(c);
    const key = groups.has(c.type) ? c.type : 'other';
    groups.get(key).push(c);
  }
  return groups;
}

function formatDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatSection(title, commits, repoUrl) {
  if (!commits || commits.length === 0) return '';
  const lines = commits.map((c) => {
    const scope = c.scope ? `**${c.scope}**: ` : '';
    const short = c.hash.slice(0, 7);
    const link = repoUrl ? ` ([${short}](${repoUrl}/commit/${c.hash}))` : ` (${short})`;
    return `- ${scope}${c.desc}${link}`;
  });
  return `\n### ${title}\n\n${lines.join('\n')}\n`;
}

function main() {
  const repoUrl = getRepoHttpsUrl();
  const previousTag = getLatestTag();
  const prevVersion = previousTag.replace(/^v/, '') || '0.0.0';
  const commits = getCommitsSince(previousTag);
  if (commits.length === 0) {
    console.log('No new commits; skipping release note generation.');
    return;
  }
  const bump = computeBump(commits);
  if (!bump) {
    console.log('No relevant conventional commits; skipping.');
    return;
  }
  const newVersion = incVersion(prevVersion, bump);

  const groups = groupCommits(commits);
  const dateStr = formatDate();
  const fileName = `${dateStr}-v${newVersion}.mdx`;
  const releasesDir = path.join(__dirname, '..', 'docs-site', 'releases');
  const outPath = path.join(releasesDir, fileName);

  if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir, { recursive: true });
  if (fs.existsSync(outPath)) {
    console.log(`Release post already exists: ${outPath}`);
    return;
  }

  let body = '';
  body += formatSection('⚠️ Breaking Changes', groups.get('breaking'), repoUrl);
  body += formatSection('✨ Features', groups.get('feat'), repoUrl);
  body += formatSection('🐞 Fixes', groups.get('fix'), repoUrl);
  body += formatSection('⚡ Performance', groups.get('perf'), repoUrl);
  body += formatSection('🧹 Refactors', groups.get('refactor'), repoUrl);
  body += formatSection('📝 Docs', groups.get('docs'), repoUrl);
  body += formatSection('🏗️ Build', groups.get('build'), repoUrl);
  body += formatSection('🧪 Tests', groups.get('test'), repoUrl);
  body += formatSection('🔧 CI', groups.get('ci'), repoUrl);
  body += formatSection('📦 Chore', groups.get('chore'), repoUrl);
  body += formatSection('🎨 Style', groups.get('style'), repoUrl);
  body += formatSection('Other', groups.get('other'), repoUrl);

  if (repoUrl && previousTag) {
    body += `\n---\n\n[Full changelog](${repoUrl}/compare/${previousTag}...v${newVersion})\n`;
  }

  if (!body.trim()) {
    console.log('Empty body after grouping; skipping.');
    return;
  }

  const frontmatter = [
    '---',
    `title: Release v${newVersion}`,
    `date: ${new Date().toISOString()}`,
    'authors: [claudiu]',
    'tags: [release]',
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(outPath, `${frontmatter}${body}\n`);
  fs.writeFileSync(path.join(__dirname, '..', '.release-version'), `${newVersion}\n`);
  fs.writeFileSync(path.join(__dirname, '..', '.release-post-path'), `${path.relative(path.join(__dirname, '..'), outPath)}\n`);

  console.log(`Generated release notes: ${path.relative(path.join(__dirname, '..'), outPath)}`);
}

try {
  main();
} catch (err) {
  console.error('Failed to generate release post:', err);
  process.exit(1);
}


