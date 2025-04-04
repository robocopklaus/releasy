import * as core from '@actions/core';
import * as github from '@actions/github';
import { gt, valid } from 'semver';
import Handlebars from 'handlebars';

interface Commit {
  type: string;
  scope: string | null;
  subject: string;
  message: string;
  breaking: boolean;
}

interface Tag {
  name: string;
  version: string;
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github_token', { required: true });
    const tagPrefix = core.getInput('tag_prefix') || 'v';
    const dryRun = core.getBooleanInput('dry_run');
    const releaseNotesTemplate = core.getInput('release_notes_template');

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Get all tags
    const { data: tags } = await octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100
    });

    // Find the latest semantic version tag
    const latestTag = tags
      .filter((tag: { name: string }) => tag.name.startsWith(tagPrefix))
      .map((tag: { name: string }) => ({
        name: tag.name,
        version: tag.name.replace(tagPrefix, '')
      }))
      .filter((tag: Tag) => valid(tag.version))
      .sort((a: Tag, b: Tag) => gt(a.version, b.version) ? -1 : 1)[0];

    if (!latestTag) {
      core.setFailed('No valid semantic version tag found');
      return;
    }

    // Get commits since the latest tag
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: 'main',
      since: latestTag.name
    });

    // Parse and categorize commits
    const parsedCommits: Commit[] = commits
      .map(commit => {
        // Simple parsing based on conventional commits format
        const message = commit.commit.message;
        const match = message.match(/^(feat|fix|chore|docs|refactor|perf|test)(!?)(?:\(([^)]+)\))?: (.+)/);
        
        if (!match) {
          return {
            type: 'chore',
            scope: null,
            subject: message,
            message: message,
            breaking: false
          };
        }
        
        const [, type, isBreaking, scope, subject] = match;
        const breaking = isBreaking === '!' || message.includes('BREAKING CHANGE:');
        
        return {
          type,
          scope: scope || null,
          subject,
          message,
          breaking
        };
      });

    // Categorize commits
    const categorizedCommits = {
      features: parsedCommits.filter(c => c.type === 'feat'),
      fixes: parsedCommits.filter(c => c.type === 'fix'),
      breaking: parsedCommits.filter(c => c.breaking)
    };

    // Determine version bump
    let newVersion = latestTag.version;
    if (categorizedCommits.breaking.length > 0) {
      newVersion = incrementVersion(newVersion, 'major');
    } else if (categorizedCommits.features.length > 0) {
      newVersion = incrementVersion(newVersion, 'minor');
    } else if (categorizedCommits.fixes.length > 0) {
      newVersion = incrementVersion(newVersion, 'patch');
    }

    // Generate release notes
    const template = Handlebars.compile(releaseNotesTemplate);
    const releaseNotes = template({
      version: newVersion,
      ...categorizedCommits
    });

    if (dryRun) {
      core.info('Dry run - would create/update release with:');
      core.info(`Version: ${newVersion}`);
      core.info('Release notes:');
      core.info(releaseNotes);
      return;
    }

    // Create or update draft release
    const tagName = `${tagPrefix}${newVersion}`;
    const releaseName = `Release ${newVersion}`;

    // Check if draft release already exists
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner,
      repo
    });

    const existingDraft = releases.find(r => r.draft && r.tag_name === tagName);

    if (existingDraft) {
      // Update existing draft
      const { data: release } = await octokit.rest.repos.updateRelease({
        owner,
        repo,
        release_id: existingDraft.id,
        tag_name: tagName,
        name: releaseName,
        body: releaseNotes,
        draft: true
      });

      core.setOutput('release_url', release.html_url);
      core.setOutput('release_id', release.id.toString());
    } else {
      // Create new draft
      const { data: release } = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: releaseName,
        body: releaseNotes,
        draft: true
      });

      core.setOutput('release_url', release.html_url);
      core.setOutput('release_id', release.id.toString());
    }

    core.setOutput('new_version', newVersion);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

run(); 