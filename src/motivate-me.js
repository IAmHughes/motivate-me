const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const query = core.getInput('query', { required: false });
    const rating = core.getInput('rating', { required: false });
    const lang = core.getInput('lang', { required: false });
    const staleDays = core.getInput('stale_days', { required: false });

    // Gather list of open pull requests on the repository
    // API Documentation: https://developer.github.com/v3/pulls/#list-pull-requests
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-pulls-list
    const listPullRequestsResponse = await github.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'updated'
    });

    core.debug(`Successfully received list of active PRs for ${owner}/${repo}`);

    // Iterate through pull requests returned above and check date of last activity (`updated_at` field)
    // For each PR that matches stale filter:
    // Use index of PR in array for offset in below query for GIF on GIPHY
    // Create a comment
    let i;
    let prNumber;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < listPullRequestsResponse.data.length; i++) {
      const updatedAt = new Date(listPullRequestsResponse.data[i].updated_at);
      const today = new Date();

      core.debug(`dateMath: \n updated_at: ${updatedAt} update_at.getTime(): ${updatedAt.getTime()} > 
      todayDate: ${today} today.getDate: ${today.getDate()} - staleDays: ${staleDays} = ${today.setDate(
        today.getDate() - staleDays
      )}; bool: ${updatedAt.getTime() > today.setDate(today.getDate() - staleDays)}`);

      if (updatedAt.getTime() > today.setDate(today.getDate() - staleDays)) {
        prNumber = listPullRequestsResponse.data[i].number;
        core.debug(`prNumber: ${prNumber}`);
      }

      // Query GIPHY for a GIF!
      // API Documentation: https://developers.giphy.com/docs/api/endpoint/#search
      const searchForGifResponse = await axios.get(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${query}&limit=25&offset=0&rating=${rating}&lang=${lang}`
      );

      core.debug(`Successfully queried GIPHY with query: ${query}, rating: ${rating}, and lang: ${lang}`);

      // Get the ID, title, and GIF URL for the GIF from the response
      const {
        title: gifTitle,
        images: {
          original: { url: gifUrl }
        }
      } = searchForGifResponse.data.data[0];

      core.debug(`\n\n\n\n\n\n\n\n\n\n\n`);
      core.debug(`gifTitle: ${JSON.stringify(gifTitle)}`);
      core.debug(`\n\n\n\n\n\n\n\n\n\n\n`);
      core.debug(`gifUrl: ${JSON.stringify(gifUrl)}`);
      core.debug(`\n\n\n\n\n\n\n\n\n\n\n`);

      // Create a comment
      // API Documentation: https://developer.github.com/v3/issues/comments/#create-a-comment
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-issues-create-comment
      await github.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `Get motivated!\n\n![${gifTitle}](${gifUrl})`
      });
      core.debug(`Successfully created comment on PR#: ${prNumber} and gifTitle: ${gifTitle} - ${gifUrl}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
